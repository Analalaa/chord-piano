/** Pitch classes use C=0. Spellings follow each chord degree, including double flats. */
export const ROOTS = Object.freeze([
  { pc: 0, label: 'C' }, { pc: 1, label: 'D♭' }, { pc: 2, label: 'D' },
  { pc: 3, label: 'E♭' }, { pc: 4, label: 'E' }, { pc: 5, label: 'F' },
  { pc: 6, label: 'F♯' }, { pc: 7, label: 'G' }, { pc: 8, label: 'A♭' },
  { pc: 9, label: 'A' }, { pc: 10, label: 'B♭' }, { pc: 11, label: 'B' }
].map(Object.freeze));

const definition = (id, name, suffix, family, intervals, degrees, description, tip) => Object.freeze({
  id, name, suffix, family, intervals: Object.freeze(intervals), degrees: Object.freeze(degrees), description, tip
});

/** Complete theoretical collections; practical piano voicings deliberately omit some tones. */
export const CHORDS = Object.freeze([
  definition('major', '大三和弦', '', 'major', [0,4,7], ['1','3','5'], '根音、大三度与纯五度。', '先弹根音与三音，再加入五音；把三音降低半音，便得到同根音小三和弦。'),
  definition('maj7', '大七和弦', 'maj7', 'major', [0,4,7,11], ['1','3','5','7'], '大三和弦加入大七度。', '先比较大三，再加入7。maj7的大七音与属七的小七音相差半音。'),
  definition('maj9', '大九和弦', 'maj9', 'major', [0,4,7,11,14], ['1','3','5','7','9'], '大七和弦加入自然九音。', '与add9比较：maj9包含大七音。双手实用排列省略纯五音。'),
  definition('maj11', '大十一和弦', 'maj11', 'major', [0,4,7,11,14,17], ['1','3','5','7','9','11'], '大七体系延伸到自然十一音。', '自然11与大三音可能产生摩擦。这里保留两者供对照；可再听maj7(♯11)。'),
  definition('maj13', '大十三和弦', 'maj13', 'major', [0,4,7,11,14,17,21], ['1','3','5','7','9','11','13'], '大七体系延伸到自然十三音。', '完整结构有七种音，请双手分担。实用排列省略5、11，保留3、7、9、13。'),
  definition('maj7#11', '大七升十一', 'maj7(♯11)', 'major', [0,4,7,11,18], ['1','3','5','7','♯11'], '大七和弦加入升十一音。', '升高的是11，不是根音。Cmaj7(♯11)中的升十一音是F♯。'),
  definition('minor', '小三和弦', 'm', 'minor', [0,3,7], ['1','♭3','5'], '根音、小三度与纯五度。', '与同根音大三和弦比较，只把3降为♭3；先唱出这半音差。'),
  definition('m7', '小七和弦', 'm7', 'minor', [0,3,7,10], ['1','♭3','5','♭7'], '小三和弦加入小七度。', '与属七比较：两者都有♭7，三音分别是♭3与3。'),
  definition('m9', '小九和弦', 'm9', 'minor', [0,3,7,10,14], ['1','♭3','5','♭7','9'], '小七和弦加入自然九音。', '先弹m7，再只加入9；双手实用排列保留♭3、♭7、9。'),
  definition('m11', '小十一和弦', 'm11', 'minor', [0,3,7,10,14,17], ['1','♭3','5','♭7','9','11'], '小七体系加入自然十一音。', '注意♭3、♭7与11的相互关系；延伸音不要求在最高处。'),
  definition('m13', '小十三和弦', 'm13', 'minor', [0,3,7,10,14,17,21], ['1','♭3','5','♭7','9','11','13'], '小七体系延伸到自然十三音（大六度）。', '自然13不是普遍禁音，例如Dorian语境可用。是否合适取决于旋律、调式与排列。'),
  definition('mMaj7', '小大七和弦', 'm(maj7)', 'minor', [0,3,7,11], ['1','♭3','5','7'], '小三和弦加入大七度。', '先弹m7，再把♭7升高半音到7；小三音保持不变。'),
  definition('7', '属七和弦', '7', 'dominant', [0,4,7,10], ['1','3','5','♭7'], '大三和弦加入小七度，三音与七音形成三全音。', '先练G7→C：典型声部移动是B→C、F→E。属七性质与实际属功能要结合语境区分。'),
  definition('9', '属九和弦', '9', 'dominant', [0,4,7,10,14], ['1','3','5','♭7','9'], '属七和弦加入自然九音。', '单独写9通常包含♭7；C9、Cmaj9、Cadd9的七音不同。'),
  definition('11', '属十一和弦', '11', 'dominant', [0,4,7,10,14,17], ['1','3','5','♭7','9','11'], '属七体系延伸到自然十一音。', '3与11可能摩擦。若用4替掉3，应写成7sus4等挂留和弦。'),
  definition('13', '属十三和弦', '13', 'dominant', [0,4,7,10,14,17,21], ['1','3','5','♭7','9','11','13'], '属七体系延伸到自然十三音。', '实用排列省略5、11，保留3、♭7、9、13。连接小和弦时，♭9或♭13是可选张力。'),
  definition('7b9', '属七降九', '7(♭9)', 'dominant', [0,4,7,10,13], ['1','3','5','♭7','♭9'], '属七和弦加入降九音。', '试G7(♭9)→Cm：B可走向C，A♭可走向G。'),
  definition('7#9', '属七升九', '7(♯9)', 'dominant', [0,4,7,10,15], ['1','3','5','♭7','♯9'], '属七和弦加入升九音。', '大三音仍保留；♯9与♭3等音，但分析身份不同。'),
  definition('7#5', '属七升五', '7(♯5)', 'dominant', [0,4,8,10], ['1','3','♯5','♭7'], '属七和弦把纯五音升高半音。', 'C7(♯5)=C–E–G♯–B♭；升号和降号可以同时出现在同一个和弦中。'),
  definition('7b13', '属七降十三', '7(♭13)', 'dominant', [0,4,7,10,20], ['1','3','5','♭7','♭13'], '属七和弦加入降十三音。', '♭13与♯5等音；本例理论结构保留纯五音，实用排列会省略它。'),
  definition('6', '大六和弦', '6', 'major', [0,4,7,9], ['1','3','5','6'], '大三和弦加入自然六音，不包含七音。', 'C6与Am7/C的音集合相同；Am/C缺少G，不能直接等同。'),
  definition('m6', '小六和弦', 'm6', 'minor', [0,3,7,9], ['1','♭3','5','6'], '小三和弦加入大六度。', 'm6中的6是自然六音。与m7比较，可听♭7下降半音到6。'),
  definition('6/9', '六九和弦', '6/9', 'major', [0,4,7,9,14], ['1','3','5','6','9'], '大三和弦加入六音与九音，不包含七音。', '6/9里的斜线表示六九组合，并不是指定低音的斜杠和弦记号。'),
  definition('sus2', '挂二和弦', 'sus2', 'other', [0,2,7], ['1','2','5'], '用二音替代三音。', 'Csus2没有E；Cadd9保留E。两者都能含D，但构成不同。'),
  definition('sus4', '挂四和弦', 'sus4', 'other', [0,5,7], ['1','4','5'], '用四音替代三音。', '弹Csus4→C，听F→E。挂留也可以保持，不必在所有风格中解决。'),
  definition('add9', '加九和弦', 'add9', 'other', [0,4,7,14], ['1','3','5','9'], '保留三音，另外加入九音；不包含七音。', '比较Csus2、Cadd9与C9：检查三音、七音是否存在。'),
  definition('7sus4', '属七挂四', '7sus4', 'other', [0,5,7,10], ['1','4','5','♭7'], '用四音替换属七和弦的三音，保留小七音。', '试G7sus4→G7→C：先听4→3，再听属解决。'),
  definition('dim', '减三和弦', 'dim', 'other', [0,3,6], ['1','♭3','♭5'], '连续叠两个小三度。', '与小三和弦比较，只把纯五音降低半音。功能仍取决于前后和弦。'),
  definition('m7b5', '半减七和弦', 'm7♭5', 'other', [0,3,6,10], ['1','♭3','♭5','♭7'], '减三和弦加入小七度。', '小调ii–V–i常用二级半减七，例如Dm7♭5→G7→Cm。'),
  definition('dim7', '减七和弦', 'dim7', 'other', [0,3,6,9], ['1','♭3','♭5','♭♭7'], '连续叠三个小三度；七音是减七度。', 'Cdim7的七音写B♭♭，与A等音。Bdim7与省根音的G7(♭9)有相同音集合。'),
  definition('aug', '增三和弦', 'aug', 'other', [0,4,8], ['1','3','♯5'], '连续叠两个大三度。', '试C→Caug→Am/C，听同一声部的G→G♯→A。'),
  definition('maj7#5', '增大七和弦', 'maj7(♯5)', 'major', [0,4,8,11], ['1','3','♯5','7'], '增三和弦加入大七度。', '对应大七升五性质；Lydian augmented含自然7，不宜直接当作通常的属七音阶。')
]);

const LETTERS = ['C','D','E','F','G','A','B'];
const NATURAL_PCS = [0,2,4,5,7,9,11];
const ROOT_LETTERS = [0,1,1,2,2,3,3,4,5,5,6,6];
const mod = n => ((n % 12) + 12) % 12;
const ALIASES = {maj:'major', min:'minor', min7:'m7', dom7:'7', six:'6', 'mmaj7':'mMaj7'};

function checkRoot(rootPc) {
  if (!Number.isInteger(rootPc) || rootPc < 0 || rootPc > 11) throw new RangeError('根音应为0至11的音级编号。');
}

function spelling(rootPc, interval, degree) {
  const number = Number(degree.replace(/[^0-9]/g, ''));
  const letter = (ROOT_LETTERS[rootPc] + number - 1) % 7;
  let accidental = mod(rootPc + interval - NATURAL_PCS[letter]);
  if (accidental > 6) accidental -= 12;
  return LETTERS[letter] + (accidental < 0 ? '♭'.repeat(-accidental) : '♯'.repeat(accidental));
}

export function getChord(rootPc, chordId) {
  checkRoot(rootPc);
  const chord = CHORDS.find(item => item.id === (ALIASES[chordId] || chordId));
  if (!chord) throw new RangeError(`未知和弦类型：${chordId}`);
  return {
    ...chord, rootPc,
    symbol: ROOTS[rootPc].label + chord.suffix,
    tones: chord.intervals.map((interval, index) => ({
      pc: mod(rootPc + interval), name: spelling(rootPc, interval, chord.degrees[index]),
      degree: chord.degrees[index], interval
    }))
  };
}

function skeleton(chord) {
  return chord.tones.filter(tone => /^(1|[♭♯]*3|[♭♯]*5|[♭♯]*7)$/.test(tone.degree) || tone.degree === '2' || tone.degree === '4');
}

export function getInversionOptions(rootPc, chordId) {
  const chord = getChord(rootPc, chordId);
  const hasThird = chord.tones.some(tone => /3$/.test(tone.degree));
  const labels = ['原位','第一转位','第二转位','第三转位'];
  return skeleton(chord).map((tone, index) => ({
    value: index,
    label: index === 0 ? '原位' : hasThird ? labels[index] : `${tone.degree}音低音`,
    bassName: tone.name
  }));
}

function practicalTones(chord) {
  // Triads duplicate the LH root in the RH to make a familiar three-note shape.
  if (chord.tones.length === 3) return chord.tones;
  if (chord.tones.length === 4) return chord.tones.filter(tone => tone.degree !== '1');
  const has13 = chord.tones.some(tone => /13$/.test(tone.degree));
  return chord.tones.filter(tone => {
    if (tone.degree === '1' || tone.degree === '5') return false;
    if (has13 && tone.degree === '11') return false;
    return true;
  });
}

export function getVoicing(rootPc, chordId, {mode = 'close', inversion = 0} = {}) {
  const chord = getChord(rootPc, chordId);
  if (mode !== 'close' && mode !== 'split') throw new RangeError(`未知排列模式：${mode}`);
  const options = getInversionOptions(rootPc, chordId);
  if (!Number.isInteger(inversion) || inversion < 0 || inversion >= options.length) throw new RangeError('转位超出当前和弦骨架的范围。');
  let notes;
  let description;
  let omitted = [];
  let actualInversion = inversion;
  if (mode === 'split') {
    actualInversion = 0;
    const selected = practicalTones(chord);
    const anchor = selected.find(tone => /3$/.test(tone.degree)) || selected[0];
    const anchorInterval = mod(anchor.interval);
    const right = selected.map(tone => ({
      ...tone,
      midi: 48 + rootPc + anchorInterval + mod(tone.interval - anchorInterval),
      hand: 'right'
    })).sort((a,b) => a.midi - b.midi);
    notes = [{...chord.tones[0], midi: 36 + rootPc, hand:'left'}, ...right];
    omitted = chord.tones.filter(tone => !notes.some(note => note.degree === tone.degree)).map(tone => tone.degree);
    description = '左手弹根音，右手弹上方和弦；延伸音可在八度内重新排列。' + (omitted.length ? `本次省略：${omitted.join('、')}。` : '本次包含全部构成音。');
  } else {
    const bass = skeleton(chord)[inversion];
    notes = chord.tones.map(tone => {
      let interval = tone.interval;
      while (interval < bass.interval) interval += 12;
      return {...tone, midi:60 + rootPc + interval, hand:'right'};
    }).sort((a,b) => a.midi - b.midi);
    const tooWide = notes.at(-1).midi - notes[0].midi > 12 || notes.length > 5;
    if (tooWide) {
      const splitIndex = Array.from({length:notes.length-1},(_,i)=>i+1)
        .filter(index => index<=5 && notes.length-index<=5 && notes[index-1].midi-notes[0].midi<=12 && notes.at(-1).midi-notes[index].midi<=12)
        .sort((a,b) => Math.abs(a-notes.length/2)-Math.abs(b-notes.length/2))[0];
      notes = notes.map((note,index) => ({...note, hand:index < splitIndex ? 'left' : 'right'}));
    }
    description = `完整构成 · ${options[inversion].label}。` + (tooWide ? '音域较宽，请按左右手标记分担，不要单手硬撑。' : '可先用右手弹奏，逐个确认最低音与各音之间的距离。');
  }
  const lowest = Math.min(...notes.map(note => note.midi));
  const highest = Math.max(...notes.map(note => note.midi));
  if (highest > 84) notes = notes.map(note => ({...note, midi:note.midi-12}));
  if (Math.min(...notes.map(note => note.midi)) < 36) notes = notes.map(note => ({...note,midi:note.midi+12}));
  notes.sort((a,b) => a.midi-b.midi);
  const bassNote = notes[0];
  const symbol = chord.symbol + (bassNote.pc !== rootPc ? '/' + bassNote.name : '');
  return {
    notes, omitted, symbol, bassName:bassNote.name, bassDegree:bassNote.degree,
    description, mode, inversion:actualInversion, span:highest-lowest,
    rightHandSpan:Math.max(...notes.filter(note => note.hand==='right').map(note => note.midi)) - Math.min(...notes.filter(note => note.hand==='right').map(note => note.midi))
  };
}
