export interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorIds: string[];
  type: string;
  keywords: string[];
}

export interface Author {
  id: string;
  name: string;
  institution: string;
}

export interface TopicCluster {
  id: string;
  name: string;
  documentIds: string[];
}

export interface SuggestedCollaborator extends Author {
    reason: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'document' | 'author' | 'topic';
  x?: number;
  y?: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
}
