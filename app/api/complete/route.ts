import { NextResponse } from "next/server";
import { createFimCompletion } from "@/lib/deepseek";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const prompt = typeof record.prompt === "string" ? record.prompt.slice(0, 12000) : "";
  const suffix = typeof record.suffix === "string" ? record.suffix.slice(0, 12000) : undefined;
  const maxTokens = typeof record.maxTokens === "number" ? record.maxTokens : 1024;

  if (!prompt.trim()) {
    return NextResponse.json({ error: "请提供需要补全的 prompt。" }, { status: 400 });
  }

  try {
    const text = await createFimCompletion({ prompt, suffix, maxTokens });
    return NextResponse.json({
      text,
      completion: `${prompt}${text}${suffix ?? ""}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "补全失败，请稍后再试。";
    const status = message.includes("DEEPSEEK_API_KEY") || message.includes("API Key") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
