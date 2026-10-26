import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOTS, CHORDS, getChord, getVoicing, getInversionOptions} from './dist/music.js';

const mod = n => ((n%12)+12)%12;
const natural = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function spellingPc(name) {
  return mod(natural[name[0]] + [...name.slice(1)].reduce((n,sign) => n + (sign === '♯' ? 1 : sign === '♭' ? -1 : NaN), 0));
}

test('definitions have unique IDs, aligned ascending interval/degree lists and valid spelling in all keys', () => {
  assert.equal(new Set(CHORDS.map(c=>c.id)).size, CHORDS.length);
  assert.equal(ROOTS.length,12);
  assert.ok(CHORDS.length >= 30);
  for (const root of ROOTS) for (const def of CHORDS) {
    const chord = getChord(root.pc,def.id);
    assert.equal(chord.tones.length,def.intervals.length);
    assert.equal(chord.degrees.length,def.intervals.length);
    assert.equal(new Set(chord.tones.map(t=>t.pc)).size,chord.tones.length);
    for (const [index,tone] of chord.tones.entries()) {
      assert.equal(tone.pc,mod(root.pc+def.intervals[index]));
      assert.equal(spellingPc(tone.name),tone.pc,`${chord.symbol}: ${tone.name}`);
      if (index) assert.ok(def.intervals[index] > def.intervals[index-1]);
    }
  }
});

test('musically significant degree spellings are preserved rather than replacing by enharmonic shortcuts', () => {
  const names = id => getChord(0,id).tones.map(t=>t.name);
  assert.deepEqual(names('7#5'),['C','E','G♯','B♭']);
  assert.deepEqual(names('dim7'),['C','E♭','G♭','B♭♭']);
  assert.deepEqual(names('m7b5'),['C','E♭','G♭','B♭']);
  assert.deepEqual(names('aug'),['C','E','G♯']);
  assert.deepEqual(names('7#9'),['C','E','G','B♭','D♯']);
  assert.deepEqual(names('mMaj7'),['C','E♭','G','B']);
  assert.deepEqual(getChord(6,'major').tones.map(t=>t.name),['F♯','A♯','C♯']);
  assert.deepEqual(getChord(1,'minor').tones.map(t=>t.name),['D♭','F♭','A♭']);
});

test('every close inversion has the advertised actual bass, retains all degrees and stays on the keyboard', () => {
  for (const root of ROOTS) for (const chord of CHORDS) {
    const options = getInversionOptions(root.pc,chord.id);
    assert.ok(options.length >= 3 && options.length <= 4);
    for (const option of options) {
      const voicing = getVoicing(root.pc,chord.id,{mode:'close',inversion:option.value});
      assert.equal(voicing.bassName,option.bassName);
      assert.equal(voicing.notes[0].name,option.bassName);
      assert.equal(voicing.notes.length,chord.intervals.length);
      assert.deepEqual(new Set(voicing.notes.map(n=>n.degree)),new Set(chord.degrees));
      assert.deepEqual(voicing.omitted,[]);
      for (const [index,note] of voicing.notes.entries()) {
        assert.ok(note.midi >=36 && note.midi<=84);
        assert.equal(mod(note.midi),note.pc);
        assert.equal(spellingPc(note.name),note.pc);
        assert.ok(note.hand==='left' || note.hand==='right');
        if(index) assert.ok(note.midi>voicing.notes[index-1].midi);
      }
      for(const hand of ['left','right']) {
        const notes = voicing.notes.filter(n=>n.hand===hand);
        if(notes.length) assert.ok(notes.at(-1).midi-notes[0].midi<=12);
        assert.ok(notes.length<=5);
      }
    }
  }
});

test('inversion labels follow the triad/seventh skeleton and do not invent a ninth-bass fourth inversion', () => {
  assert.deepEqual(getInversionOptions(0,'major').map(o=>o.label),['原位','第一转位','第二转位']);
  assert.deepEqual(getInversionOptions(0,'maj13').map(o=>o.bassName),['C','E','G','B']);
  assert.deepEqual(getInversionOptions(0,'sus2').map(o=>o.label),['原位','2音低音','5音低音']);
  assert.deepEqual(getInversionOptions(0,'sus4').map(o=>o.label),['原位','4音低音','5音低音']);
  assert.equal(getVoicing(0,'major',{inversion:1}).symbol,'C/E');
  assert.equal(getVoicing(0,'m7',{inversion:3}).symbol,'Cm7/B♭');
});

test('basic C-root close voicings match the middle-C lesson register across inversions', () => {
  assert.deepEqual(getVoicing(0,'major').notes.map(n=>n.midi),[60,64,67]);
  assert.deepEqual(getVoicing(0,'major',{inversion:1}).notes.map(n=>n.midi),[64,67,72]);
  assert.deepEqual(getVoicing(0,'major',{inversion:2}).notes.map(n=>n.midi),[67,72,76]);
  assert.deepEqual(getVoicing(0,'maj7').notes.map(n=>n.midi),[60,64,67,71]);
});

test('split voicings preserve identity and named extensions while keeping each hand playable', () => {
  for(const root of ROOTS) for(const chord of CHORDS) {
    const voicing=getVoicing(root.pc,chord.id,{mode:'split'});
    const left=voicing.notes.filter(n=>n.hand==='left');
    const right=voicing.notes.filter(n=>n.hand==='right');
    assert.equal(left.length,1);
    assert.equal(left[0].midi,36+root.pc);
    assert.equal(voicing.bassDegree,'1');
    assert.ok(right.length>0 && right.length<=5);
    assert.ok(right.at(-1).midi-right[0].midi<=12);
    assert.ok(right.every(n=>n.midi>=48 && n.midi<=80));
    const played=new Set(voicing.notes.map(n=>n.degree));
    for(const degree of chord.degrees) {
      assert.equal(played.has(degree),!voicing.omitted.includes(degree));
      if(/3$|7$|9$|13$/.test(degree) || degree==='♯11' || /^(♭|♯)5$/.test(degree)) assert.ok(played.has(degree),`${root.label}${chord.suffix}: ${degree}`);
    }
    for(const note of voicing.notes) assert.equal(mod(note.midi),note.pc);
    if(chord.id.includes('sus')) assert.ok(!voicing.notes.some(n=>/3$/.test(n.degree)));
  }
  assert.deepEqual(getVoicing(0,'m13',{mode:'split'}).omitted,['5','11']);
  assert.deepEqual(getVoicing(0,'maj9',{mode:'split'}).omitted,['5']);
  assert.equal(getVoicing(0,'7sus4',{mode:'split',inversion:2}).inversion,0);
});

test('sus, add9, ninth and sixth chords differ exactly in the expected degrees', () => {
  assert.deepEqual(getChord(0,'sus2').degrees,['1','2','5']);
  assert.deepEqual(getChord(0,'add9').degrees,['1','3','5','9']);
  assert.deepEqual(getChord(0,'9').degrees,['1','3','5','♭7','9']);
  const c6=new Set(getChord(0,'6').tones.map(t=>t.pc));
  assert.deepEqual(c6,new Set(getChord(9,'m7').tones.map(t=>t.pc)));
  assert.notDeepEqual(c6,new Set(getChord(9,'minor').tones.map(t=>t.pc)));
  assert.ok(!getChord(0,'6/9').degrees.some(d=>/7$/.test(d)));
});

test('theoretical symmetry has three diminished-seventh and four augmented pitch collections', () => {
  const signatures=id => new Set(ROOTS.map(root => [...getChord(root.pc,id).tones.map(t=>t.pc)].sort((a,b)=>a-b).join(',')));
  assert.equal(signatures('dim7').size,3);
  assert.equal(signatures('aug').size,4);
  assert.deepEqual(new Set(getChord(11,'dim7').tones.map(t=>t.pc)),new Set(getChord(7,'7b9').tones.slice(1).map(t=>t.pc)));
});

test('invalid roots, chords, modes and inversions fail explicitly', () => {
  assert.throws(()=>getChord(-1,'major'),RangeError);
  assert.throws(()=>getChord(12,'major'),RangeError);
  assert.throws(()=>getChord(0,'missing'),RangeError);
  assert.throws(()=>getVoicing(0,'major',{inversion:3}),RangeError);
  assert.throws(()=>getVoicing(0,'major',{mode:'missing'}),RangeError);
});
