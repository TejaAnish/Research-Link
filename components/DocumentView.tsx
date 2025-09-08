import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Document, Author, SuggestedCollaborator } from '../types';
import { BackIcon, SummarizeIcon, TranslateIcon, CollaboratorIcon, LoadingSpinnerIcon, SpeakerWaveIcon, StopIcon } from './icons';
import { summarizeContent, translateContent, findSuggestedCollaborators, generateSpeech } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DocumentViewProps {
  document: Document;
  authors: Author[];
  onBack: () => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({ document, authors, onBack }) => {
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enhancedSummary, setEnhancedSummary] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [suggestedCollaborators, setSuggestedCollaborators] = useState<SuggestedCollaborator[] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const documentAuthors = useMemo(() => {
    return authors.filter(author => document.authorIds.includes(author.id));
  }, [document, authors]);

  const handleAction = async (action: 'summarize' | 'translate' | 'collaborators') => {
    setIsLoadingAction(action);
    setActionError(null);
    try {
      if (action === 'summarize') {
        const summary = await summarizeContent(document.content, document.title);
        setEnhancedSummary(summary);
      } else if (action === 'translate') {
        const targetLanguage = 'Spanish'; // Hardcoded for simplicity
        const textToTranslate = enhancedSummary || document.summary;
        const translation = await translateContent(textToTranslate, targetLanguage);
        setTranslatedSummary(translation);
      } else if (action === 'collaborators') {
        const collaborators = await findSuggestedCollaborators(document.content, document.title);
        setSuggestedCollaborators(collaborators);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      setActionError(`Failed to perform action: ${action}. Please try again.`);
    } finally {
      setIsLoadingAction(null);
    }
  };
  
  const handleListenToggle = async () => {
    if (isSpeaking && audioSourceRef.current) {
        audioSourceRef.current.stop();
        return;
    }

    if (isLoadingAction === 'listen') return;

    setIsLoadingAction('listen');
    setActionError(null);

    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;

        const textToSpeak = enhancedSummary || document.summary;
        const base64Audio = await generateSpeech(textToSpeak);
        
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsSpeaking(false);
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setIsSpeaking(true);

    } catch (error) {
        console.error("Error during speech generation:", error);
        setActionError("Failed to generate audio. Please try again.");
    } finally {
        setIsLoadingAction(null);
    }
  };

  useEffect(() => {
    return () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
    };
  }, []);


  const ActionButton: React.FC<{
    action: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ action, icon, label, onClick, disabled }) => (
    <button
      onClick={onClick || (() => handleAction(action as any))}
      disabled={!!isLoadingAction || disabled}
      className="flex items-center w-full text-left space-x-2 px-3 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoadingAction === action ? <LoadingSpinnerIcon className="w-4 h-4" /> : icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex space-x-6 h-full">
      <div className="flex-1 overflow-y-auto pr-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline mb-4">
          <BackIcon className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <article>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{document.title}</h2>
          <p className="text-md text-gray-500 dark:text-gray-400 mb-4">
            By {documentAuthors.map(a => a.name).join(', ')}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {document.keywords.map(keyword => (
              <span key={keyword} className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 rounded-full">
                {keyword}
              </span>
            ))}
          </div>

          <section className="mb-6 bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100">Summary</h3>
            <p className="text-slate-600 dark:text-slate-300">{document.summary}</p>
          </section>

          {enhancedSummary && (
            <section className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50">
              <h3 className="text-lg font-bold mb-2 text-green-800 dark:text-green-300">Enhanced Summary</h3>
              <MarkdownRenderer content={enhancedSummary} />
            </section>
          )}

          {translatedSummary && (
            <section className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50">
              <h3 className="text-lg font-bold mb-2 text-blue-800 dark:text-blue-300">Translation (Spanish)</h3>
              <MarkdownRenderer content={translatedSummary} />
            </section>
          )}

        </article>
      </div>

      <aside className="w-80 flex-shrink-0">
        <div className="sticky top-24 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-300/50 dark:border-slate-700/50">
          <h3 className="font-bold text-lg text-cyan-600 dark:text-cyan-300 mb-4">AI-Powered Actions</h3>
          {actionError && <p className="text-sm text-red-500 mb-4">{actionError}</p>}
          <div className="space-y-3">
            <ActionButton action="summarize" icon={<SummarizeIcon className="w-4 h-4" />} label="Generate Enhanced Summary" />
             <button
                onClick={handleListenToggle}
                disabled={isLoadingAction === 'listen' || (!document.summary && !enhancedSummary)}
                className="flex items-center w-full text-left space-x-2 px-3 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isLoadingAction === 'listen' ? <LoadingSpinnerIcon className="w-4 h-4" /> : (isSpeaking ? <StopIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />)}
                <span>{isLoadingAction === 'listen' ? 'Generating...' : (isSpeaking ? 'Stop Listening' : 'Listen to Summary')}</span>
            </button>
            <ActionButton action="translate" icon={<TranslateIcon className="w-4 h-4" />} label="Translate Summary" disabled={!document.summary && !enhancedSummary} />
            <ActionButton action="collaborators" icon={<CollaboratorIcon className="w-4 h-4" />} label="Find Collaborators" />
          </div>

          {suggestedCollaborators && (
            <div className="mt-6">
              <h3 className="font-bold text-lg text-cyan-600 dark:text-cyan-300 mb-4">Suggested Collaborators</h3>
              <ul className="space-y-3">
                {suggestedCollaborators.map(author => (
                  <li key={author.id} className="p-2 rounded-md bg-slate-100 dark:bg-slate-700/50">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{author.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{author.institution}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">"{author.reason}"</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};