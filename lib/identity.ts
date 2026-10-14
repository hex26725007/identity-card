export const NAME_COLORS = ["mint", "blue", "orange", "coral", "violet"] as const;

export type NameColor = (typeof NAME_COLORS)[number];

export type NameOption = {
  name: string;
  phonetic: string;
  pinyin: string;
  meaning: string;
  popularity: string;
  tags: string[];
  reason: string;
  note: string;
  color: NameColor;
};

export type IdentityResult = {
  names: NameOption[];
  introduction: string;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function extractJson(content: string): unknown {
  const fenced = content.trim().match(/```(?:json)?\s*([\s\S]*?)```/);
  const source = fenced?.[1] ?? content.trim();
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("模型返回的不是 JSON。");
  }
  return JSON.parse(source.slice(start, end + 1));
}

export function parseIdentity(payload: unknown): IdentityResult {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const rawNames = Array.isArray(record.names) ? record.names : [];

  const names = rawNames
    .slice(0, 5)
    .map((item, index) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const tags = Array.isArray(row.tags)
        ? row.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).slice(0, 3)
        : [];
      const color = NAME_COLORS.includes(row.color as NameColor) ? (row.color as NameColor) : NAME_COLORS[index % NAME_COLORS.length];
      return {
        name: asString(row.name),
        phonetic: asString(row.phonetic),
        pinyin: asString(row.pinyin),
        meaning: asString(row.meaning),
        popularity: asString(row.popularity, "常见度  ★★★☆☆"),
        tags: tags.length > 0 ? tags : ["个性化"],
        reason: asString(row.reason),
        note: asString(row.note),
        color,
      };
    })
    .filter((item) => item.name.length > 0);

  if (names.length === 0) {
    throw new Error("模型没有返回可用的英文名。");
  }

  return {
    names,
    introduction: asString(record.introduction),
  };
}
