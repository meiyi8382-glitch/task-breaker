import { OPENROUTER_URL, MODEL, STORAGE_KEYS, SYSTEM_PROMPT } from "./config.js";

export function getApiKey() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.apiKey) return parsed.apiKey;
        }
    } catch (_) {
        // 不是小克格式的旧数据，忽略
    }
    return localStorage.getItem("taskbreaker_api_key") || "";
}

export function setApiKey(key) {
    localStorage.setItem("taskbreaker_api_key", key);
}

function extractJson(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("模型没有返回有效的拆解结果，换个说法再试一次");
    }
    return JSON.parse(match[0]);
}

export async function breakDownTask(taskText) {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error("请先在设置里填入 OpenRouter API Key");
    }

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": location.origin,
            "X-Title": "TaskBreaker"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: taskText }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "";

    if (!replyText.trim()) {
        throw new Error("模型这次没有回复内容，换一次试试");
    }

    return extractJson(replyText);
}
