/**
 * Video Result Display Component
 * Notebook-style layout for educational content
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Copy, Share2, BookOpen, PlayCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui';
import type { VideoSummary } from '@/types/video';

interface VideoResultProps {
  result: VideoSummary;
}

export function VideoResult({ result }: VideoResultProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.summary);
      setIsCopied(true);
      toast.success('Notes copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy notes');
    }
  };

  const shareResult = async () => {
    const shareData = {
      title: result.title,
      text: `Study Notes: "${result.title}"\n\n${result.summary.slice(0, 200)}...`,
      url: `https://youtube.com/watch?v=${result.videoId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
      {/* Notebook Header Label */}
      <div className="flex items-center gap-2 mb-4 px-1 text-slate-500">
        <BookOpen className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Generated Study Notes</span>
      </div>

      {/* Main Notebook Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Source Material Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Video Thumbnail */}
            <div className="relative w-full sm:w-48 aspect-video flex-shrink-0 rounded-lg overflow-hidden shadow-sm border border-slate-200 group bg-slate-100">
              {result.thumbnail ? (
                <Image
                  src={result.thumbnail}
                  alt={result.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PlayCircle className="w-10 h-10" />
                </div>
              )}
              <a 
                href={`https://youtube.com/watch?v=${result.videoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-md">
                  <PlayCircle className="w-5 h-5 text-slate-900 ml-0.5" />
                </div>
              </a>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0 py-1 space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 leading-snug line-clamp-2">
                  {result.title}
                </h2>
                <a 
                  href={`https://youtube.com/watch?v=${result.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline mt-1 font-medium"
                >
                  View Source Video <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareResult}
                  className="h-8 px-3 text-slate-600 bg-white hover:bg-slate-50 border-slate-200"
                >
                  <Share2 className="w-3.5 h-3.5 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="h-8 px-3 text-slate-600 bg-white hover:bg-slate-50 border-slate-200"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 mr-2 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-2" />
                  )}
                  {isCopied ? 'Copied' : 'Copy Notes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Content */}
        <div className="p-8 md:p-10 bg-white">
          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-semibold prose-headings:text-slate-900 prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-li:text-slate-600 prose-li:marker:text-slate-400
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700
            prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-hr:border-slate-100 prose-hr:my-8
          ">
            <ReactMarkdown>{result.summary}</ReactMarkdown>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Generated by AI • Verify important information from the source
          </p>
        </div>
      </div>
    </div>
  );
}
