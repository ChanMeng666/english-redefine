import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateWord } from '@/lib/errors';
import { headers } from 'next/headers';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 速率限制状态
const RATE_LIMIT = {
    windowMs: 60 * 1000,
    maxRequests: 5,
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
            // 使用 Gemini-Pro 模型
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // 更温和的 prompt
            const prompt = `
                Please act as a creative modern linguist who reinterprets English words with fresh perspectives.
                
                Requirements:
                1. Maintain a positive and insightful tone
                2. Connect with modern life scenarios
                3. Use appropriate metaphors and humor
                4. Reflect on life
                
                Please provide a new interpretation (no more than 100 words) for the word "${word}".
                Note: Provide the explanation text directly, without any formatting or prefix.
            `;

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
                if (error.message.includes('quota')) {
                    return NextResponse.json(
                        { error: 'API call quota has been exhausted, please try again later' },
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
