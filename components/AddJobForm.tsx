import React, { useState } from 'react';
import { Plus, Link, Loader2, Globe, Search, FileText, ArrowRight } from 'lucide-react';
import { extractJobFromUrl } from '../services/geminiService';

interface AddJobFormProps {
  onAdd: (title: string, company: string, description: string, autoAnalyze: boolean) => void;
}

export const AddJobForm: React.FC<AddJobFormProps> = ({ onAdd }) => {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  // Manual Text State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsFetching(true);
    try {
      // 1. Fetch Job Details
      const data = await extractJobFromUrl(url);
      
      // 2. Add and Trigger Analysis immediately
      onAdd(data.title || "Untitled Job", data.company || "Unknown Company", data.description, true);
      
      // 3. Reset
      setUrl('');
    } catch (error) {
      console.error(error);
      alert("Failed to fetch job details. Please try pasting the text manually.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAdd(title, company, description, true);
    setTitle('');
    setCompany('');
    setDescription('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all hover:shadow-2xl ring-4 ring-slate-50/50">
        
        {/* Tabs / Mode Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setMode('url')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'url' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Link className="w-4 h-4" />
            Paste URL
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'text' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Text
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {mode === 'url' ? (
            <form onSubmit={handleUrlSubmit} className="relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Found a job? Check your fit instantly.</h3>
                <p className="text-slate-500">Paste the LinkedIn or Career page URL below.</p>
              </div>
              
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="w-full pl-12 pr-36 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder:text-slate-400"
                  required
                />
                <div className="absolute right-2">
                    <button
                        type="submit"
                        disabled={isFetching || !url.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isFetching ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Parsing...
                            </>
                        ) : (
                            <>
                                Analyze <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
              </div>
              <p className="text-xs text-center text-slate-400 mt-4">
                AI will extract the details and compare them with your profile automatically.
              </p>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
               <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Paste Job Details</h3>
                <p className="text-slate-500">Copy the job description manually.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company</label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the full job responsibilities and requirements here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px]"
                    required
                />
              </div>
              <div className="flex justify-end">
                 <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Search className="w-4 h-4" />
                    Run Analysis
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};