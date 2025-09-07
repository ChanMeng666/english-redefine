import React, { useEffect, useState } from 'react';
import { generateSVGCard } from '@/lib/svgGenerator';

interface SVGPreviewProps {
    word: string;
    explanation: string;
}

const SVGPreview: React.FC<SVGPreviewProps> = ({ word, explanation }) => {
    const [svgContent, setSvgContent] = useState('');

    useEffect(() => {
        const svg = generateSVGCard({ word, explanation });
        setSvgContent(svg);
    }, [word, explanation]);

    return (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <div className="w-full flex justify-center items-center min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
                <div 
                    className="w-full max-w-4xl"
                    style={{ 
                        aspectRatio: '2/1',
                        minHeight: '200px'
                    }}
                >
                    <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ 
                            __html: svgContent.replace(
                                '<svg',
                                '<svg style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;"'
                            )
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SVGPreview;
