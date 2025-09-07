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
    // 计算字符宽度的更精确方法
    const getCharWidth = (char: string, fontSize: number): number => {
        // 中文字符和全角字符
        if (/[\u4e00-\u9fff\uff00-\uffef]/.test(char)) {
            return fontSize * 0.9;
        }
        // 大写字母
        if (/[A-Z]/.test(char)) {
            return fontSize * 0.7;
        }
        // 小写字母
        if (/[a-z]/.test(char)) {
            return fontSize * 0.55;
        }
        // 数字
        if (/[0-9]/.test(char)) {
            return fontSize * 0.6;
        }
        // 空格
        if (char === ' ') {
            return fontSize * 0.3;
        }
        // 标点符号和其他字符
        return fontSize * 0.5;
    };

    // 计算文本实际宽度
    const getTextWidth = (text: string, fontSize: number): number => {
        return text.split('').reduce((width, char) => width + getCharWidth(char, fontSize), 0);
    };

    // 根据内容长度动态调整字体大小
    const calculateOptimalFontSizes = () => {
        const padding = 80; // 左右边距
        const availableWidth = width - padding;
        const availableHeight = height - 200; // 扣除标题、分隔线和页脚的空间
        
        // 动态调整标题字体大小
        let titleFontSize = 36;
        while (getTextWidth(word, titleFontSize) > availableWidth && titleFontSize > 20) {
            titleFontSize -= 2;
        }
        
        // 动态调整正文字体大小
        let textFontSize = 24;
        const estimatedLines = Math.ceil(explanation.length / (availableWidth / (textFontSize * 0.6)));
        const lineHeight = textFontSize * 1.4;
        const totalTextHeight = estimatedLines * lineHeight;
        
        // 如果文本高度超出可用空间，减小字体
        if (totalTextHeight > availableHeight) {
            textFontSize = Math.max(16, Math.floor((availableHeight / estimatedLines) / 1.4));
        }
        
        return {
            titleFontSize: Math.max(20, titleFontSize),
            textFontSize: Math.max(16, textFontSize),
            footerFontSize: 14
        };
    };

    const { titleFontSize, textFontSize, footerFontSize } = calculateOptimalFontSizes();

    // 改进的文本换行算法
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
        const words = text.split(/(\s+)/); // 保留空格
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + word;
            const lineWidth = getTextWidth(testLine, fontSize);
            
            if (lineWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine.trim());
                currentLine = word.trim() + ' ';
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        return lines;
    };

    // 计算可用文本宽度
    const textAreaWidth = width - 80; // 左右各40px边距
    const explanationLines = wrapText(explanation, textAreaWidth, textFontSize);
    
    // 确保文本不会超出SVG边界
    const lineHeight = textFontSize * 1.4;
    const maxLines = Math.floor((height - 200) / lineHeight);
    const finalLines = explanationLines.slice(0, maxLines);
    
    // 如果文本被截断，在最后一行添加省略号
    if (explanationLines.length > maxLines && maxLines > 0) {
        const lastLine = finalLines[finalLines.length - 1];
        finalLines[finalLines.length - 1] = lastLine.length > 50 ? 
            lastLine.substring(0, 50) + '...' : lastLine + '...';
    }

    // 生成优化的装饰图案，避免与文本重叠
    const generateDecoration = () => {
        const textEndY = 150 + finalLines.length * lineHeight;
        const safeZoneHeight = Math.max(textEndY + 20, height - 80);
        
        const patterns = [
            // 右上角圆形装饰
            `<circle cx="${width - 80}" cy="60" r="30" fill="#6366f1" opacity="0.08"/>`,
            // 左下角方形装饰（只在安全区域内）
            safeZoneHeight < height - 80 ? 
                `<rect x="20" y="${height - 60}" width="40" height="40" transform="rotate(45 40 ${height - 40})" fill="#8b5cf6" opacity="0.08"/>` : '',
            // 右侧波浪线装饰
            `<path d="M${width - 120},40 Q${width - 100},60 M${width - 120},80" stroke="#f43f5e" stroke-width="2" fill="none" opacity="0.15"/>`,
        ].filter(pattern => pattern).join('\n');

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
      ${(() => {
        const titleWidth = getTextWidth(word, titleFontSize);
        const availableWidth = width - 80;
        
        if (titleWidth > availableWidth) {
          // 如果标题太长，进行换行处理
          const titleLines = wrapText(word, availableWidth, titleFontSize);
          return titleLines.slice(0, 2).map((line, index) => `
            <text x="40" y="${60 + index * (titleFontSize * 1.2)}" font-family="'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="${titleFontSize}" font-weight="bold" fill="#1e293b">
              ${line}${index === 1 && titleLines.length > 2 ? '...' : ''}
            </text>
          `).join('');
        } else {
          return `
            <text x="40" y="80" font-family="'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="${titleFontSize}" font-weight="bold" fill="#1e293b">
              ${word}
            </text>
          `;
        }
      })()}
      
      <!-- 分隔线 -->
      ${(() => {
        const titleWidth = getTextWidth(word, titleFontSize);
        const availableWidth = width - 80;
        const separatorY = titleWidth > availableWidth ? 120 : 100;
        return `<line x1="40" y1="${separatorY}" x2="${width - 40}" y2="${separatorY}" stroke="#e2e8f0" stroke-width="2"/>`;
      })()}
      
      <!-- 说明文本 -->
      ${(() => {
        const titleWidth = getTextWidth(word, titleFontSize);
        const availableWidth = width - 80;
        const textStartY = titleWidth > availableWidth ? 170 : 150;
        return finalLines.map((line, index) => `
          <text x="40" y="${textStartY + index * lineHeight}" font-family="'PingFang SC', sans-serif" font-size="${textFontSize}" fill="#475569" xml:space="preserve">
            ${line}
          </text>
        `).join('');
      })()}
      
      <!-- 页脚 -->
      <text x="${width - 40}" y="${height - 30}" font-family="sans-serif" font-size="${footerFontSize}" fill="#94a3b8" text-anchor="end">
        Generated by Gemini
      </text>
    </svg>
  `.trim();
};
