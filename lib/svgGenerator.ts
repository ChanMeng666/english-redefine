interface SVGCardOptions {
    word: string;
    explanation: string;
    width?: number;
    height?: number;
}

export const generateSVGCard = ({
                                    word,
                                    explanation,
                                    width = 800,
                                    height = 400
                                }: SVGCardOptions): string => {
    // 根据屏幕宽度调整字体大小和间距
    const calculateFontSize = (baseSize: number): number => {
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        if (screenWidth < 640) {
            return baseSize * 0.8;
        }
        return baseSize;
    };

    // 计算不同元素的字体大小
    const titleFontSize = calculateFontSize(36);
    const textFontSize = calculateFontSize(24);
    const footerFontSize = calculateFontSize(14);

    // 计算文本换行
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
        const chars = text.split('');
        const lines: string[] = [];
        let currentLine = '';

        chars.forEach((char) => {
            if (currentLine.length * fontSize > maxWidth - 80) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine += char;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    };

    // 包装说明文本
    const explanationLines = wrapText(explanation, width, textFontSize);

    // 生成随机装饰图案
    const generateDecoration = () => {
        const patterns = [
            `<circle cx="${width - 100}" cy="80" r="40" fill="#6366f1" opacity="0.1"/>`,
            `<rect x="40" y="${height - 100}" width="60" height="60" transform="rotate(45 70 ${height - 70})" fill="#8b5cf6" opacity="0.1"/>`,
            `<path d="M${width - 150},50 L${width - 100},80 L${width - 150},110" stroke="#f43f5e" stroke-width="2" fill="none" opacity="0.2"/>`,
        ].join('\n');

        return patterns;
    };

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#cardGradient)" rx="20"/>
      
      <!-- 装饰图案 -->
      ${generateDecoration()}
      
      <!-- 标题 -->
      <text x="40" y="80" font-family="'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="${titleFontSize}" font-weight="bold" fill="#1e293b">
        ${word}
      </text>
      
      <!-- 分隔线 -->
      <line x1="40" y1="100" x2="${width - 40}" y2="100" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- 说明文本 -->
      ${explanationLines.map((line, index) => `
        <text x="40" y="${150 + index * (textFontSize * 1.5)}" font-family="'PingFang SC', sans-serif" font-size="${textFontSize}" fill="#475569">
          ${line}
        </text>
      `).join('')}
      
      <!-- 页脚 -->
      <text x="${width - 40}" y="${height - 30}" font-family="sans-serif" font-size="${footerFontSize}" fill="#94a3b8" text-anchor="end">
        Generated by Gemini
      </text>
    </svg>
  `.trim();
};
