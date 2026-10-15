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
  "introduction": "一段可以连续说满约 30 秒的英文自我介绍"
}
要求：
- names 正好 5 个，名字互不重复。
- color 只能是 mint、blue、orange、coral、violet，且五个名字各用一种。
- popularity 使用「常见度」加上 1 到 5 颗星，实心用 ★，空心用 ☆。
- tags 每项 2 到 6 个汉字，每组 3 个。
- introduction 是第一次见面时可以一口气说满约 30 秒的英文口语，80 到 110 个英文单词，6 到 8 句。不要只写两三句。
- 第一句必须是 “Hi, I’m XX, but you can call me 推荐的第一个英文名.”。XX 这两个字母保持原样，表示使用者的本名，不要替换成中文名或英文名。
- 后面必须根据用户勾选的内容来写，不要编造用户没提过的具体职业、公司或经历：写进就业身份，写进全部已选气质，写进全部已选使用场景。气质和场景要写成口头能说的话，不要列关键词。
- 如果有选填补充，把它翻译成自然英文并写进介绍，不要把中文留在介绍里。如果补充为空，不要编造私人细节。
- 最后用一句见面时的收束，方便对方接话。`;

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
  const moods = asList(record.moods, 12);
  const scenes = asList(record.scenes, 8);
  const intro = typeof record.intro === "string" ? record.intro.trim().slice(0, 80) : "";

  if (!role) {
    return NextResponse.json({ error: "请先选择身份。" }, { status: 400 });
  }

  const profile = [
    `身份：${role}`,
    `气质：${moods.length > 0 ? moods.join("、") : "未填写"}`,
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
