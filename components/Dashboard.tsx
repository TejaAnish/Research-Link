import React, { useMemo } from 'react';
import type { Document, Author, TopicCluster } from '../types';
import { BookOpenIcon, SearchIcon } from './icons';

interface DocumentCardProps {
  document: Document;
  authors: Author[];
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, authors, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-transparent hover:border-cyan-500/50 dark:hover:border-cyan-400/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
  >
    <h3 className="font-bold text-slate-900 dark:text-white truncate">{document.title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
      {authors.map(a => a.name).join(', ')}
    </p>
    <div className="flex items-center mt-3 text-xs text-gray-400 dark:text-gray-500">
      <BookOpenIcon className="w-4 h-4 mr-2" />
      <span>{document.type.toUpperCase()}</span>
    </div>
  </div>
);

interface ClusterSectionProps {
  cluster: TopicCluster;
  documents: Document[];
  authors: Author[];
  onDocumentSelect: (doc: Document) => void;
}

const ClusterSection: React.FC<ClusterSectionProps> = ({ cluster, documents, authors, onDocumentSelect }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-cyan-600 dark:text-cyan-300 mb-4 border-b-2 border-slate-300 dark:border-slate-700 pb-2">{cluster.name}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map(doc => (
        <DocumentCard 
          key={doc.id}
          document={doc}
          authors={authors.filter(a => doc.authorIds.includes(a.id))}
          onClick={() => onDocumentSelect(doc)}
        />
      ))}
    </div>
  </section>
);


interface DashboardProps {
  clusters: TopicCluster[];
  documents: Document[];
  authors: Author[];
  collaborators: Author[];
  onDocumentSelect: (doc: Document) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ clusters, documents, authors, collaborators, onDocumentSelect, searchQuery, onSearchChange }) => {
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) {
      return documents;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercasedQuery) ||
      doc.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedQuery))
    );
  }, [documents, searchQuery]);

  return (
    <div className="w-full h-full flex space-x-6">
      <div className="flex-1">
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search documents by title or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {clusters.map(cluster => {
          const clusterDocs = filteredDocuments.filter(doc => cluster.documentIds.includes(doc.id));
          
          if (clusterDocs.length === 0) {
            return null;
          }

          return (
            <ClusterSection
              key={cluster.id}
              cluster={cluster}
              documents={clusterDocs}
              authors={authors}
              onDocumentSelect={onDocumentSelect}
            />
          );
        })}
      </div>
      <aside className="w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-300/50 dark:border-slate-700/50">
          <h3 className="font-bold text-lg text-cyan-600 dark:text-cyan-300 mb-4">Potential Collaborators</h3>
          <ul className="space-y-3">
            {collaborators.map(author => (
              <li key={author.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-cyan-500 dark:text-cyan-400">
                  {author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{author.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{author.institution}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};