type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: '英文身份助手是做什么的？',
    answer:
      '它会根据你填写的姓氏、就业身份、气质和使用场景，推荐合适的英文名，并生成约 30 秒的英文自我介绍与身份卡内容，方便你在课堂、工作或邮件里使用。',
  },
  {
    question: '需要先注册账号吗？',
    answer:
      '目前可以直接在网页上使用，无需登录。填写画像后点击「生成专属推荐」，即可查看名字方案与身份卡；页面会先展示示例，生成后会替换为 AI 结果。',
  },
  {
    question: '「Hi, I’m XX」里的 XX 是什么意思？',
    answer:
      'XX 是占位符，表示你可以用中文本名或护照上的名字来开口。实际使用时，把 XX 换成你的真实名字即可；对方通常会用你推荐的英文名来称呼你。',
  },
  {
    question: '生成的名字可靠吗？可以随便用吗？',
    answer:
      '推荐的都是英语国家常见、真实存在的名字，并附带读音与文化说明。最终是否采用、是否用于正式场合，仍建议你结合学校、公司或签证等要求自行确认。',
  },
];

export default function FaqSection() {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-inner">
        <header className="faq-header">
          <span className="faq-badge">FAQ</span>
          <h2 id="faq-heading">常见问题</h2>
          <p>关于选英文名、自我介绍与身份卡，这里是最常被问到的事。</p>
        </header>
        <ol className="faq-list">
          {faqs.map((item, index) => (
            <li key={item.question} className="faq-item">
              <div className="faq-index" aria-hidden="true">
                {index + 1}
              </div>
              <div className="faq-copy">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
