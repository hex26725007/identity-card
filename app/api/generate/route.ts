import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/deepseek";
import { extractJson, parseIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SYSTEM_PROMPT = `你是英文起名顾问。根据用户画像，推荐 5 个真实、常见、适合跨文化场合的英文名。不要生造词，不要使用明显不适合该气质的名字。
只返回一个 JSON 对象，不要 Markdown。结构如下：
{
  "names": [
    {
      "name": "Iris",
      "phonetic": "/ˈaɪ.rɪs/",
      "pinyin": "艾瑞丝",
      "meaning": "彩虹；鸢尾花",
      "popularity": "常见度  ★★★☆☆",
      "tags": ["温柔知性", "有创造力", "自然感"],
      "reason": "为什么适合这个人，40字以内",
      "note": "读音或文化提示，40字以内",
      "color": "mint"
    }
  ],
  "introduction": "一段 30 秒英文自我介绍，口语自然，包含推荐的第一个名字"
}
要求：
- names 正好 5 个，名字互不重复。
- color 只能是 mint、blue、orange、coral、violet，且五个名字各用一种。
- popularity 使用「常见度」加上 1 到 5 颗星，实心用 ★，空心用 ☆。
- tags 每项 2 到 6 个汉字，每组 3 个。
- introduction 用英文，2 到 3 句，适合第一次见面。`;

function asList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, limit);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const role = typeof record.role === "string" ? record.role.trim().slice(0, 40) : "";
  const moods = asList(record.moods, 8);
  const scenes = asList(record.scenes, 8);
  const intro = typeof record.intro === "string" ? record.intro.trim().slice(0, 80) : "";

  if (!role) {
    return NextResponse.json({ error: "请先选择身份。" }, { status: 400 });
  }

  const profile = [
    `身份：${role}`,
    `气质与兴趣：${moods.length > 0 ? moods.join("、") : "未填写"}`,
    `使用场景：${scenes.length > 0 ? scenes.join("、") : "未填写"}`,
    `补充：${intro || "无"}`,
  ].join("\n");

  try {
    const content = await createChatCompletion([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: profile },
    ]);
    const result = parseIdentity(extractJson(content));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败，请稍后再试。";
    const status = message.includes("DEEPSEEK_API_KEY") || message.includes("API Key") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
