import React, { useState } from 'react';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { polishExperience } from '../services/geminiService';

export const ExperienceHelper: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePolish = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');
    try {
      const result = await polishExperience(input);
      setOutput(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Experience Helper</h3>
          <p className="text-xs text-slate-500">Convert raw tasks into pro bullets</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Raw Experience (e.g., "I managed a club event")
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what you did simply..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none min-h-[80px]"
          />
        </div>

        <button
          onClick={handlePolish}
          disabled={isLoading || !input.trim()}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <>Thinking...</>
          ) : (
            <>
              Polish Experience <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {output && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase">
                Professional Bullets
              </label>
              <button
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-line">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};