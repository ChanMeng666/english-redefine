import { NextResponse } from 'next/server';
import { validateWord } from '@/lib/errors';
import { headers } from 'next/headers';
import { SYSTEM_PROMPT, getUserPrompt } from '@/lib/prompts';

// 速率限制状态 (降低免费API的请求频率)
const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1分钟窗口
    maxRequests: 3,      // 每分钟最多3次请求 (适应免费配额)
    requests: new Map<string, { count: number; timestamp: number }>()
};

// 清理过期的速率限制记录
const cleanupRateLimits = () => {
    const now = Date.now();
    for (const [ip, data] of RATE_LIMIT.requests.entries()) {
        if (now - data.timestamp > RATE_LIMIT.windowMs) {
            RATE_LIMIT.requests.delete(ip);
        }
    }
};

// 检查速率限制
const checkRateLimit = (ip: string): boolean => {
    cleanupRateLimits();

    const now = Date.now();
    const requestData = RATE_LIMIT.requests.get(ip);

    if (!requestData) {
        RATE_LIMIT.requests.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (now - requestData.timestamp > RATE_LIMIT.windowMs) {
        RATE_LIMIT.requests.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (requestData.count >= RATE_LIMIT.maxRequests) {
        return false;
    }

    requestData.count += 1;
    return true;
};

export async function POST(req: Request) {
    try {
        // 获取客户端IP
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor || 'unknown';

        // 检查速率限制
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests, please try again later' },
                { status: 429 }
            );
        }

        const { word } = await req.json();

        // 验证输入
        const validationError = validateWord(word);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        // 检查API密钥
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        try {
            // 使用 gpt-4o-mini 模型 (更经济，适合免费配额)
            // 使用 fetch 直接调用 OpenAI REST API (兼容 Cloudflare Workers 运行时)
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: getUserPrompt(word) }
                    ],
                    max_tokens: 300,
                }),
            });

            // 处理 HTTP 错误
            if (!response.ok) {
                if (response.status === 401) {
                    return NextResponse.json(
                        { error: 'Invalid API key' },
                        { status: 401 }
                    );
                }
                if (response.status === 429) {
                    return NextResponse.json(
                        { error: 'API调用配额已用完，请稍后再试。如果问题持续存在，请检查您的API key配额或升级到付费版本。' },
                        { status: 429 }
                    );
                }
                throw new Error(`OpenAI API returned ${response.status}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;

            if (!text) {
                // 检查是否被内容过滤
                if (data.choices?.[0]?.finish_reason === 'content_filter') {
                    return NextResponse.json(
                        { error: 'Sorry, no explanation could be generated for this word, please try another word' },
                        { status: 400 }
                    );
                }
                throw new Error('Generated content is empty');
            }

            return NextResponse.json({
                result: text,
                remaining: RATE_LIMIT.maxRequests - (RATE_LIMIT.requests.get(ip)?.count || 0)
            });

        } catch (error) {
            console.error('OpenAI API Error:', error);

            return NextResponse.json(
                { error: 'Generation failed, please try again' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Server error, please try again later' },
            { status: 500 }
        );
    }
}
