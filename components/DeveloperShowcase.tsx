'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Mail, ExternalLink, Code, Sparkles } from 'lucide-react';

const DeveloperShowcase = () => {
  return (
    <motion.section
      className="mt-16 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Logo Section */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                <img
                  src="/chan_logo.svg"
                  alt="Chan Meng Logo"
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/80 p-2 shadow-sm"
                />
              </div>
            </motion.div>

            {/* Content Section */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                    Chan Meng
                  </h3>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-sm text-slate-600">
                  Full-Stack Developer & AI Enthusiast
                </p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                Crafting modern web applications with cutting-edge technology.
                <span className="hidden sm:inline"> Need a custom website or web application? Let's bring your ideas to life!</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => window.open('mailto:chanmeng.dev@gmail.com?subject=Website Development Inquiry&body=Hi Chan, I\'m interested in discussing a custom website project...', '_blank')}
                >
                  <Mail className="w-3 h-3 mr-1.5" />
                  Get in Touch
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50"
                  onClick={() => window.open('https://github.com/ChanMeng666', '_blank')}
                >
                  <Github className="w-3 h-3 mr-1.5" />
                  Portfolio
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  onClick={() => window.open('https://github.com/ChanMeng666/english-redefine', '_blank')}
                >
                  <Code className="w-3 h-3 mr-1.5" />
                  <span className="hidden sm:inline">Source </span>Code
                </Button>
              </div>
            </div>
          </div>

          {/* Subtle call-to-action footer */}
          <motion.div
            className="mt-4 pt-4 border-t border-slate-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3 h-3" />
              Interested in custom development?
              <button
                onClick={() => window.open('mailto:chanmeng.dev@gmail.com?subject=Custom Development Inquiry', '_blank')}
                className="text-blue-600 hover:text-blue-700 underline decoration-1 underline-offset-2 transition-colors"
              >
                Let's discuss your project
              </button>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default DeveloperShowcase;
