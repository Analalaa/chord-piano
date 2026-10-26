import test from 'node:test';
import assert from 'node:assert/strict';
import { getChord, getInversionOptions, getVoicing } from './dist/music.js';
import { COMPARISONS, PROGRESSIONS, COURSES, CORRECTIONS, SOURCES } from './dist/lessons.js';

const pc = midi => ((midi % 12) + 12) % 12;
const pitchSet = notes => [...new Set(notes.map(pc))].sort((a, b) => a - b);
const chordSet = chord => [...new Set(chord.tones.map(tone => tone.pc))].sort((a, b) => a - b);

function namedPitch(name) {
  const match = /^([A-G])([♯♭]*)(-?\d+)?$/.exec(name);
  assert.ok(match, `Unrecognised teaching pitch: ${name}`);
  const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]];
  const alteration = [...match[2]].reduce((sum, accidental) => sum + (accidental === '♯' ? 1 : -1), 0);
  return match[3] === undefined ? pc(natural + alteration) : (Number(match[3]) + 1) * 12 + natural + alteration;
}

function checkReference(reference, context) {
  assert.ok(Number.isInteger(reference.root) && reference.root >= 0 && reference.root <= 11, `${context}: valid root`);
  return assert.doesNotThrow(() => getChord(reference.root, reference.type), `${context}: chord exists`);
}

test('lesson selections have stable IDs and all chord references resolve', () => {
  // These IDs live in separate comparison, progression and course selectors.
  const collections = { comparisons: COMPARISONS, progressions: PROGRESSIONS, courses: COURSES };
  const scopedIDs = new Set();
  for (const [namespace, collection] of Object.entries(collections)) {
    assert.ok(collection.length, `${namespace} is populated`);
    assert.equal(new Set(collection.map(item => item.id)).size, collection.length, `${namespace}: unique IDs`);
    for (const item of collection) {
      assert.match(item.id, /^[a-z][a-z0-9-]*$/);
      assert.ok(item.title);
      const scopedID = `${namespace}:${item.id}`;
      assert.ok(!scopedIDs.has(scopedID));
      scopedIDs.add(scopedID);
    }
  }
  for (const comparison of COMPARISONS) {
    checkReference(comparison.left, comparison.id + ' left');
    checkReference(comparison.right, comparison.id + ' right');
    assert.ok(comparison.listen && comparison.change);
  }
  for (const progression of PROGRESSIONS) for (const chord of progression.chords) checkReference(chord, progression.id);
  assert.ok(COURSES.some(course => course.id === 'connection'), 'the connection lesson is available');
  assert.ok(PROGRESSIONS.some(progression => progression.id === 'major-251'), 'its named practice progression is available');
});

test('course steps use available modes and real inversion basses', () => {
  for (const course of COURSES) {
    assert.ok(course.minutes > 0 && Number.isFinite(course.minutes), course.id + ': practice duration');
    assert.ok(course.steps.length > 0, course.id + ': steps exist');
    for (const [index, step] of course.steps.entries()) {
      const context = `${course.id} step ${index + 1}`;
      checkReference(step, context);
      assert.ok(['close', 'split'].includes(step.mode), context + ': supported voicing mode');
      assert.ok(['build', 'play'].includes(step.task), context + ': supported practice task');
      assert.ok(step.title && step.body && step.goal, context + ': instructions and completion goal');
      const option = getInversionOptions(step.root, step.type).find(item => item.value === step.inversion);
      assert.ok(option, context + ': inversion exists');
      if (step.mode === 'split') assert.equal(step.inversion, 0, context + ': split arrangement uses root bass');
      const arrangement = getVoicing(step.root, step.type, step);
      assert.equal(arrangement.bassName, option.bassName, context + ': real lowest note agrees with the selected inversion');
      if (step.notes) {
        const expected = new Set(getChord(step.root, step.type).tones.map(tone => tone.pc));
        assert.ok(step.notes.every(note => expected.has(pc(note))), context + ': custom voicing is part of this chord');
      }
    }
  }
});

test('build answers always contain the complete chord rather than an omitted piano arrangement', () => {
  const buildSteps = COURSES.flatMap(course => course.steps.filter(step => step.task === 'build'));
  assert.ok(buildSteps.length > 0, 'there are active construction exercises');
  for (const step of buildSteps) {
    const chord = getChord(step.root, step.type);
    const actual = step.notes || getVoicing(step.root, step.type, step).notes.map(note => note.midi);
    assert.deepEqual(pitchSet(actual), chordSet(chord), step.title + ': all and only the complete target pitch classes');
    if (!step.notes) assert.deepEqual(getVoicing(step.root, step.type, step).omitted, [], step.title + ': no omitted target tones');
    assert.deepEqual(pitchSet(actual.map(note => note + 12)), pitchSet(actual), step.title + ': the same answer in another octave');
  }
});

for (const progression of PROGRESSIONS) {
  test(`${progression.title}: arrangements match the harmony, bass and playable right-hand range`, () => {
    assert.ok(progression.chords.length >= 2);
    for (const entry of progression.chords) {
      const chord = getChord(entry.root, entry.type);
      const allowed = new Set(chord.tones.map(tone => tone.pc));
      assert.ok(entry.notes.length >= 4 && entry.notes.length <= 5, entry.label + ': bass plus a compact right-hand part');
      assert.ok(entry.notes.every(note => Number.isInteger(note) && note >= 36 && note <= 84), entry.label + ': keyboard range');
      assert.deepEqual(entry.notes, [...entry.notes].sort((a, b) => a - b), entry.label + ': ascending actual pitches');
      assert.ok(entry.notes.every(note => allowed.has(pc(note))), entry.label + ': no note from outside the named chord');
      assert.ok(entry.notes.some(note => pc(note) === entry.root), entry.label + ': the root is present');
      const slash = entry.label.includes('/') ? entry.label.split('/').at(-1) : null;
      const expectedBass = slash ? namedPitch(slash) : entry.root;
      assert.equal(pc(entry.notes[0]), expectedBass, entry.label + ': actual lowest note matches the chord or slash bass');
      const right = entry.notes.slice(1);
      assert.ok(right.at(-1) - right[0] <= 12, entry.label + ': right-hand span is no wider than an octave');
      for (const degree of chord.tones.filter(tone => /3$|7$/.test(tone.degree))) {
        assert.ok(entry.notes.some(note => pc(note) === degree.pc), entry.label + ': preserves ' + degree.degree);
      }
      for (const namedExtension of chord.tones.filter(tone => /9$|11$|13$/.test(tone.degree))) {
        assert.ok(entry.notes.some(note => pc(note) === namedExtension.pc), entry.label + ': retains its named extension ' + namedExtension.degree);
      }
    }
  });
}

test('the sixth course plays exactly the demonstrated major ii–V–I and its promised guide tones', () => {
  const course = COURSES.find(item => item.id === 'connection');
  const progression = PROGRESSIONS.find(item => item.id === 'major-251');
  assert.equal(COURSES.indexOf(course), 5, 'this is the sixth course');
  for (let index = 0; index < 3; index++) {
    const step = course.steps[index];
    const demonstration = progression.chords[index];
    assert.equal(step.root, demonstration.root);
    assert.equal(step.type, demonstration.type);
    assert.deepEqual(step.notes, demonstration.notes, step.title + ': same actual octaves as the progression');
  }
  assert.deepEqual(course.steps.at(-1).notes, progression.chords.at(-1).notes, 'the final practice step keeps the demonstrated landing chord');
  const [dm, dominant, tonic] = course.steps.map(step => step.notes);
  assert.ok(dm.includes(53) && dominant.includes(53), 'F3 is retained from Dm7 into G7');
  assert.ok(dm.includes(60) && dominant.includes(59), 'C4 can descend a semitone to B3');
  assert.ok(dominant.includes(53) && tonic.includes(52), 'F3 descends a semitone to E3');
  assert.ok(dominant.includes(59) && tonic.includes(59), 'B3 is retained as the tonic major seventh');
});

test('each voice-motion callout can be heard between actual consecutive arrangements', () => {
  for (const progression of PROGRESSIONS) for (const motion of progression.motion) {
    const from = namedPitch(motion.from);
    const to = namedPitch(motion.to);
    assert.ok(progression.chords.some((chord, index, all) => index < all.length - 1 && chord.notes.includes(from) && all[index + 1].notes.includes(to)), `${progression.id}: ${motion.from} → ${motion.to} exists in the displayed pitches`);
    assert.ok(motion.text);
  }
});

test('reading notes are complete and source references are usable HTTPS links', () => {
  assert.ok(CORRECTIONS.length > 0);
  for (const correction of CORRECTIONS) assert.ok(correction.title && correction.body);
  for (const source of SOURCES) {
    assert.ok(source.title && source.description);
    assert.equal(new URL(source.url).protocol, 'https:');
  }
  assert.equal(new Set(SOURCES.map(source => source.url)).size, SOURCES.length, 'no duplicate source links');
});
