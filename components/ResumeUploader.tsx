import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { ResumeData } from '../types';

interface ResumeUploaderProps {
  onResumeLoaded: (data: ResumeData) => void;
  currentResume: ResumeData | null;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeLoaded, currentResume }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
        // For this demo we rely on text files. 
        // In a real app, we'd use a library to parse PDF/Docx on client or server.
        // But since we can't use heavy pdf parsing libs easily in this constraint without external deps:
        setError("Please upload a .txt or .md file for best results in this demo.");
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

  if (currentResume) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h3 className="font-medium text-slate-900">Resume Uploaded</h3>
                    <p className="text-sm text-slate-500">{currentResume.fileName}</p>
                </div>
            </div>
            <button 
                onClick={triggerUpload}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
                <RefreshCw className="w-3 h-3" />
                Replace
            </button>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md"
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 transition-all group">
      <div className="flex flex-col items-center text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-indigo-50 transition-colors">
            <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload your Resume</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Upload a text-based resume (.txt, .md) to start analyzing job fits.
        </p>
        
        <button 
            onClick={triggerUpload}
            disabled={isReading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
        >
            {isReading ? (
                <>Reading...</>
            ) : (
                <>
                    <Upload className="w-4 h-4" />
                    Select File
                </>
            )}
        </button>
        
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
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
