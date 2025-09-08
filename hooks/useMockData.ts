import { useState, useEffect } from 'react';
import type { Document, Author, TopicCluster } from '../types';

const MOCK_AUTHORS: Author[] = [
  { id: 'author-1', name: 'Dr. Evelyn Reed', institution: 'Quantum Dynamics Lab' },
  { id: 'author-2', name: 'Dr. Samuel Chen', institution: 'Starlight Observatory' },
  { id: 'author-3', name: 'Dr. Lena Petrova', institution: 'BioSynth Corp' },
  { id: 'author-4', name: 'Prof. Kenji Tanaka', institution: 'Cybernetics Institute' },
];

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Entangled States and Their Applications in Quantum Computing',
    content: 'This paper explores the fundamental principles of quantum entanglement...',
    summary: 'A foundational paper on quantum entanglement, detailing its properties and potential applications in next-generation quantum computers. It covers Bell\'s theorem and experimental verifications.',
    authorIds: ['author-1'],
    type: 'pdf',
    keywords: ['quantum computing', 'entanglement', 'qubits'],
  },
  {
    id: 'doc-2',
    title: 'Observational Evidence of a New Exoplanet in the Alpha Centauri System',
    content: 'Recent telescopic data from the VLT reveals a planetary body...',
    summary: 'Presents compelling observational data from the Very Large Telescope suggesting the existence of a rocky exoplanet orbiting Proxima Centauri. The paper discusses the planet\'s mass, orbit, and potential for habitability.',
    authorIds: ['author-2'],
    type: 'pdf',
    keywords: ['exoplanet', 'astronomy', 'Alpha Centauri'],
  },
  {
    id: 'doc-3',
    title: 'CRISPR-Cas9 Mediated Gene Editing for Hereditary Diseases',
    content: 'We demonstrate a novel approach to gene editing using the CRISPR-Cas9 system...',
    summary: 'Details a successful in-vitro application of CRISPR-Cas9 to correct a genetic mutation responsible for a common hereditary disease. The study highlights the technique\'s precision and potential for therapeutic use.',
    authorIds: ['author-3'],
    type: 'pdf',
    keywords: ['gene editing', 'CRISPR', 'genetics'],
  },
  {
    id: 'doc-4',
    title: 'Advanced Neural Architectures for Real-Time Language Translation',
    content: 'This work introduces a new deep learning model, the "Transformer," which relies entirely on self-attention...',
    summary: 'Introduces a novel neural network architecture for natural language processing tasks, significantly improving the performance of machine translation. The model avoids recurrence and instead relies on attention mechanisms to draw global dependencies between input and output.',
    authorIds: ['author-4'],
    type: 'pdf',
    keywords: ['machine learning', 'NLP', 'neural networks'],
  },
];

const MOCK_CLUSTERS: TopicCluster[] = [
  { id: 'cluster-1', name: 'Quantum Physics', documentIds: ['doc-1'] },
  { id: 'cluster-2', name: 'Astrophysics', documentIds: ['doc-2'] },
  { id: 'cluster-3', name: 'Biotechnology', documentIds: ['doc-3'] },
  { id: 'cluster-4', name: 'Artificial Intelligence', documentIds: ['doc-4'] },
];

export const useMockData = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [clusters, setClusters] = useState<TopicCluster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate async data fetching
        const timer = setTimeout(() => {
            setDocuments(MOCK_DOCUMENTS);
            setAuthors(MOCK_AUTHORS);
            setClusters(MOCK_CLUSTERS);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return { documents, authors, clusters, loading, setDocuments, setAuthors, setClusters };
};
