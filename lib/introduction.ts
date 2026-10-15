const roleLines: Record<string, string> = {
  在校学生: "I'm a student, so a lot of my time still goes to learning and figuring out the work I want to grow into.",
  职场新人: "I'm new to the workplace, and I want people to feel that I'm serious about the work and easy to talk to.",
  资深职场人: "I've been working for quite a few years, and I try to be the person colleagues can rely on when a decision needs to be clear.",
  管理者: "I lead a team, so a lot of my day is helping people see what matters and feel comfortable talking to me.",
  自由职业: "I work for myself, so I meet new people often, and I need a name they can remember after one conversation.",
};

const moodPhrases: Record<string, string> = {
  温柔: "gentle",
  外向: "outgoing",
  内敛: "reserved",
  自信: "confident",
  沉稳: "steady",
  理性: "practical",
  有创造力: "creative",
  可靠: "reliable",
  幽默: "good-humored",
};

const scenePhrases: Record<string, string> = {
  "课堂 / 校园": "in class and around campus",
  工作: "at work",
  社交活动: "at social gatherings",
  邮件签名: "when I sign an email",
  旅行: "when I travel and meet someone for the first time",
};

const knownNotes: Record<string, string> = {
  "我喜欢观察生活，把复杂的事情变得简单、有趣。":
    "I like paying attention to everyday life and turning complicated things into something simple and interesting.",
};

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function moodSentence(moods: string[]) {
  const phrases = moods.map((mood) => moodPhrases[mood]).filter(Boolean);
  if (phrases.length === 0) return "";
  return `People who know me usually find me ${joinList(phrases)}.`;
}

function sceneSentence(scenes: string[]) {
  const phrases = scenes.map((scene) => scenePhrases[scene]).filter(Boolean);
  if (phrases.length === 0) return "I want this name to sound natural the first time someone says it.";
  return `I plan to use this name ${joinList(phrases)}, so I want it to sound natural the first time someone hears it.`;
}

function noteSentence(note: string) {
  const text = note.trim();
  if (!text) return "I'm glad to meet you, and I hope this name makes the next conversation a little easier.";
  const spoken = knownNotes[text] ?? (/[\u4e00-\u9fff]/.test(text) ? "" : /[.!?]$/.test(text) ? text : `${text}.`);
  if (!spoken) return "I also have something more personal I want this introduction to include. I'm glad to meet you.";
  return `There is one more thing I want you to know. ${spoken} I'm glad to meet you.`;
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function buildSpokenIntroduction(input: {
  name: string;
  role: string;
  moods: string[];
  scenes: string[];
  note: string;
}) {
  const roleLine = roleLines[input.role] ?? "I'm still shaping how I introduce myself, and I want that introduction to sound like a real person.";
  const parts = [
    `Hi, I’m XX, but you can call me ${input.name}.`,
    roleLine,
    moodSentence(input.moods),
    sceneSentence(input.scenes),
    noteSentence(input.note),
  ].filter(Boolean);
  return parts.join(" ");
}
