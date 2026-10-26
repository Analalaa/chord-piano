import { ROOTS, CHORDS, getChord, getVoicing, getInversionOptions } from './music.js';
import { COMPARISONS, PROGRESSIONS, COURSES, CORRECTIONS, SOURCES } from './lessons.js';

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const FAMILY_NAMES = { major:'大和弦家族', minor:'小和弦家族', dominant:'属和弦家族', other:'挂留 · 增减 · 附加音' };
const STORAGE_KEY = 'piano-chord-map-v1';
let restored = {};
try { restored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch {}
const state = {
  root: ROOTS.some(r=>r.pc===restored.root) ? restored.root : 0,
  type: CHORDS.some(c=>c.id===restored.type) ? restored.type : 'major',
  mode: restored.mode === 'split' ? 'split' : 'close',
  inversion: Number.isInteger(restored.inversion) ? restored.inversion : 0,
  family:'all', label:['both','note','degree'].includes(restored.label) ? restored.label : 'both',
  guide:false, comparison:0, progression:0,
  course:Math.min(Math.max(Number(restored.course)||0,0),COURSES.length-1), step:0,
  done:new Set(Array.isArray(restored.done) ? restored.done.filter(k=>typeof k==='string') : []),
  answers:new Set(), hint:false
};
let labVoicing;
let timeline=[];
let ticker=null;
let playingProgression=false;
let runId=0;
const keyboardNotes = new Map();
const flatNames=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const naturalPC=new Set([0,2,4,5,7,9,11]);
const isGuide=degree=>['3','♭3','7','♭7','♭♭7'].includes(degree);
const rootLabel=pc=>ROOTS.find(item=>item.pc===pc)?.label || flatNames[pc];

function save() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify({root:state.root,type:state.type,mode:state.mode,inversion:state.inversion,label:state.label,course:state.course,done:[...state.done]})); } catch {}
}
function notify(text) {
  $('toast').textContent=text; $('toast').hidden=false;
  clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').hidden=true,2400);
}
function later(callback,ms) { const id=setTimeout(callback,ms);timeline.push(id);return id; }
function safeBpm(id) { const input=$(id);const bpm=Math.min(140,Math.max(40,Math.round(Number(input.value)||60)));input.value=bpm;return bpm; }

class PianoAudio {
  constructor(){this.context=null;this.nodes=new Set();}
  async ready(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)throw Error('当前浏览器无法播放合成音。');
    if(!this.context)this.context=new Audio();
    await this.context.resume();
    if(this.context.state!=='running')throw Error('声音未能启动，请再次点击试听。');
  }
  note(midi,offset=0,duration=1.4,volume=.12){
    if(!this.context)return;
    const time=this.context.currentTime+offset+.015;
    const envelope=this.context.createGain();
    envelope.gain.setValueAtTime(.00001,time);
    envelope.gain.exponentialRampToValueAtTime(volume,time+.009);
    envelope.gain.exponentialRampToValueAtTime(volume*.28,time+.18);
    envelope.gain.exponentialRampToValueAtTime(.00001,time+duration);
    envelope.connect(this.context.destination);
    let ended=0;
    [1,2,3].forEach((harmonic,index)=>{
      const oscillator=this.context.createOscillator();const gain=this.context.createGain();
      oscillator.type='sine';oscillator.frequency.value=440*Math.pow(2,(midi-69)/12)*harmonic;
      gain.gain.value=[.78,.15,.07][index];oscillator.connect(gain);gain.connect(envelope);
      oscillator.start(time);oscillator.stop(time+duration+.03);this.nodes.add(oscillator);
      oscillator.onended=()=>{this.nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();if(++ended===3)envelope.disconnect();};
    });
  }
  chord(notes,{arpeggio=false,duration=1.8}={}){
    const level=.16/Math.sqrt(notes.length);
    notes.forEach((note,index)=>this.note(typeof note==='number'?note:note.midi,arpeggio?index*.19:0,duration,level));
  }
  click(accent=false){this.note(accent?88:81,0,.075,.045);}
  stop(){for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();}
}
const audio=new PianoAudio();
function stopPlayback(){
  runId++;timeline.forEach(clearTimeout);timeline=[];
  if(ticker)clearInterval(ticker);ticker=null;
  playingProgression=false;audio.stop();
  $('metronome-button').setAttribute('aria-pressed','false');$('metronome-button').textContent='开启节拍器';
  document.querySelectorAll('.is-playing').forEach(node=>node.classList.remove('is-playing'));
  $('beat-dots').querySelectorAll('i').forEach(node=>node.classList.remove('on'));
  $('progression-status').textContent='';$('lab-status').textContent='';
}
async function beginAction(action) {
  stopPlayback();const ownRun=runId;
  try {await audio.ready();if(ownRun===runId)await action(ownRun);}catch(error){notify(error.message||'暂时无法播放声音，请再次点击。');}
}
function noteWithOctave(note){
  const name=note.name||flatNames[note.midi%12];
  const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[name[0]];
  const alteration=[...name.slice(1)].reduce((n,c)=>n+(c==='♯'?1:c==='♭'?-1:0),0);
  return name+(Math.round((note.midi-base-alteration)/12)-1);
}
function midiNotes(numbers,chord){
  return numbers.map((midi,index)=>{
    const tone=chord.tones.find(t=>t.pc===midi%12);
    return {midi,pc:midi%12,name:tone?.name||flatNames[midi%12],degree:tone?.degree||'',hand:index===0?'left':'right'};
  });
}

function makeKeyboard(id,notes,{answer=false,hint=false,range=[36,84]}={}){
  const container=$(id);const [first,last]=range;const whiteWidth=38;const whiteCount=Array.from({length:last-first+1},(_,i)=>first+i).filter(m=>naturalPC.has(m%12)).length;
  container.style.width=(whiteCount*whiteWidth)+'px';container.replaceChildren();
  keyboardNotes.set(id,notes);
  const lookup=new Map(notes.map(n=>[n.midi,n]));let whites=0;
  for(let midi=first;midi<=last;midi++){
    const white=naturalPC.has(midi%12);const note=lookup.get(midi);const key=document.createElement('button');
    key.type='button';key.className='piano-key '+(white?'white-key':'black-key');key.dataset.midi=midi;
    key.style.left=(white?whites*whiteWidth:whites*whiteWidth-whiteWidth*.32)+'px';key.style.width=(white?whiteWidth:whiteWidth*.64)+'px';
    if(white)whites++;
    const chosen=answer?state.answers.has(midi):!!note;
    const revealed=answer&&hint&&!!note;
    if(chosen){key.classList.add('is-selected');if(note){key.classList.add(note.hand==='left'?'left-hand':'right-hand');if(note.degree==='1')key.classList.add('is-root');if(isGuide(note.degree))key.classList.add('is-guide');else if(!['1','5','♭5','♯5'].includes(note.degree))key.classList.add('is-extension');}}
    if(revealed)key.classList.add('is-answer');
    if(!answer&&state.guide&&note&&!isGuide(note.degree))key.classList.add('is-muted');
    const label=document.createElement('span');label.className='note-label';
    const visibleName=note&&(chosen||revealed)?note.name:flatNames[midi%12];
    if(state.label!=='degree'||!chosen){const name=document.createElement('span');name.className='note-name';name.textContent=midi%12===0?noteWithOctave({midi,name:visibleName}):visibleName;label.append(name);}
    if(note&&(chosen||revealed)&&state.label!=='note'){const degree=document.createElement('span');degree.className='note-degree';degree.textContent=note.degree;label.append(degree);}
    key.append(label);
    if(note&&chosen&&isGuide(note.degree)){const mark=document.createElement('i');mark.className='guide-mark';mark.setAttribute('aria-hidden','true');key.append(mark);}
    key.setAttribute('aria-label',`${noteWithOctave({midi,name:visibleName})}，${answer?'点击选择或取消':note?`${note.degree}音，${note.hand==='left'?'左手':'右手'}`:'试听单音'}`);
    if(answer)key.setAttribute('aria-pressed',String(chosen));
    key.addEventListener('click',async()=>{
      if(answer){state.answers.has(midi)?state.answers.delete(midi):state.answers.add(midi);$('answer-feedback').textContent='';makeKeyboard(id,notes,{answer:true,hint:state.hint,range});}
      try{await audio.ready();audio.note(midi,0,.9,.1);flashNote(id,midi);}catch(error){notify(error.message);}
    });
    container.append(key);
  }
}
function flashNote(id,midi,duration=450){
  const key=$(id).querySelector(`[data-midi="${midi}"]`);if(!key)return;
  key.classList.add('is-playing');setTimeout(()=>key.classList.remove('is-playing'),duration);
}
function flashChord(id,notes,arpeggio=false){notes.forEach((n,index)=>later(()=>flashNote(id,n.midi,800),arpeggio?index*190:0));}
function centerKeyboard(scrollId,notes){
  const box=$(scrollId);if(!box||!notes.length)return;
  const mean=notes.reduce((sum,n)=>sum+n.midi,0)/notes.length;
  const whiteIndex=(mean-36)*7/12;
  box.scrollLeft=Math.max(0,whiteIndex*38-box.clientWidth/2);
}

function renderLab(){
  const chord=getChord(state.root,state.type);
  $('root-picker').innerHTML=ROOTS.map(r=>`<button type="button" data-root="${r.pc}" aria-pressed="${r.pc===state.root}">${r.label}</button>`).join('');
  const familyOptions=[['all','全部'],...Object.entries(FAMILY_NAMES)];
  $('family-picker').innerHTML=familyOptions.map(([id,label])=>`<button type="button" data-family="${id}" aria-pressed="${state.family===id}">${label}</button>`).join('');
  const visible=CHORDS.filter(c=>state.family==='all'||c.family===state.family);
  $('chord-type').innerHTML=Object.entries(FAMILY_NAMES).map(([family,name])=>{const items=visible.filter(c=>c.family===family);return items.length?`<optgroup label="${name}">${items.map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(rootLabel(state.root)+c.suffix)} · ${c.name}</option>`).join('')}</optgroup>`:'';}).join('');
  $('chord-type').value=state.type;
  $('family-label').textContent=FAMILY_NAMES[chord.family];$('chord-symbol').textContent=chord.symbol;$('chord-name').textContent=chord.name;$('chord-description').textContent=chord.description;
  $('tone-chips').innerHTML=chord.tones.map(t=>`<span class="tone-chip ${t.degree==='1'?'is-root':isGuide(t.degree)?'is-guide':'is-extension'}"><strong>${t.name}</strong><span>${t.degree}</span></span>`).join('');
  const inversionOptions=getInversionOptions(state.root,state.type);
  if(!inversionOptions.some(o=>o.value===state.inversion))state.inversion=0;
  if(state.mode==='split')state.inversion=0;
  $('inversion-select').innerHTML=inversionOptions.map(option=>`<option value="${option.value}">${option.label} · ${option.bassName} 低音</option>`).join('');
  $('inversion-select').value=state.inversion;$('inversion-select').disabled=state.mode==='split';
  $('voicing-mode').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  $('label-select').value=state.label;$('guide-only').checked=state.guide;
  labVoicing=getVoicing(state.root,state.type,{mode:state.mode,inversion:state.inversion});
  $('voicing-caption').textContent=`${state.mode==='split'?'双手实用排列':inversionOptions.find(o=>o.value===state.inversion)?.label||'完整构成'} · 实际最低音 ${labVoicing.bassName} · 高亮为本次弹奏音`;
  $('played-notes').textContent='从低到高：'+labVoicing.notes.map(n=>`${noteWithOctave(n)}${n.hand==='left'?'〔左〕':'〔右〕'}`).join('  ');
  $('omitted-notes').textContent=labVoicing.omitted.length?'本次省略：'+labVoicing.omitted.join('、')+' 音':'本次未省略构成音';
  $('chord-tip').textContent=chord.tip+' '+labVoicing.description;
  makeKeyboard('main-piano',labVoicing.notes);renderInversions();renderCatalog();
}
function loadChord(root,type,{mode='close',inversion=0}={}){
  state.root=root;state.type=type;state.mode=mode;state.inversion=inversion;
  if(state.family!=='all'&&getChord(root,type).family!==state.family)state.family='all';
  renderLab();save();centerKeyboard('lab-scroll',labVoicing.notes);
}
function miniPiano(notes){
  const first=Math.floor(Math.min(...notes.map(n=>n.midi))/12)*12;const last=Math.ceil((Math.max(...notes.map(n=>n.midi))+1)/12)*12;
  let white=0;let shapes='';const keywidth=16;const selected=new Map(notes.map(n=>[n.midi,n]));let blackShapes='';
  for(let midi=first;midi<=last;midi++){
    const natural=naturalPC.has(midi%12);const note=selected.get(midi);const klass=note?'mini-hit '+(note.hand==='left'?'mini-left':'mini-right'):'';
    if(natural){shapes+=`<rect x="${white*keywidth}" y="0" width="${keywidth}" height="72" class="mini-white ${klass}"/>`;white++;}
    else blackShapes+=`<rect x="${white*keywidth-5}" y="0" width="10" height="44" class="mini-black ${klass}"/>`;
  }
  return `<svg viewBox="0 0 ${white*keywidth} 74" role="img" aria-label="${escapeHTML(notes.map(n=>n.name).join('、'))}">${shapes}${blackShapes}</svg>`;
}
function renderInversions(){
  const options=getInversionOptions(state.root,state.type);$('inversion-current').textContent=getChord(state.root,state.type).symbol;
  $('inversion-cards').innerHTML=options.map(option=>{
    const voicing=getVoicing(state.root,state.type,{mode:'close',inversion:option.value});
    return `<button type="button" class="inversion-card" data-inversion="${option.value}" aria-pressed="${state.mode==='close'&&state.inversion===option.value}" aria-label="选择并试听${option.label}，${voicing.symbol}"><span class="card-top"><span>${option.label}</span><strong>${escapeHTML(voicing.symbol)}</strong></span><span class="mini-piano">${miniPiano(voicing.notes)}</span><span class="inversion-notes">${voicing.notes.map(n=>n.name).join(' – ')}</span><span class="inversion-bass">最低音 ${voicing.bassName}</span></button>`;
  }).join('');
}
function renderCatalog(){
  $('chord-table').innerHTML=CHORDS.map(c=>{const chord=getChord(state.root,c.id);return `<tr><td><button type="button" class="catalog-link" data-chord="${escapeHTML(c.id)}">${escapeHTML(chord.symbol)}</button></td><td>${c.name}</td><td>${c.degrees.join(' · ')}</td><td>${chord.tones.map(t=>t.name).join(' – ')}</td></tr>`;}).join('');
}

function renderComparison(){
  const comparison=COMPARISONS[state.comparison];
  $('comparison-select').innerHTML=COMPARISONS.map((c,i)=>`<option value="${i}">${c.title}</option>`).join('');$('comparison-select').value=state.comparison;
  $('comparison-cards').innerHTML=['left','right'].map((side,i)=>{
    const target=comparison[side];const chord=getChord(target.root,target.type);
    return `<button class="comparison-card" type="button" data-side="${side}"><span class="comparison-label">${i?'B':'A'}</span><span class="comparison-symbol">${escapeHTML(chord.symbol)}</span><span class="comparison-name">${chord.name}</span><span class="comparison-notes">${chord.tones.map(n=>n.name).join(' – ')}</span><span class="comparison-formula">${chord.degrees.join(' · ')}</span><span class="card-action">选择并试听 ↗</span></button>`;
  }).join('');$('comparison-explanation').textContent=comparison.change+' '+comparison.listen;
}
function comparisonSide(side){
  const target=COMPARISONS[state.comparison][side];loadChord(target.root,target.type);
  const notes=labVoicing.notes;audio.chord(notes);flashChord('main-piano',notes);
  $('comparison-cards').querySelectorAll('button').forEach(b=>b.classList.toggle('is-playing',b.dataset.side===side));
}
function renderProgression(){
  const progression=PROGRESSIONS[state.progression];
  $('progression-select').innerHTML=PROGRESSIONS.map((p,i)=>`<option value="${i}">${p.title}</option>`).join('');$('progression-select').value=state.progression;
  $('progression-subtitle').textContent=progression.subtitle;
  $('progression-cards').innerHTML=progression.chords.map((step,i)=>`<button class="progression-card" type="button" data-step="${i}"><span class="step-number">${String(i+1).padStart(2,'0')}</span><span class="function-label">${escapeHTML(step.function||'')}</span><strong class="progression-symbol">${escapeHTML(step.label||getChord(step.root,step.type).symbol)}</strong><span class="progression-notes">${midiNotes(step.notes,getChord(step.root,step.type)).map(n=>noteWithOctave(n)).join(' – ')}</span><span class="card-action">试听这一步 ↗</span></button>`).join('');
  $('motion-list').innerHTML=progression.motion.map(m=>`<span class="motion-item"><strong>${escapeHTML(m.from)} <i>→</i> ${escapeHTML(m.to)}</strong><span>${escapeHTML(m.text)}</span></span>`).join('');
  $('progression-explanation').textContent=progression.explanation;$('progression-preview').hidden=true;
}
function playProgressionStep(index){
  const progression=PROGRESSIONS[state.progression];const step=progression.chords[index];const chord=getChord(step.root,step.type);const notes=midiNotes(step.notes,chord);
  $('progression-preview').hidden=false;$('progression-current').textContent=(step.label||chord.symbol)+' · '+(step.function||'');
  makeKeyboard('progression-piano',notes);audio.chord(notes,{duration:2.4});flashChord('progression-piano',notes);
  $('progression-cards').querySelectorAll('button').forEach((button,i)=>button.classList.toggle('is-playing',i===index));
  const scroll=$('progression-piano').parentElement;scroll.scrollLeft=Math.max(0,(notes.reduce((s,n)=>s+n.midi,0)/notes.length-36)*7/12*38-scroll.clientWidth/2);
}
function progressionTick(ownRun,index=0,beat=0){
  if(ownRun!==runId||!playingProgression)return;
  const progression=PROGRESSIONS[state.progression];
  if(beat===0)playProgressionStep(index);
  audio.click(beat===0);$('progression-status').textContent=`${index+1} / ${progression.chords.length} · 第 ${beat+1} 拍`;
  const nextBeat=(beat+1)%4;let nextIndex=index+(nextBeat===0?1:0);
  later(()=>{
    if(nextIndex===progression.chords.length){if($('progression-loop').checked)nextIndex=0;else{playingProgression=false;$('progression-status').textContent='本轮完成';$('progression-cards').querySelectorAll('button').forEach(b=>b.classList.remove('is-playing'));return;}}
    progressionTick(ownRun,nextIndex,nextBeat);
  },60000/safeBpm('progression-bpm'));
}

function currentLesson(){return COURSES[state.course].steps[state.step];}
function lessonVoicing(){
  const step=currentLesson();const voicing=getVoicing(step.root,step.type,{mode:step.mode||'close',inversion:step.inversion||0});
  if(!step.notes)return voicing;
  const chord=getChord(step.root,step.type);const notes=midiNotes(step.notes,chord);
  return {...voicing,notes,omitted:chord.tones.filter(t=>!notes.some(n=>n.pc===t.pc)).map(t=>t.degree),bassName:notes[0].name,bassDegree:notes[0].degree};
}
function lessonKey(){return `${COURSES[state.course].id}:${state.step}`;}
function renderPractice(){
  const course=COURSES[state.course];if(state.step>=course.steps.length)state.step=0;
  const step=currentLesson();const voicing=lessonVoicing();const doneCount=COURSES.reduce((total,c)=>total+c.steps.filter((_,i)=>state.done.has(`${c.id}:${i}`)).length,0);const total=COURSES.reduce((sum,c)=>sum+c.steps.length,0);
  $('practice-progress').textContent=`完成 ${doneCount} / ${total} 步`;
  $('course-list').innerHTML=COURSES.map((c,i)=>`<button type="button" class="course-button" data-course="${i}" aria-pressed="${i===state.course}"><span class="course-number">${String(i+1).padStart(2,'0')}</span><span class="course-name">${escapeHTML(c.title.replace(/^\d+\s*·\s*/,''))}<small>${escapeHTML(c.description)}</small></span><span class="course-duration">${c.minutes} 分钟</span><span class="course-done">${c.steps.every((_,j)=>state.done.has(`${c.id}:${j}`))?'✓':''}</span></button>`).join('');
  $('lesson-position').textContent=`${course.title} / 第 ${state.step+1} 步，共 ${course.steps.length} 步`;$('lesson-title').textContent=step.title;$('lesson-body').textContent=step.body;
  $('lesson-chord').textContent=voicing.symbol;$('lesson-goal').textContent=step.goal;
  const building=step.task==='build';
  $('practice-instruction').textContent=building?'点选下方琴键组成目标和弦；可在任意八度作答，不要添加额外音。':'在实体钢琴上按说明练习；也可点下方琴键探索，或显示示范排列。';
  $('check-answer').hidden=!building;$('lesson-clear').hidden=!building;
  $('lesson-hint').textContent=state.hint?'隐藏琴键提示':'显示琴键提示';
  $('next-lesson').textContent=building?'下一步 →':'我已在琴上完成 →';
  $('previous-lesson').disabled=state.step===0&&state.course===0;
  $('answer-feedback').textContent='';$('answer-feedback').className='';
  makeKeyboard('practice-piano',voicing.notes,{answer:true,hint:state.hint});
  centerKeyboard('practice-scroll',voicing.notes);
}
function checkAnswer(){
  const step=currentLesson();const chord=getChord(step.root,step.type);
  const expected=new Set(chord.tones.map(t=>t.pc));const selected=new Set([...state.answers].map(m=>m%12));
  const missing=chord.tones.filter(t=>!selected.has(t.pc));const extra=[...selected].filter(pc=>!expected.has(pc));
  const feedback=$('answer-feedback');
  if(!selected.size){feedback.textContent='先点选几个琴键，再检查。';feedback.className='answer-hint';return;}
  if(!missing.length&&!extra.length){feedback.textContent='对了！组成音齐全。再在实体琴上慢弹一次。';feedback.className='answer-correct';state.done.add(lessonKey());save();$('practice-progress').textContent=`已完成 ${state.done.size} 步`;}
  else{feedback.textContent=[missing.length?'还缺 '+missing.map(t=>t.name+'（'+t.degree+'）').join('、'):'',extra.length?'多选了 '+extra.map(pc=>flatNames[pc]).join('、'):''].filter(Boolean).join('；')+'。';feedback.className='answer-hint';}
}
function nextLesson(){
  const step=currentLesson();if(step.task==='play'){state.done.add(lessonKey());save();}
  if(step.task==='build'&&!state.done.has(lessonKey())){checkAnswer();if(!state.done.has(lessonKey()))return;}
  stopPlayback();state.answers.clear();state.hint=false;
  if(state.step+1<COURSES[state.course].steps.length)state.step++;
  else if(state.course+1<COURSES.length){state.course++;state.step=0;}
  else{notify('本轮课程完成。可以换一个根音，重新检验你的理解。');renderPractice();return;}
  save();renderPractice();
}
function renderTheory(){
  $('theory-grid').innerHTML=CORRECTIONS.map((c,i)=>`<details class="theory-card"${i<2?' open':''}><summary>${escapeHTML(c.title)}</summary><p>${escapeHTML(c.body)}</p></details>`).join('');
  $('source-list').innerHTML=SOURCES.map(s=>`<p><a href="${escapeHTML(s.url)}" target="_blank" rel="noreferrer">${escapeHTML(s.title)} ↗</a><span>${escapeHTML(s.description)}</span></p>`).join('');
}

$('root-picker').addEventListener('click',event=>{const target=event.target.closest('[data-root]');if(!target)return;stopPlayback();state.root=Number(target.dataset.root);renderLab();save();centerKeyboard('lab-scroll',labVoicing.notes);});
$('family-picker').addEventListener('click',event=>{const target=event.target.closest('[data-family]');if(!target)return;state.family=target.dataset.family;const familyChords=CHORDS.filter(c=>state.family==='all'||c.family===state.family);if(!familyChords.some(c=>c.id===state.type)){state.type=familyChords[0].id;state.inversion=0;}stopPlayback();renderLab();save();});
$('chord-type').addEventListener('change',event=>{stopPlayback();state.type=event.target.value;state.inversion=0;renderLab();save();centerKeyboard('lab-scroll',labVoicing.notes);});
$('voicing-mode').addEventListener('click',event=>{const button=event.target.closest('[data-mode]');if(!button)return;stopPlayback();state.mode=button.dataset.mode;state.inversion=0;renderLab();save();centerKeyboard('lab-scroll',labVoicing.notes);});
$('inversion-select').addEventListener('change',event=>{stopPlayback();state.inversion=Number(event.target.value);renderLab();save();centerKeyboard('lab-scroll',labVoicing.notes);});
$('label-select').addEventListener('change',event=>{state.label=event.target.value;renderLab();renderPractice();save();});
$('guide-only').addEventListener('change',event=>{state.guide=event.target.checked;renderLab();});
$('play-chord').addEventListener('click',()=>beginAction(()=>{audio.chord(labVoicing.notes);flashChord('main-piano',labVoicing.notes);$('lab-status').textContent=`正在试听 ${labVoicing.symbol} · ${labVoicing.notes.length} 个实际发声音`;later(()=>$('lab-status').textContent='',2300);}));
$('play-arp').addEventListener('click',()=>beginAction(()=>{audio.chord(labVoicing.notes,{arpeggio:true});flashChord('main-piano',labVoicing.notes,true);$('lab-status').textContent='从低到高，依次听每个和弦音。';later(()=>$('lab-status').textContent='',3500);}));
$('stop-audio').addEventListener('click',stopPlayback);
$('inversion-cards').addEventListener('click',event=>{const button=event.target.closest('[data-inversion]');if(!button)return;loadChord(state.root,state.type,{inversion:Number(button.dataset.inversion)});beginAction(()=>{audio.chord(labVoicing.notes);notify('已载入主键盘：'+labVoicing.symbol);});});
$('chord-table').addEventListener('click',event=>{const button=event.target.closest('[data-chord]');if(!button)return;stopPlayback();loadChord(state.root,button.dataset.chord);$('lab').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('comparison-select').addEventListener('change',event=>{stopPlayback();state.comparison=Number(event.target.value);renderComparison();});
$('comparison-cards').addEventListener('click',event=>{const button=event.target.closest('[data-side]');if(button)beginAction(()=>comparisonSide(button.dataset.side));});
$('play-comparison').addEventListener('click',()=>beginAction(()=>{comparisonSide('left');later(()=>comparisonSide('right'),2200);later(()=>$('comparison-cards').querySelectorAll('button').forEach(b=>b.classList.remove('is-playing')),4300);}));
$('progression-select').addEventListener('change',event=>{stopPlayback();state.progression=Number(event.target.value);renderProgression();});
$('progression-cards').addEventListener('click',event=>{const button=event.target.closest('[data-step]');if(button)beginAction(()=>playProgressionStep(Number(button.dataset.step)));});
$('play-progression').addEventListener('click',()=>beginAction(ownRun=>{playingProgression=true;progressionTick(ownRun);}));
$('stop-progression').addEventListener('click',stopPlayback);
$('course-list').addEventListener('click',event=>{const button=event.target.closest('[data-course]');if(!button)return;stopPlayback();state.course=Number(button.dataset.course);state.step=0;state.hint=false;state.answers.clear();renderPractice();save();});
$('lesson-hint').addEventListener('click',()=>{state.hint=!state.hint;$('lesson-hint').textContent=state.hint?'隐藏琴键提示':'显示琴键提示';makeKeyboard('practice-piano',lessonVoicing().notes,{answer:true,hint:state.hint});});
$('lesson-clear').addEventListener('click',()=>{state.answers.clear();$('answer-feedback').textContent='';makeKeyboard('practice-piano',lessonVoicing().notes,{answer:true,hint:state.hint});});
$('lesson-listen').addEventListener('click',()=>beginAction(()=>{const notes=lessonVoicing().notes;audio.chord(notes);flashChord('practice-piano',notes);}));
$('check-answer').addEventListener('click',checkAnswer);
$('next-lesson').addEventListener('click',nextLesson);
$('previous-lesson').addEventListener('click',()=>{stopPlayback();if(state.step>0)state.step--;else if(state.course>0){state.course--;state.step=COURSES[state.course].steps.length-1;}state.answers.clear();state.hint=false;renderPractice();save();});
$('metronome-button').addEventListener('click',()=>{
  if(ticker){stopPlayback();return;}
  beginAction(()=>{
    let beat=0;$('metronome-button').setAttribute('aria-pressed','true');$('metronome-button').textContent='停止节拍器';
    const tick=()=>{audio.click(beat===0);$('beat-dots').querySelectorAll('i').forEach((dot,i)=>dot.classList.toggle('on',i===beat));beat=(beat+1)%4;};tick();ticker=setInterval(tick,60000/safeBpm('practice-bpm'));
  });
});
$('practice-bpm').addEventListener('change',()=>{safeBpm('practice-bpm');if(ticker)stopPlayback();});
$('progression-bpm').addEventListener('change',()=>safeBpm('progression-bpm'));
$('print-page').addEventListener('click',()=>window.print());
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
window.addEventListener('pagehide',stopPlayback);
document.addEventListener('keydown',event=>{if(event.key==='Escape')stopPlayback();});

renderLab();renderComparison();renderProgression();renderPractice();renderTheory();
requestAnimationFrame(()=>centerKeyboard('lab-scroll',labVoicing.notes));
