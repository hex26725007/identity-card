'use client';

import { useMemo, useRef, useState } from 'react';
import FaqSection from '@/components/FaqSection';
import FeatureSection from '@/components/FeatureSection';
import ThemeToggle from '@/components/ThemeToggle';
import type { NameOption } from '@/lib/identity';
import { buildSpokenIntroduction, wordCount } from '@/lib/introduction';
import { toEnglishSurname } from '@/lib/surname';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Copy,
  Gem,
  Headphones,
  Lightbulb,
  Mail,
  Menu,
  MessageCircle,
  Mic2,
  Pause,
  PenLine,
  Play,
  Send,
  Sparkles,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-react';

const defaultNameOptions: NameOption[] = [
  {
    name: 'Iris',
    phonetic: '/ˈaɪ.rɪs/',
    pinyin: '艾瑞丝',
    meaning: '彩虹；鸢尾花',
    popularity: '常见度  ★★★☆☆',
    tags: ['温柔知性', '有创造力', '自然感'],
    reason: '像你的设计感一样，Iris 自带艺术气息，也有“彩虹”的美好寓意。读音清晰，在国际场景中很容易被记住。',
    note: 'Iris 是一个真实且常见的英文名，不是生造词。少数人会读成 “EYE-ris”，这是正确读法。',
    color: 'mint',
  },
  {
    name: 'Felix',
    phonetic: '/ˈfiː.lɪks/',
    pinyin: '菲利克斯',
    meaning: '幸运的；幸福的',
    popularity: '常见度  ★★★★☆',
    tags: ['聪明机灵', '乐观', '国际化'],
    reason: '轻快、友好又有记忆点，适合在交流中主动建立连接的你。Felix 在欧洲和英语国家都很常见。',
    note: 'Felix 的重音在第一音节，尾音是 “ks”，不要读成 “Fee-lee”。',
    color: 'blue',
  },
  {
    name: 'Leo',
    phonetic: '/ˈliː.oʊ/',
    pinyin: '利奥',
    meaning: '狮子；勇敢的人',
    popularity: '常见度  ★★★★★',
    tags: ['自信外向', '行动力强', '简洁'],
    reason: '短而有力，跨文化使用非常自然。Leo 给人的第一印象是可靠、有活力，很适合需要快速建立信任的场景。',
    note: 'Leo 在英语里通常读作 “LEE-oh”，两音节，不是单音节。',
    color: 'orange',
  },
  {
    name: 'Chloe',
    phonetic: '/ˈkloʊ.i/',
    pinyin: '克洛伊',
    meaning: '新芽；盛开的花朵',
    popularity: '常见度  ★★★★☆',
    tags: ['清新灵动', '审美在线', '亲和'],
    reason: '有新鲜感和成长感，和你对生活的好奇心很匹配。Chloe 的识别度高，拼写也相对简单。',
    note: 'Chloe 的开头是 /kl/ 连读，中文音译不等于实际发音，可以多听几遍示范。',
    color: 'coral',
  },
  {
    name: 'Ethan',
    phonetic: '/ˈiː.θən/',
    pinyin: '伊森',
    meaning: '坚定；坚强',
    popularity: '常见度  ★★★★☆',
    tags: ['沉稳可靠', '真诚', '有执行力'],
    reason: '温和但坚定，适合希望在团队和职场里传递专业感的人。Ethan 经典、自然，不会显得过于刻意。',
    note: '中间的 th 是咬舌音，舌尖轻触上下牙齿之间，不要直接读成 “s”。',
    color: 'violet',
  },
];

const defaultProfile = {
  surname: '',
  role: '职场新人',
  moods: ['温柔', '有创造力'],
  scenes: ['工作', '邮件签名'],
  intro: '我喜欢观察生活，把复杂的事情变得简单、有趣。',
};

const sameChoices = (current: string[], saved: string[]) =>
  current.length === saved.length && current.every((item) => saved.includes(item));

const roles = ['在校学生', '职场新人', '资深职场人', '管理者', '自由职业'];
const moods = ['温柔', '外向', '内敛', '自信', '沉稳', '理性', '有创造力', '可靠', '幽默'];
const scenes = ['课堂 / 校园', '工作', '社交活动', '邮件签名', '旅行'];

export default function Home() {
  const [surname, setSurname] = useState(defaultProfile.surname);
  const [role, setRole] = useState(defaultProfile.role);
  const [selectedMoods, setSelectedMoods] = useState(defaultProfile.moods);
  const [selectedScenes, setSelectedScenes] = useState(defaultProfile.scenes);
  const [intro, setIntro] = useState(defaultProfile.intro);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);
  const abortRef = useRef<AbortController | null>(null);
  const [generated, setGenerated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(false);
  const [nameOptions, setNameOptions] = useState(defaultNameOptions);
  const [introduction, setIntroduction] = useState('');
  const [selectedName, setSelectedName] = useState('Iris');
  const [expanded, setExpanded] = useState<string | null>('Iris');
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const chosen = useMemo(
    () => nameOptions.find((option) => option.name === selectedName) ?? nameOptions[0],
    [nameOptions, selectedName],
  );

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1800);
  };

  const englishSurname = toEnglishSurname(surname);
  const greeting = `Hi, I’m XX, but you can call me ${chosen.name}.`;
  const introStale =
    role !== savedProfile.role ||
    intro !== savedProfile.intro ||
    !sameChoices(selectedMoods, savedProfile.moods) ||
    !sameChoices(selectedScenes, savedProfile.scenes);
  const draftedIntro = buildSpokenIntroduction({
    name: chosen.name,
    role,
    moods: selectedMoods,
    scenes: selectedScenes,
    note: intro,
  });
  const cardIntro = introduction && !introStale && wordCount(introduction) >= 60 ? introduction : draftedIntro;

  const profileChanged =
    surname !== savedProfile.surname ||
    introStale;

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSurname(savedProfile.surname);
    setRole(savedProfile.role);
    setSelectedMoods([...savedProfile.moods]);
    setSelectedScenes([...savedProfile.scenes]);
    setIntro(savedProfile.intro);
    setError(null);
    setLoading(false);
    setGenerated(true);
  };

  const generate = async () => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const profile = { surname, role, moods: [...selectedMoods], scenes: [...selectedScenes], intro };
    setLoading(true);
    setGenerated(false);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : '生成失败，请稍后再试。');
      const names = Array.isArray(data.names) ? (data.names as NameOption[]) : [];
      if (!names[0]?.name) throw new Error('模型没有返回可用的英文名。');
      setNameOptions(names);
      setIntroduction(typeof data.introduction === 'string' ? data.introduction : '');
      setSelectedName(names[0].name);
      setExpanded(names[0].name);
      setSavedProfile(profile);
      setFromApi(true);
      setGenerated(true);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      setGenerated(true);
      setError(cause instanceof Error ? cause.message : '生成失败，请稍后再试。');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const copyIntro = async () => {
    await navigator.clipboard?.writeText(cardIntro);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><WandSparkles size={17} strokeWidth={2.5} /></div>
        <div className="brand-copy"><strong>英文身份助手</strong><span>Find Your English Identity</span></div>
        <div className="top-actions">
          <ThemeToggle />
          <button className="help-button" aria-label="帮助"><CircleHelp size={18} /></button>
          <button className="avatar-button" aria-label="用户菜单" onClick={() => setShowMenu(!showMenu)}>J</button>
          {showMenu && <div className="user-menu"><strong>今日还可生成 3 次</strong><span>这是一个无需登录的体验版本</span></div>}
        </div>
      </header>

      <div className="progress-strip"><span className="dot active" /><span className="line active" /><span className="dot active" /><span className="line" /><span className="dot" /><span>输入资料</span><b>挑选名字</b><span>生成身份卡</span></div>

      <section className="hero">
        <p className="eyebrow"><Sparkles size={13} /> PERSONAL IDENTITY STUDIO</p>
        <h1>找到你的专属英文身份</h1>
        <p>告诉我们一点关于你自己的事，让每一次自我介绍都更自然。</p>
      </section>

      <section className="workspace">
        <div className="section-heading"><div className="number">1</div><div><h2>定制你的画像</h2><p>选择最符合你的关键词</p></div><span className="hint">大约需要 30 秒</span></div>
        <div className="form-card">
          <label htmlFor="surname">你的姓</label>
          <div className="surname-row"><input id="surname" className="surname-input" value={surname} maxLength={12} placeholder="王" onChange={(event) => setSurname(event.target.value)} />{englishSurname && <span className="surname-english">{englishSurname}</span>}</div>
          <label>你的身份 <span>必选</span></label>
          <div className="chip-row role-row">{roles.map((item) => <button key={item} className={`chip ${role === item ? 'selected' : ''}`} onClick={() => setRole(item)}>{item}</button>)}</div>
          <label>你的气质 <small>可多选</small></label>
          <div className="chip-row">{moods.map((item) => <button key={item} className={`chip ${selectedMoods.includes(item) ? 'selected' : ''}`} onClick={() => toggle(item, selectedMoods, setSelectedMoods)}>{item}</button>)}</div>
          <label>主要使用场景 <small>可多选</small></label>
          <div className="chip-row">{scenes.map((item) => <button key={item} className={`chip ${selectedScenes.includes(item) ? 'selected' : ''}`} onClick={() => toggle(item, selectedScenes, setSelectedScenes)}>{item}</button>)}</div>
          <label htmlFor="intro">还有什么想告诉我们？ <small>选填</small></label>
          <textarea id="intro" value={intro} onChange={(event) => setIntro(event.target.value)} maxLength={80} />
          <div className="form-footer"><span>{intro.length}/80</span><div className="form-actions"><button type="button" className="cancel-button" onClick={cancel} disabled={!profileChanged && !loading}><X size={14} />取消</button><button className="primary-button" onClick={generate} disabled={loading}><Sparkles size={15} />{loading ? '正在生成…' : fromApi ? '重新生成专属推荐' : '生成专属推荐'} <ArrowRight size={15} /></button></div></div>
          {error && <p className="form-error">{error}</p>}
        </div>
      </section>

      <section className="workspace names-section">
        <div className="section-heading"><div className="number">2</div><div><h2>精选英文名方案</h2><p>基于你的画像，为你挑选了 {nameOptions.length} 个名字</p></div><span className="result-badge">{loading ? '生成中' : fromApi ? 'AI 已完成' : '示例方案'}</span></div>
        {!generated ? <div className="loading-card"><Sparkles size={20} />正在通过 DeepSeek 匹配最合适的英文身份…</div> : <div className="name-list">{nameOptions.map((option, index) => {
          const open = expanded === option.name;
          return <article key={option.name} className={`name-card ${selectedName === option.name ? 'chosen' : ''}`}>
            <div className="name-top"><div className="name-title"><span className="rank">{index + 1}</span><h3>{option.name}</h3><button className="pronunciation" onClick={() => speak(option.name)}>{option.phonetic}</button><span className="transliteration">{option.pinyin}</span></div><div className="card-actions"><button className="listen-button" onClick={() => speak(option.name)} aria-label={`播放 ${option.name} 发音`}>{playing && selectedName === option.name ? <Pause size={15} /> : <Volume2 size={15} />}</button><button className={`select-button ${selectedName === option.name ? 'selected' : ''}`} onClick={() => setSelectedName(option.name)}>{selectedName === option.name ? <Check size={15} /> : '选择'}</button></div></div>
            <div className="tag-row">{option.tags.map((tag) => <span key={tag} className={`soft-tag ${option.color}`}>{tag}</span>)}<span className="popularity">{option.popularity}</span></div>
            <div className="meaning"><Gem size={14} /><span><b>含义：</b>{option.meaning}</span></div>
            <p className="reason"><Lightbulb size={14} /><span>{option.reason}</span></p>
            <button className="detail-toggle" onClick={() => setExpanded(open ? null : option.name)}>{open ? '收起读法与文化提示' : '查看读法与文化提示'}{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
            {open && <div className="detail-panel"><div><b>文化小贴士</b><p>{option.note}</p></div><button className="text-action" onClick={() => speak(`${option.name}. ${option.meaning}`)}><Headphones size={14} />听一听</button></div>}
          </article>;
        })}</div>}
      </section>

      <section className="workspace identity-section">
        <div className="section-heading"><div className="number dark">3</div><div><h2>专属英文身份卡</h2><p>一张卡片，帮你自然开启每一次交流</p></div><span className="ready-badge"><Check size={12} />已生成</span></div>
        <div className="identity-card">
          <div className="identity-header"><div><span className="overline">PERSONAL IDENTITY PASS</span><span className="card-id">ID · 2025·V1.0</span></div><div className="identity-logo"><WandSparkles size={16} /></div></div>
          <div className="identity-name"><div><span>我的英文名</span><h3>{chosen.name}</h3><p>{chosen.phonetic} · {chosen.pinyin} · {chosen.meaning}</p></div><button className="sound-orb" onClick={() => speak(chosen.name)}><Volume2 size={19} /></button></div>
          <div className="identity-block"><div className="block-label"><MessageCircle size={13} /> 30 秒英文自我介绍 <button onClick={copyIntro}>{copied ? <Check size={13} /> : <Copy size={13} />}</button></div><p>{cardIntro}</p></div>
          <div className="identity-block"><div className="block-label"><Mail size={13} /> 邮箱签名（EMAIL SIGNATURE）</div><div className="signature"><div className="mini-avatar">{chosen.name.charAt(0)}</div><div><b>{englishSurname ? `${chosen.name} ${englishSurname}` : chosen.name}</b><span>{role} · Creative & Product Team</span><span>+86 138 0000 2025 · {chosen.name.toLowerCase()}@hello.com</span></div></div></div>
          <button className="share-button" onClick={copyIntro}><Send size={15} />一键复制完整身份卡 <span>复制后可直接使用</span></button>
        </div>
      </section>

      <section className="tip-banner"><div className="tip-icon"><Lightbulb size={17} /></div><div><b>第一次见面，可以这样说</b><p>{greeting}</p></div><button onClick={() => speak(greeting)}><Mic2 size={15} /></button></section>

      <FeatureSection />

      <FaqSection />

      <footer className="bottom-nav"><button className="active"><Sparkles size={17} /><span>生成名字</span></button><button><CircleHelp size={17} /><span>怎么使用</span></button><button><Gem size={17} /><span>我的名字</span></button><button><Menu size={17} /><span>更多</span></button></footer>
    </main>
  );
}
