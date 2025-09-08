import React, { useState } from 'react';
import { CloseIcon, UploadIcon, LoadingSpinnerIcon } from './icons';
import { processUploadedFile } from '../services/geminiService';
import type { Document, Author } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onUploadComplete: (doc: Document, authors: Author[], clusterName: string) => void;
}

const SUPPORTED_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const ACCEPTED_FILES = ".pdf,.txt,.md";

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (!SUPPORTED_MIME_TYPES.includes(selectedFile.type)) {
        setError(`File type "${selectedFile.type}" is not supported. Please upload a PDF or TXT file.`);
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let content: string;
      if (file.type === 'application/pdf') {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      } else {
        content = await file.text();
      }
      
      const result = await processUploadedFile(content, file.name, file.type);
      onUploadComplete(result.document, result.authors, result.clusterName);
      onClose();
    } catch (e) {
      console.error("Upload failed:", e);
      setError("Failed to process the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Document</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:hover:border-slate-500 dark:hover:bg-slate-600`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                {file ? (
                  <p className="font-semibold text-cyan-600 dark:text-cyan-400 px-2">{file.name}</p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, TXT, DOCX, ODT, RTF, etc.</p>
                  </>
                )}
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept={ACCEPTED_FILES} />
            </label>
          </div>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
        </main>
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={!file || isLoading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 disabled:cursor-not-allowed flex items-center">
            {isLoading && <LoadingSpinnerIcon className="w-4 h-4 mr-2" />}
            {isLoading ? "Processing..." : "Import & Analyze"}
          </button>
        </footer>
      </div>
      <style>{`
          @keyframes fade-in-scale {
              0% { opacity: 0; transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards ease-out; }
      `}</style>
    </div>
  );
};