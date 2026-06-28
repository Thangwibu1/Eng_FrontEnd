import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { useTopics } from '../hooks/useTopics';

interface VocabularyFilterProps {
  value: {
    search?: string;
    type?: string;
    level?: string;
    topicId?: string;
    page: number;
    limit: number;
  };
  onChange: (newValue: any) => void;
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const types = [
  { value: 'single_word', label: 'Single Word' },
  { value: 'compound_word', label: 'Compound' },
  { value: 'collocation', label: 'Collocation' },
  { value: 'phrasal_verb', label: 'Phrasal Verb' },
  { value: 'idiom', label: 'Idiom' },
  { value: 'fixed_phrase', label: 'Fixed Phrase' },
];

export function VocabularyFilter({ value, onChange }: VocabularyFilterProps) {
  const { data: topics } = useTopics();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, search: e.target.value, page: 1 });
  };

  const handleTypeClick = (typeVal?: string) => {
    onChange({ ...value, type: typeVal, page: 1 });
  };

  const handleLevelClick = (levelVal?: string) => {
    onChange({ ...value, level: levelVal, page: 1 });
  };

  const handleTopicClick = (topicVal?: string) => {
    onChange({ ...value, topicId: topicVal, page: 1 });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft space-y-6 mb-8">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search vocabulary..."
          value={value.search || ''}
          onChange={handleSearchChange}
          className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl pl-12 pr-4 py-3.5 text-base font-medium outline-none transition"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Filter by Type */}
      <div>
        <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Vocabulary Type</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTypeClick(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
              value.type === undefined
                ? 'bg-brand-pink text-white shadow-soft'
                : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeClick(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
                value.type === t.value
                  ? 'bg-brand-pink text-white shadow-soft'
                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Level */}
      <div>
        <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">CEFR Level</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLevelClick(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
              value.level === undefined
                ? 'bg-brand-blue text-white shadow-soft'
                : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
            }`}
          >
            All Levels
          </button>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelClick(lvl)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
                value.level === lvl
                  ? 'bg-brand-blue text-white shadow-soft'
                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Topic */}
      {topics && topics.length > 0 && (
        <div className="pt-2 border-t border-gray-50">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Topic</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTopicClick(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
                value.topicId === undefined
                  ? 'bg-emerald-500 text-white shadow-soft'
                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
              }`}
            >
              All Topics
            </button>
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicClick(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition duration-200 ${
                  value.topicId === t.id
                    ? 'bg-emerald-500 text-white shadow-soft'
                    : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
