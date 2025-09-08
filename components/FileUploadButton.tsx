// FIX: Implemented the FileUploadButton component. This component was an empty file and is required by the main App component to trigger the document import modal.
import React from 'react';
import { UploadIcon } from './icons';

interface FileUploadButtonProps {
    onImportClick: () => void;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onImportClick }) => {
    return (
        <button
            onClick={onImportClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold shadow-md hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
            <UploadIcon className="w-5 h-5" />
            <span>Import Document</span>
        </button>
    );
};
