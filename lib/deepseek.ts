const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_FIM_URL = "https://api.deepseek.com/beta/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekErrorBody = {
  error?: {
    message?: string;
  };
};

type ChatResponse = DeepSeekErrorBody & {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type FimResponse = DeepSeekErrorBody & {
  choices?: Array<{
    text?: string | null;
  }>;
};

export type FimCompletionInput = {
  prompt: string;
  suffix?: string;
  maxTokens?: number;
};

function requireApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 DEEPSEEK_API_KEY。请在 .env.local 中填写后再生成。");
  }
  return apiKey;
}

async function postDeepSeek<T extends DeepSeekErrorBody>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${requireApiKey()}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("DeepSeek API Key 无效，请检查 DEEPSEEK_API_KEY。");
    }
    throw new Error(payload?.error?.message || `DeepSeek 请求失败（${response.status}）`);
  }
  if (!payload) {
    throw new Error("DeepSeek 没有返回有效响应，请重试。");
  }
  return payload;
}

export async function createChatCompletion(messages: ChatMessage[]): Promise<string> {
  const payload = await postDeepSeek<ChatResponse>(DEEPSEEK_CHAT_URL, {
    model: "deepseek-flash",
    messages,
    thinking: { type: "enabled" },
    reasoning_effort: "none",
    max_tokens: 4096,
    response_format: { type: "text" },
    stream: false,
    temperature: 1,
    top_p: 1,
    tool_choice: "none",
    logprobs: false,
  });

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 没有返回正文，请重试。");
  }
  return content;
}

export async function createFimCompletion({ prompt, suffix, maxTokens = 1024 }: FimCompletionInput): Promise<string> {
  const prefix = prompt.trim();
  if (!prefix) {
    throw new Error("FIM 补全需要 prompt。");
  }

  const ending = suffix?.trim();
  const payload = await postDeepSeek<FimResponse>(DEEPSEEK_FIM_URL, {
    model: "deepseek-flash",
    prompt: prefix,
    echo: false,
    logprobs: 0,
    max_tokens: Math.min(Math.max(maxTokens, 1), 4096),
    stream: false,
    temperature: 1,
    top_p: 1,
    ...(ending ? { suffix: ending } : {}),
  });

  const text = payload.choices?.[0]?.text;
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("DeepSeek 没有返回补全内容，请重试。");
  }
  return text;
}
