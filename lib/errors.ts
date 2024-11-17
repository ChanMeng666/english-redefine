export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export const validateWord = (word: string): string | null => {
    if (!word) {
        return 'Please enter a word';
    }

    if (word.length > 50) {
        return 'Word length cannot exceed 50 characters';
    }

    // 修改英文验证规则，使其更包容
    // 允许：英文字母、空格、连字符、撇号、句点
    if (!/^[a-zA-Z\s\-'\.]+$/.test(word)) {
        return 'Please only use English letters and basic punctuation';
    }

    // 验证是否包含危险的特殊字符
    if (/[<>{}[\]\\\/]/.test(word)) {
        return 'Word cannot contain special characters';
    }

    return null;
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ValidationError) {
        return error.message;
    }

    if (error instanceof ApiError) {
        switch (error.status) {
            case 429:
                return 'Requests are too frequent, please try again later';
            case 401:
                return 'API key is invalid, please contact the administrator';
            case 503:
                return 'Service is temporarily unavailable. Please try again later.';
            default:
                return error.message || 'Server error, please try again later';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error has occurred.';
};
