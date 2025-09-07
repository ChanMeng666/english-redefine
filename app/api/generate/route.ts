import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateWord } from '@/lib/errors';
import { headers } from 'next/headers';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        try {
            // 使用 Gemini-1.5-Flash 模型 (更经济，适合免费配额)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // 简化的 prompt (节省token消耗)
            const prompt = `As a creative linguist, provide a fresh, positive interpretation of "${word}" in modern life context. Use metaphors and insight. Max 80 words. Response should be direct without formatting.`;

            const result = await model.generateContent(prompt);
            // const response = await result.response;
            const response = result.response;

            let text = '';

            // 处理响应
            if (response) {
                text = response.text();
                if (!text) {
                    throw new Error('Generated content is empty');
                }
            } else {
                throw new Error('No valid response received');
            }


            return NextResponse.json({
                result: text,
                remaining: RATE_LIMIT.maxRequests - (RATE_LIMIT.requests.get(ip)?.count || 0)
            });

        } catch (error) {
            console.error('Gemini API Error:', error);

            if (error instanceof Error) {
                // 处理安全过滤错误
                if (error.message.includes('SAFETY')) {
                    return NextResponse.json(
                        { error: 'Sorry, no explanation could be generated for this word, please try another word' },
                        { status: 400 }
                    );
                }
                // 处理 API 密钥错误
                if (error.message.includes('API key')) {
                    return NextResponse.json(
                        { error: 'Invalid API key' },
                        { status: 401 }
                    );
                }
                // 处理配额错误
                if (error.message.includes('quota') || error.message.includes('Too Many Requests') || error.message.includes('429')) {
                    return NextResponse.json(
                        { error: 'API调用配额已用完，请稍后再试。如果问题持续存在，请检查您的API key配额或升级到付费版本。' },
                        { status: 429 }
                    );
                }
            }

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
