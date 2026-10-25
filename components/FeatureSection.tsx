import { Copy, MessageCircle, Sparkles, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    icon: Sparkles,
    title: '画像定制推荐',
    description:
      '填写姓氏、就业身份、气质与使用场景，AI 会据此推荐 5 个真实常见、好记又贴合你的英文名，并说明推荐理由。',
  },
  {
    icon: Volume2,
    title: '发音与文化解读',
    description:
      '每个名字附带音标、中文谐音、含义与文化小贴士，支持试听发音，帮助你在课堂、工作或社交场合第一次就念对。',
  },
  {
    icon: MessageCircle,
    title: '约 30 秒口语介绍',
    description:
      '根据你勾选的身份、气质、场景和补充说明，生成可直接开口的英文自我介绍，并保留 “Hi, I’m XX, but you can call me …” 的开场句式。',
  },
  {
    icon: Copy,
    title: '专属身份卡输出',
    description:
      '英文名与姓氏拼写、自我介绍、邮件签名示例集中在一张身份卡里，一键复制即可用于邮件签名、个人简介或破冰对话。',
  },
];

export default function FeatureSection() {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <div className="features-inner">
        <header className="features-header">
          <p className="eyebrow">KEY FEATURES</p>
          <h2 id="features-heading">英文身份助手的核心能力</h2>
          <p>从选名、练发音到准备自我介绍，帮你把英文身份一次准备到位。</p>
        </header>
        <ul className="features-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <Icon size={19} strokeWidth={1.75} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
