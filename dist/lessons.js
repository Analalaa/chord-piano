// Lesson material for the piano version. MIDI 60 = middle C (C4).
// Progression notes are actual playable arrangements, not complete theoretical stacks.

export const COMPARISONS = [
  {
    id: 'third',
    title: '大三 / 小三',
    left: { root: 0, type: 'major' },
    right: { root: 0, type: 'minor' },
    listen: '让 C、G 保持相同，只听中间的 E 与 E♭。',
    change: '三音降低半音：3 → ♭3。大小性质随之改变。'
  },
  {
    id: 'seventh',
    title: '大七 / 属七',
    left: { root: 0, type: 'maj7' },
    right: { root: 0, type: '7' },
    listen: '保留 C–E–G，把 B 降到 B♭；先分解，再同时弹。',
    change: '七音降低半音：7 → ♭7。Cmaj7 与 C7 的三音都是 E。'
  },
  {
    id: 'sus-add',
    title: '挂二 / 加九',
    left: { root: 0, type: 'sus2' },
    right: { root: 0, type: 'add9' },
    listen: '两者都有 D 和 G。分辨右边新增的 E，以及 D 所处的音区。',
    change: 'sus2 用 D 替换 E；add9 保留 E，再加高处的 D。'
  },
  {
    id: 'minor-thirteen',
    title: '小七 / 小十三',
    left: { root: 0, type: 'm7' },
    right: { root: 0, type: 'm13' },
    listen: '先认出 E♭ 与 B♭ 的小七骨架，再寻找 A 这个自然 13 音。',
    change: '延伸到 13 会加入更多音；双手实用排列会省去部分中间音。A 不是 A♭。'
  },
  {
    id: 'sus-resolution',
    title: '挂四 / 解决',
    left: { root: 0, type: 'sus4' },
    right: { root: 0, type: 'major' },
    listen: '固定 C 与 G，单独跟唱 F → E，再弹两个和弦。',
    change: '四音回到三音：4 → 3。先听到悬挂，再听到落定。'
  }
];

export const PROGRESSIONS = [
  {
    id: 'major-251',
    title: '大调 ii–V–I',
    subtitle: 'Dm7 → G7 → Cmaj7 · 用共同音减少移动',
    chords: [
      { root: 2, type: 'm7', label: 'Dm7', function: 'ii7 · 准备', notes: [38, 53, 57, 60] },
      { root: 7, type: '7', label: 'G7', function: 'V7 · 期待', notes: [43, 53, 59, 62] },
      { root: 0, type: 'maj7', label: 'Cmaj7', function: 'Imaj7 · 落稳', notes: [48, 52, 59, 64] }
    ],
    motion: [
      { from: 'F3', to: 'F3', text: 'Dm7 → G7：F 保持不动，从小三音变成小七音。' },
      { from: 'F3', to: 'E3', text: 'G7 → Cmaj7：F 降半音到 E，听见属七音的解决。' },
      { from: 'B3', to: 'B3', text: 'G7 → Cmaj7：这里保留 B，让它成为主和弦的大七音。' }
    ],
    explanation: '左手每小节换一个根音，右手尽量留住共同音。最后的 Cmaj7 省略五音 G，重复 E；不用把每个理论音都挤进来。B 常可走向 C，本例保留 B 来比较另一种连接。'
  },
  {
    id: 'minor-251',
    title: '小调 iiø–V–i',
    subtitle: 'Dm7♭5 → G7♭9 → Cm · 让紧张音各有去向',
    chords: [
      { root: 2, type: 'm7b5', label: 'Dm7♭5', function: 'iiø7 · 准备', notes: [38, 53, 56, 60] },
      { root: 7, type: '7b9', label: 'G7♭9', function: 'V7♭9 · 期待', notes: [43, 53, 56, 59] },
      { root: 0, type: 'minor', label: 'Cm', function: 'i · 落稳', notes: [48, 51, 55, 60] }
    ],
    motion: [
      { from: 'C4', to: 'B3', text: 'Dm7♭5 → G7♭9：F、A♭ 保持，C 降半音到 B。' },
      { from: 'B3', to: 'C4', text: 'G7♭9 → Cm：B 上行半音到 C。' },
      { from: 'A♭3', to: 'G3', text: 'G7♭9 → Cm：A♭ 降半音到 G；同时 F 下行到 E♭。' }
    ],
    explanation: 'G7♭9 省略五音 D，保留根音、三音 B、小七音 F 与降九音 A♭。先只练右手 F–A♭–C → F–A♭–B → E♭–G–C，再加左手根音。'
  },
  {
    id: 'suspended',
    title: '先挂留，再解决',
    subtitle: 'G7sus4 → G7 → C · 分两次释放期待',
    chords: [
      { root: 7, type: '7sus4', label: 'G7sus4', function: 'V7sus4 · 悬挂', notes: [43, 53, 55, 60] },
      { root: 7, type: '7', label: 'G7', function: 'V7 · 导向', notes: [43, 53, 55, 59] },
      { root: 0, type: 'major', label: 'C', function: 'I · 落稳', notes: [48, 52, 55, 60] }
    ],
    motion: [
      { from: 'C4', to: 'B3', text: 'G7sus4 → G7：C → B，就是相对于 G 的 4 → 3。' },
      { from: 'B3', to: 'C4', text: 'G7 → C：B → C，三音成为下一和弦的根音。' },
      { from: 'F3', to: 'E3', text: 'G7 → C：F → E；G3 保持不动。' }
    ],
    explanation: '前两个排列都省略五音 D，重复根音 G。先固定左手 G，只改变右手最高音 C→B；随后左手换 C，右手 F→E、B→C。sus 在其他风格里也可以保持，不一定每次都解决。'
  },
  {
    id: 'augmented-passing',
    title: '增和弦作经过',
    subtitle: 'C → Caug → Am/C · 留住低音，让一个声部爬行',
    chords: [
      { root: 0, type: 'major', label: 'C', function: '起点 · C 低音', notes: [48, 52, 55, 60] },
      { root: 0, type: 'aug', label: 'Caug', function: '经过 · C 低音', notes: [48, 52, 56, 60] },
      { root: 9, type: 'minor', label: 'Am/C', function: '到达 · 第一转位', notes: [48, 52, 57, 60] }
    ],
    motion: [
      { from: 'G3', to: 'G♯3', text: 'C → Caug：五音 G 升半音到 G♯。' },
      { from: 'G♯3', to: 'A3', text: 'Caug → Am/C：G♯ 再升半音到 A。' },
      { from: 'C3', to: 'C3', text: '左手 C 全程保持；右手 E 与高处的 C 也保持。' }
    ],
    explanation: '三个和弦之间，只有 G→G♯→A 这一条线在移动。最后是 C–E–A 的重复排列，实际最低音为 C，因此写 Am/C；它不含 G，不是 C6。'
  }
];

export const COURSES = [
  {
    id: 'triads',
    title: '01 · 找到三音',
    minutes: 15,
    description: '用一个半音，理解大三和弦为什么会变成小三和弦。',
    steps: [
      {
        title: '搭出 C 大三', root: 0, type: 'major', mode: 'close', inversion: 0, task: 'build',
        body: '先找中央 C（C4），再向右找 E、G。指法编号：拇指1、食指2、中指3、无名指4、小指5；右手 C–E–G 可先试1–3–5。页面答题可点任意八度的同名音。',
        goal: '不看提示，选出 C、E、G 三种音；说出1、3、5。'
      },
      {
        title: '只移动三音', root: 0, type: 'minor', mode: 'close', inversion: 0, task: 'build',
        body: '保留 C、G，把 E 向左挪到相邻黑键 E♭。先单独弹 E→E♭，再交替弹 C 与 Cm，各保持四拍。',
        goal: '选出 C、E♭、G，并能指出改变的是三音。'
      },
      {
        title: '换根音再找一次', root: 2, type: 'minor', mode: 'close', inversion: 0, task: 'build',
        body: '以 D 为1，寻找相距三个半音的 F，再找 A。不要把 C 和弦的音名原样搬过来；每次都相对当前根音计算。',
        goal: '选出 D、F、A；唱出根音后，能说出小三音在哪里。'
      }
    ]
  },
  {
    id: 'sevenths',
    title: '02 · 分清七音',
    minutes: 15,
    description: '固定大三和弦骨架，听清大七度与小七度的差别。',
    steps: [
      {
        title: '给大三加一个 B', root: 0, type: 'maj7', mode: 'close', inversion: 0, task: 'build',
        body: '在 C–E–G 之外加入 B。右手 C–E–G–B 可试1–2–3–5；如果一只手不舒服，用左手 C、右手 E–G–B，保持手腕放松。',
        goal: '找齐 Cmaj7 的四种音；确认没有 B♭。'
      },
      {
        title: '把 B 降到 B♭', root: 0, type: '7', mode: 'close', inversion: 0, task: 'build',
        body: 'C、E、G 不动，把 B 降半音到 B♭。交替听 Cmaj7 与 C7，先分解到最高音，再同时弹；“7”并不默认表示大七度。',
        goal: '找齐 C–E–G–B♭；用七音解释 C7 与 Cmaj7 的区别。'
      },
      {
        title: '七音不动，再换三音', root: 0, type: 'm7', mode: 'close', inversion: 0, task: 'build',
        body: '保留 B♭，把 E 换成 E♭，得到 Cm7。依次比较 Cmaj7、C7、Cm7，边弹边说出三音和七音。',
        goal: '选出 C、E♭、G、B♭；能区分3/♭3与7/♭7这两件事。'
      }
    ]
  },
  {
    id: 'sus-add',
    title: '03 · 替换还是添加',
    minutes: 15,
    description: '同样出现 D，是否保留 E 和七音，会产生不同名字。',
    steps: [
      {
        title: '用 D 替换 E', root: 0, type: 'sus2', mode: 'close', inversion: 0, task: 'build',
        body: '从 C–E–G 出发，拿掉 E，再加入 D。逐个检查：此时只有 C、D、G，没有三音。先唱1–2–5，再弹。',
        goal: '选出 Csus2；任何八度都不多加 E。'
      },
      {
        title: '保留 E，再添加 D', root: 0, type: 'add9', mode: 'close', inversion: 0, task: 'build',
        body: '回到 C–E–G，保留所有音，再把 D 放到更高音区。实体琴上用双手分担，不要勉强单手跨九度。',
        goal: '选出 Cadd9 的四种音；能解释它为什么不是 Csus2。'
      },
      {
        title: '再加入大七音', root: 0, type: 'maj9', mode: 'split', inversion: 0, task: 'play',
        body: '看键盘上的左右手标记，先弹左手低音，再把右手音逐个加上。对照完整公式，读出本次省略了哪些音；听 B 加入后的变化。',
        goal: '能说明 Cmaj9 包含大七音，而 Cadd9 不包含七音。'
      },
      {
        title: '体验4回到3', root: 0, type: 'sus4', mode: 'close', inversion: 0, task: 'play',
        body: '右手先弹 C–F–G，再把 F 降到 E。固定另外两音，慢慢交替四轮，先跟唱移动声部，再齐奏。',
        goal: '在 Csus4→C 中听见 F→E；知道 sus 和弦也能保持不解决。'
      }
    ]
  },
  {
    id: 'inversions',
    title: '04 · 让低音换位置',
    minutes: 15,
    description: '音的种类可以不变，最低音改变就产生转位。',
    steps: [
      {
        title: '原位：C在最低处', root: 0, type: 'major', mode: 'close', inversion: 0, task: 'play',
        body: '实体琴右手弹 C4–E4–G4，可试1–3–5。先单弹最低音 C，再齐奏；此时根音就是最低音。',
        goal: '在图上指出根音与最低音，确认两者都为 C。'
      },
      {
        title: '第一转位：E在最低处', root: 0, type: 'major', mode: 'close', inversion: 1, task: 'play',
        body: '把最低的 C 搬高一个八度，得到 E–G–C。右手这一组白键可试1–2–5；先弹 E，再齐奏，听与原位的区别。',
        goal: '说出 C/E；根音仍为 C，实际最低音变为 E。'
      },
      {
        title: '第二转位：G在最低处', root: 0, type: 'major', mode: 'close', inversion: 2, task: 'play',
        body: '再把最低 E 搬高八度，得到 G–C–E。右手这组白键可试1–3–5。慢练 C–E–G → E–G–C → G–C–E；指法是这几组音的建议，不直接套用全部调。',
        goal: '三个排列都能说出最低音，并确认始终只有 C、E、G。'
      }
    ]
  },
  {
    id: 'two-hands',
    title: '05 · 给双手分工',
    minutes: 15,
    description: '左手交代低音，右手抓住三音、七音与关键延伸音。',
    steps: [
      {
        title: '先听完整的小九', root: 0, type: 'm9', mode: 'close', inversion: 0, task: 'play',
        body: '从低到高读出1、♭3、5、♭7、9，再分解弹。五个构成音可以交给双手；完整叠置用于理解，不要求单手全部按下。',
        goal: '能在完整结构中找到 E♭、B♭、D。'
      },
      {
        title: '换成双手实用排列', root: 0, type: 'm9', mode: 'split', inversion: 0, task: 'play',
        body: '左手先弹低音 C；右手按图逐个加入。对照省略提示，检查三音、七音与九音是否仍在。将双手分开练，最后在第一拍同时落键。',
        goal: '不盲目补齐省略音，能解释本次排列保留了哪些身份与色彩音。'
      },
      {
        title: '让13成为一个选择', root: 0, type: 'm13', mode: 'split', inversion: 0, task: 'play',
        body: '找到 A（自然13）以及 B♭（♭7），先分别弹，再按页面排列合起来。保持低音，比较小九与小十三；不用把所有中间音都塞进右手。',
        goal: '说出13是 A，了解它的效果取决于调式与排列，而不是普遍禁音。'
      }
    ]
  },
  {
    id: 'connection',
    title: '06 · 连成一段音乐',
    minutes: 20,
    description: '从单个和弦走向 ii–V–I，先练右手的两条线。',
    steps: [
      {
        title: '找到Dm7的关键音', root: 2, type: 'm7', mode: 'split', inversion: 0, task: 'play', notes: [38, 53, 57, 60],
        body: '左手找 D。右手先只弹 F 与 C，它们是 Dm7 的三音和七音。分开唱出这两个音，再同时弹，避免一开始就加太多音。',
        goal: '不依赖图形记忆，能说出 Dm7 的三音 F、七音 C。'
      },
      {
        title: '只动半音，走向G7', root: 7, type: '7', mode: 'split', inversion: 0, task: 'play', notes: [43, 53, 59, 62],
        body: '保留右手 F，把 C 降为 B；左手换 G。先练 F–C → F–B，再添加页面显示的其他音。唱出不动的 F 与移动的 C→B。',
        goal: '在 Dm7→G7 中保留共同音 F，听清 C→B。'
      },
      {
        title: '再动半音，走向Cmaj7', root: 0, type: 'maj7', mode: 'split', inversion: 0, task: 'play', notes: [48, 52, 59, 64],
        body: '保留右手 B，把 F 降为 E；左手换 C。只练 F–C → F–B → E–B，确认两个半音都清楚，再补齐实用排列。',
        goal: '听见 C→B、F→E 两条线，知道 B 在此保留为大七音。'
      },
      {
        title: '在均匀四拍中连接', root: 0, type: 'maj7', mode: 'split', inversion: 0, task: 'play', notes: [48, 52, 59, 64],
        body: '在“声部连接”选择大调 ii–V–I。先用60 BPM，每个和弦保持四拍，连弹四轮；换和弦前先看下一个低音。若跟不上就降速，仍保持均匀。',
        goal: '连续四轮不丢拍；能单独唱出一条连接线，而不仅是按完三个和弦。'
      }
    ]
  }
];

export const CORRECTIONS = [
  {
    title: '数字相对和弦根音，级数相对调的主音',
    body: 'C和弦里的1、3、5是C、E、G；G和弦里的1、3、5是G、B、D。进行中的ii、V、I则在说明它们与当前调主音的关系。'
  },
  {
    title: 'sus替换三音，add保留三音再添加',
    body: 'Csus2＝C–D–G；Cadd9＝C–E–G–D；C9还包含B♭。2与9是对应的音级，但这些和弦的构成不同。'
  },
  {
    title: 'C6的同音集合是Am7/C',
    body: 'C6＝C–E–G–A，与Am7/C音集合相同；Am/C只有C–E–A，少了G。相同音集合也可能因低音、进行与旋律而获得不同解释。'
  },
  {
    title: '省略根音与转位是不同的事',
    body: '斜线表示指定低音，例如C/E的根音仍为C，低音是E。合奏中贝斯可负责根音，钢琴右手可以省略它；不能说“根音绝不能省”。'
  },
  {
    title: '自然11、13需要看语境与排列',
    body: '大和弦中的自然11可能与三音形成明显摩擦；小和弦的自然13也要看调式、旋律与音区。它们不是普遍禁音。升十一应明确写作Cmaj7(♯11)等形式。'
  },
  {
    title: '升号与降号可以同时存在',
    body: 'C7♯5＝C–E–G♯–B♭，公式是1–3–♯5–♭7。把B♭改写成A♯会掩盖它作为七音的意义。Cdim7的七音写B♭♭，虽然在十二平均律中听起来与A相同。'
  },
  {
    title: '小调ii–V–i不等于全取旋律小调',
    body: 'Dm7♭5–G7–Cm是常见小调连接。C旋律小调上行含A与B，它的二级七和弦是Dm7。小调实践常结合自然、和声、旋律小调材料。'
  },
  {
    title: '紧张感不能单独决定属功能',
    body: 'Bdim7与省根音的G7♭9音集合相同，可在适当语境里导向C。增减和弦也能作经过或保持色彩；不能把所有不稳定和弦都定义成属和弦。'
  }
];

export const SOURCES = [
  {
    title: '和弦笔记（一）大、小、属家族',
    url: 'https://scns251qkxyc.feishu.cn/wiki/IPIiwXLbAiJmcmkWf8Sc5pxBnje',
    description: '整理大、小、属和弦及延伸音；本页将吉他指型思路改编为钢琴键盘与双手练习，并修正sus/add、C6、回避音等表述。'
  },
  {
    title: '和弦笔记（二）变化和弦',
    url: 'https://scns251qkxyc.feishu.cn/wiki/BvfXw6n1SiRBZdkAeENcDC4onXf',
    description: '提供省略、挂留、增减和弦与变化音的主题；本页补充可弹排列及声部连接，纠正七音拼写与过度概括。'
  },
  {
    title: 'Chord Map · 吉他版参考项目',
    url: 'https://github.com/Analalaa/chord-map',
    description: '沿用“构成音对照→实际排列→转位→节拍跟练”的学习结构，改为钢琴实践。'
  }
];
