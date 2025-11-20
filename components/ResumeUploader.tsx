import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, RefreshCw, Edit2 } from 'lucide-react';
import { ResumeData } from '../types';

interface ResumeUploaderProps {
  onResumeLoaded: (data: ResumeData) => void;
  currentResume: ResumeData | null;
  variant?: 'full' | 'compact'; // New prop to control style
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onResumeLoaded, 
  currentResume,
  variant = 'full' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
        setError("Please upload a .txt or .md file.");
        return;
    }

    setError(null);
    setIsReading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onResumeLoaded({
        fileName: file.name,
        content: content,
        lastUpdated: Date.now()
      });
      setIsReading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsReading(false);
    };
    reader.readAsText(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // COMPACT MODE (For Header/Sidebar)
  if (variant === 'compact') {
      return (
        <>
            <button 
                onClick={triggerUpload}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors border border-slate-200"
            >
                {currentResume ? (
                    <>
                         <FileText className="w-4 h-4" />
                         <span className="truncate max-w-[100px] hidden sm:inline">{currentResume.fileName}</span>
                         <Edit2 className="w-3 h-3 opacity-50" />
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Resume</span>
                    </>
                )}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".txt,.md"
            />
        </>
      );
  }

  // FULL MODE (For Landing/Initial Setup)
  return (
    <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-all group shadow-sm hover:shadow-md w-full max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="bg-indigo-50 p-5 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Master Resume</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs">
          Upload your full experience in a text file (.txt, .md). 
          <br/>We'll use this to analyze your fit for any job.
        </p>
        
        <button 
            onClick={triggerUpload}
            disabled={isReading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
        >
            {isReading ? (
                <>Reading...</>
            ) : (
                <>
                    <Upload className="w-5 h-5" />
                    Select Resume File
                </>
            )}
        </button>
        
        {error && <p className="text-red-500 text-sm mt-6 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md"
        />
      </div>
    </div>
  );
};