import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentView } from './components/DocumentView';
import { ImportModal } from './components/ImportModal';
import { Chatbot } from './components/Chatbot';
import { ThemeToggle } from './components/ThemeToggle';
import { FileUploadButton } from './components/FileUploadButton';
import { useMockData } from './hooks/useMockData';
import type { Document, Author, TopicCluster } from './types';

const App: React.FC = () => {
  const { documents, authors, clusters, loading, setDocuments, setAuthors, setClusters } = useMockData();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleBackToDashboard = () => {
    setSelectedDocument(null);
  };

  const handleUploadComplete = (newDoc: Document, newAuthors: Author[], clusterName: string) => {
    // Add new authors, avoiding duplicates
    const updatedAuthors = [...authors];
    newAuthors.forEach(newAuthor => {
        if (!authors.some(a => a.name === newAuthor.name)) {
            updatedAuthors.push(newAuthor);
        }
    });
    setAuthors(updatedAuthors);

    // Add new document
    setDocuments(prevDocs => [...prevDocs, newDoc]);
    
    // Find or create cluster
    const existingCluster = clusters.find(c => c.name.toLowerCase() === clusterName.toLowerCase());
    if (existingCluster) {
        setClusters(prevClusters => prevClusters.map(c => 
            c.id === existingCluster.id 
                ? { ...c, documentIds: [...c.documentIds, newDoc.id] } 
                : c
        ));
    } else {
        const newCluster: TopicCluster = {
            id: `cluster-${Date.now()}`,
            name: clusterName,
            documentIds: [newDoc.id],
        };
        setClusters(prevClusters => [...prevClusters, newCluster]);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
        <p>Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-300`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {selectedDocument ? 'Document Details' : 'Research Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            {!selectedDocument && <FileUploadButton onImportClick={() => setImportModalOpen(true)} />}
            <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
          </div>
        </header>

        {selectedDocument ? (
          <DocumentView
            document={selectedDocument}
            authors={authors}
            onBack={handleBackToDashboard}
          />
        ) : (
          <Dashboard
            clusters={clusters}
            documents={documents}
            authors={authors}
            collaborators={authors.slice(0, 5)} // Mock collaborators for now
            onDocumentSelect={handleDocumentSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </main>
      
      {isImportModalOpen && (
        <ImportModal
          onClose={() => setImportModalOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
      
      <Chatbot documents={documents} />
    </div>
  );
};

export default App;