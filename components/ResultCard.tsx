import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import DownloadButton from './DownloadButton';
import SVGPreview from './SVGPreview';
import { buttonHoverVariants, fadeInVariants } from '@/lib/animations';

interface ResultCardProps {
    word: string;
    explanation: string;
}

const ResultCard = ({ word, explanation }: ResultCardProps) => {
    const [showPreview, setShowPreview] = useState(false);

    return (
        <Card className="mt-6 sm:mt-8 overflow-hidden bg-white">
            <CardContent className="p-4 sm:p-6 space-y-4">
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="text-2xl sm:text-3xl font-bold text-slate-800 break-words"
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {word}
                    </motion.div>
                    <motion.div
                        className="text-xs sm:text-sm text-slate-500"
                        initial={{ x: 20 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        English Redefine
                    </motion.div>
                </motion.div>

                <motion.div
                    className="h-px bg-slate-200"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                />

                <motion.div
                    className="prose prose-sm sm:prose-base prose-slate"
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-base sm:text-lg leading-relaxed text-slate-700">
                        {explanation}
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                    <motion.div
                        className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.4}}
                    >
                        Generated by Gemini
                    </motion.div>

                    <div className="flex flex-wrap gap-2 order-1 sm:order-2 w-full sm:w-auto">
                        <motion.div
                            className="w-full sm:w-auto"
                            variants={buttonHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(!showPreview)}
                                className="w-full sm:w-auto text-sm flex items-center h-9"
                            >
                                <Eye className="w-4 h-4 mr-2"/>
                                {showPreview ? 'Hide Preview' : 'Preview Card'}
                            </Button>
                        </motion.div>
                        <motion.div
                            className="w-full sm:w-auto"
                            variants={buttonHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <DownloadButton word={word} explanation={explanation}/>
                        </motion.div>
                    </div>


                </div>

                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{opacity: 0, height: 0}}
                            animate={{opacity: 1, height: 'auto'}}
                            exit={{opacity: 0, height: 0}}
                            transition={{duration: 0.3}}
                            className="overflow-hidden"
                        >
                            <div className="w-full overflow-x-auto">
                                <SVGPreview word={word} explanation={explanation}/>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ResultCard;
