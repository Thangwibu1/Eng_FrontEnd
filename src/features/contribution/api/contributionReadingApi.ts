import { httpClient } from '../../../shared/api/httpClient';

// --- Types ---

export interface AiMatchedItem {
  text: string;
  normalizedText: string;
  type: string;
  status: 'matched';
  vocabularyId: string;
  matchMethod: 'normalized_text' | 'form' | 'lemma' | 'manual';
  vocabulary: {
    id: string;
    text: string;
    type: string;
    level?: string;
    meaningVi: string;
  };
  ai?: {
    confidence?: number;
    sourceText?: string;
  };
}

export interface AiMissingItem {
  text: string;
  normalizedText: string;
  type: string;
  status: 'missing';
  vocabularyId: null;
  suggestedVocabulary: {
    text: string;
    normalizedText: string;
    type: string;
    level?: string;
    partOfSpeech?: string;
    meaningVi?: string;
    meaningEn?: string;
    forms?: string[];
    topics?: string[];
    exampleEn?: string;
    exampleVi?: string;
    sourceText?: string;
    confidence?: number;
  };
}

export type AiCandidateItem = AiMatchedItem | AiMissingItem;

export interface AnalyzeContributionReadingResult {
  mode: 'coverage' | 'focused';
  items: AiCandidateItem[];
  summary: {
    totalItems: number;
    matchedItems: number;
    missingItems: number;
    phraseItems: number;
    singleWordItems: number;
  };
}

// --- Legacy type kept for backward compat ---
export interface ContributionAiVocabularyItem {
  clientId?: string;
  text: string;
  normalizedText: string;
  type:
    | 'single_word'
    | 'compound_word'
    | 'collocation'
    | 'phrasal_verb'
    | 'idiom'
    | 'fixed_phrase'
    | 'sentence_pattern';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech?: string | null;
  meaningVi?: string;
  meaningEn?: string | null;
  forms?: string[];
  topics?: string[];
  exampleEn?: string | null;
  exampleVi?: string | null;
  sourceText?: string | null;
  confidence?: number;
  userEdited?: boolean;
  source?: 'ai' | 'manual';
}

// --- API ---

export async function analyzeContributionReadingWithAi(input: {
  title?: string;
  content: string;
  level?: string;
  mode?: 'focused' | 'coverage';
  maxItems?: number;
}): Promise<AnalyzeContributionReadingResult> {
  const res = await httpClient.post('/contributions/readings/ai-analyze', {
    ...input,
    mode: input.mode || 'coverage',
  });
  return res.data.data;
}

export interface ManualMatchedItem {
  source: 'manual';
  status: 'matched';
  text: string;
  normalizedText: string;
  start: number;
  end: number;
  vocabularyId: string;
  matchMethod: 'normalized_text' | 'form' | 'selected_suggestion';
  type?: string;
  level?: string;
}

export interface ManualMissingItem {
  source: 'manual';
  status: 'missing';
  text: string;
  normalizedText: string;
  start: number;
  end: number;
  suggestedVocabulary: {
    text: string;
    normalizedText: string;
    type:
      | 'single_word'
      | 'compound_word'
      | 'collocation'
      | 'phrasal_verb'
      | 'idiom'
      | 'fixed_phrase'
      | 'sentence_pattern';
    level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    partOfSpeech?: string | null;
    meaningVi: string;
    meaningEn?: string | null;
    forms: string[];
    topics: string[];
    exampleEn?: string | null;
    exampleVi?: string | null;
  };
}

export interface LookupVocabularyResult {
  status: 'matched' | 'missing';
  normalizedText: string;
  vocabulary: {
    id: string;
    text: string;
    normalizedText: string;
    type: string;
    level?: string;
    meaningVi: string;
    meaningEn?: string;
    forms: string[];
    topics: string[];
  } | null;
  suggestions: {
    id: string;
    text: string;
    type: string;
    level: string;
    meaningVi: string;
    matchType: 'similar';
  }[];
}

export async function lookupVocabulary(input: {
  text: string;
  includeSuggestions?: boolean;
}): Promise<LookupVocabularyResult> {
  const res = await httpClient.post('/vocabularies/lookup', input);
  return res.data.data;
}
