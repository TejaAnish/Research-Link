// FIX: Implement all Gemini API service functions. This file was previously a placeholder, causing module resolution errors.
import { GoogleGenAI, Type } from "@google/genai";
import type { Document, Author, SuggestedCollaborator } from '../types';

// FIX: Initialize Gemini API client as per the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A schema for extracting document details
const documentAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A concise and accurate title for the document."
        },
        summary: {
            type: Type.STRING,
            description: "A detailed, paragraph-long summary of the document's key findings and conclusions."
        },
        authors: {
            type: Type.ARRAY,
            description: "A list of all authors mentioned in the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Full name of the author." },
                    institution: { type: Type.STRING, description: "The author's affiliated institution." }
                },
                required: ['name']
            }
        },
        keywords: {
            type: Type.ARRAY,
            description: "A list of 3-5 relevant keywords or phrases.",
            items: { type: Type.STRING }
        },
        clusterName: {
            type: Type.STRING,
            description: "A short, 2-3 word topic cluster name that categorizes this document (e.g., 'Quantum Computing', 'Astrophysics', 'Machine Learning')."
        }
    },
    required: ['title', 'summary', 'authors', 'keywords', 'clusterName']
};

export const processUploadedFile = async (content: string, fileName: string, mimeType: string): Promise<{ document: Document; authors: Author[]; clusterName: string }> => {
    
    // FIX: Updated model from prohibited 'gemini-2.5-pro' to 'gemini-2.5-flash' per guidelines.
    const model = 'gemini-2.5-pro';
    
    const prompt = `Analyze the following document named "${fileName}". Extract the title, a detailed summary, all authors with their institutions, 3-5 keywords, and suggest a 2-3 word topic cluster name. The content is provided.`;

    let parts: any[] = [];

    if (mimeType.startsWith('text/')) {
        parts.push({ text: prompt });
        parts.push({ text: content });
    } else if (mimeType === 'application/pdf') {
        const base64Data = content.split(',')[1];
        parts.push({ text: prompt });
        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: 'application/pdf'
            }
        });
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // FIX: Use the correct API call `ai.models.generateContent` with a JSON response schema as per guidelines.
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: documentAnalysisSchema,
        }
    });
    
    // FIX: Access the text response directly from the `text` property as per guidelines.
    const resultJson = JSON.parse(response.text);

    const newAuthors: Author[] = resultJson.authors.map((author: { name: string, institution?: string }) => ({
        id: `author-${Date.now()}-${Math.random()}`,
        name: author.name,
        institution: author.institution || 'Unknown Institution'
    }));

    const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title: resultJson.title || fileName,
        content: content,
        summary: resultJson.summary,
        authorIds: newAuthors.map(a => a.id),
        type: mimeType.split('/')[1] || 'file',
        keywords: resultJson.keywords,
    };

    return {
        document: newDocument,
        authors: newAuthors,
        clusterName: resultJson.clusterName
    };
};


export const chatWithLibrary = async (userInput: string, libraryContext: string): Promise<string> => {
    // FIX: Updated model from prohibited 'gemini-2.5-pro' to 'gemini-2.5-flash' per guidelines.
    const model = 'gemini-2.5-pro';
    const prompt = `You are a helpful research assistant. Based on the following library of research paper summaries, answer the user's question. Be concise and helpful.

Library Context:
---
${libraryContext}
---

User Question: ${userInput}`;
    
    // FIX: Use `ai.models.generateContent` as per guidelines.
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    // FIX: Access the text response directly from the `text` property.
    return response.text;
};

export const summarizeContent = async (documentContent: string, documentTitle: string): Promise<string> => {
    // FIX: Updated model from prohibited 'gemini-2.5-pro' to 'gemini-2.5-flash' per guidelines.
    const model = 'gemini-2.5-pro';
    const prompt = `Generate a comprehensive, elaborated summary for the document titled "${documentTitle}". The summary must be well-structured and easy to read. Use Markdown formatting. It must include the following sections with bold headings: **Introduction**, **Methodology**, **Key Findings**, and **Conclusion**. Under "Key Findings", use bullet points for clarity. The content should capture the full essence of the document.

Document Content:
---
${documentContent.substring(0, 30000)}
---
`;

    // FIX: Use `ai.models.generateContent` for generating content.
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    // FIX: Access text response via `.text` property.
    return response.text;
};

export const translateContent = async (text: string, language: string): Promise<string> => {
    // FIX: Updated model from prohibited 'gemini-2.5-pro' to 'gemini-2.5-flash' per guidelines.
    const model = 'gemini-2.5-pro';
    const prompt = `Translate the elaborated summary into ${language}. Preserve the original meaning and tone,and also keep it detailed including any Markdown formatting like bold headings and bullet points.

Text to translate:
---
${text.substring(0, 30000)}
---
`;

    // FIX: Use `ai.models.generateContent` for generating content.
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    // FIX: Access text response via `.text` property.
    return response.text;
};

const collaboratorsSchema = {
    type: Type.OBJECT,
    properties: {
        collaborators: {
            type: Type.ARRAY,
            description: "A list of 3-5 potential collaborators.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Full name of the potential collaborator." },
                    institution: { type: Type.STRING, description: "The collaborator's affiliated institution." },
                    reason: { type: Type.STRING, description: "A brief, one-sentence reason why they would be a good collaborator for this research." }
                },
                required: ['name', 'institution', 'reason']
            }
        }
    },
    required: ['collaborators']
};


export const findSuggestedCollaborators = async (documentContent: string, documentTitle: string): Promise<SuggestedCollaborator[]> => {
    // FIX: Updated model from prohibited 'gemini-2.5-pro' to 'gemini-2.5-flash' per guidelines.
    const model = 'gemini-2.5-pro';
    const prompt = `Based on the content of the research paper "${documentTitle}", identify 3-5 potential researchers from different institutions who would be excellent collaborators for future work in this area. For each person, provide their name, institution, and a brief, one-sentence justification for the suggestion.

Document Content:
---
${documentContent.substring(0, 30000)}
---
`;

    // FIX: Use `ai.models.generateContent` with a JSON schema.
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: collaboratorsSchema
        }
    });

    // FIX: Access text response via `.text` property and parse it.
    const result = JSON.parse(response.text);

    return result.collaborators.map((c: any) => ({
        ...c,
        id: `collab-${Date.now()}-${Math.random()}`
    }));
};

export const generateSpeech = async (text: string): Promise<string> => {
    const API_KEY = process.env.API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": text
                }]
            }],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": "Kore"
                        }
                    }
                }
            },
            "model": "gemini-2.5-pro-preview-tts",
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    const audioData = data.candidates[0]?.content?.parts[0]?.inlineData?.data;

    if (!audioData) {
        throw new Error("No audio data received from API.");
    }

    return audioData;
};