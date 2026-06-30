import { useState, useEffect } from 'react';
import { X, Check, Info, Sparkles } from 'lucide-react';

interface ManualVocabularyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  suggestions: {
    id: string;
    text: string;
    type: string;
    level: string;
    meaningVi: string;
    matchType: string;
  }[];
  onSave: (suggestedVocabulary: any) => void;
  onChooseSuggestion: (vocab: any) => void;
  topicsList?: { id: string; name: string }[];
}

export function ManualVocabularyFormModal({
  isOpen,
  onClose,
  selectedText,
  suggestions,
  onSave,
  onChooseSuggestion,
  topicsList = [],
}: ManualVocabularyFormModalProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState('single_word');
  const [level, setLevel] = useState('A1');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [meaningVi, setMeaningVi] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [formsInput, setFormsInput] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  // Auto pre-fill default values
  useEffect(() => {
    if (isOpen && selectedText) {
      setText(selectedText);
      
      // Guess type: if contains spaces, it's likely a collocation or phrasal verb or fixed phrase
      const tokensCount = selectedText.trim().split(/\s+/).length;
      if (tokensCount > 1) {
        setType('fixed_phrase');
      } else {
        setType('single_word');
      }
      
      setLevel('A2');
      setPartOfSpeech('');
      setMeaningVi('');
      setMeaningEn('');
      setFormsInput(selectedText);
      setSelectedTopics([]);
      setExampleEn('');
      setExampleVi('');
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meaningVi.trim()) {
      alert('Vietnamese meaning is required.');
      return;
    }

    const forms = formsInput
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      text: text.trim(),
      normalizedText: text.trim().toLowerCase(),
      type,
      level,
      partOfSpeech: partOfSpeech.trim() || null,
      meaningVi: meaningVi.trim(),
      meaningEn: meaningEn.trim() || null,
      forms: forms.length ? forms : [text.trim()],
      topics: selectedTopics,
      exampleEn: exampleEn.trim() || null,
      exampleVi: exampleVi.trim() || null,
    };

    onSave(payload);
  };

  const handleTopicToggle = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 shadow-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-text-primary flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-brand-pink" />
              Create Vocabulary Suggestion
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Describe the meaning and attributes of the selected text.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Suggestions check */}
          {suggestions.length > 0 && (
            <div className="bg-brand-blue/5 border border-brand-blue/15 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-brand-blue font-bold text-xs">
                <Info className="w-4 h-4" />
                Did you mean one of these existing dictionary items?
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (confirm(`Link selection to existing vocabulary "${item.text}"?`)) {
                        onChooseSuggestion(item);
                      }
                    }}
                    className="p-2.5 bg-white border border-gray-150 rounded-xl hover:border-brand-pink hover:shadow-soft text-left flex flex-col justify-between transition group text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-brand-pink group-hover:underline">
                          {item.text}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[8px] font-extrabold">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-text-secondary mt-1 font-medium truncate">
                        {item.meaningVi}
                      </p>
                    </div>
                    <span className="text-[8px] text-text-muted capitalize mt-1.5 block">
                      Type: {item.type.replace(/_/g, ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Vocabulary Word / Phrase
                </label>
                <input
                  type="text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
                >
                  <option value="single_word">Single Word</option>
                  <option value="compound_word">Compound Word</option>
                  <option value="collocation">Collocation</option>
                  <option value="phrasal_verb">Phrasal Verb</option>
                  <option value="idiom">Idiom</option>
                  <option value="fixed_phrase">Fixed Phrase</option>
                  <option value="sentence_pattern">Sentence Pattern</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  CEFR Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Mastery</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Part of Speech (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. verb, noun phrase"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Vietnamese Meaning *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. định nghĩa tiếng Việt"
                  value={meaningVi}
                  onChange={(e) => setMeaningVi(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  English Definition (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. English definition"
                  value={meaningEn}
                  onChange={(e) => setMeaningEn(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                Inflection Forms (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. run, runs, running, ran"
                value={formsInput}
                onChange={(e) => setFormsInput(e.target.value)}
                className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
              <span className="text-[9px] text-text-muted block mt-0.5 leading-relaxed">
                Include variant spellings or conjugations of the word so they can match automatically in reading articles.
              </span>
            </div>

            {topicsList.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Topics Context
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  {topicsList.map((topic) => {
                    const isChecked = selectedTopics.includes(topic.name);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleTopicToggle(topic.name)}
                        className={`px-3 py-1 rounded-full border text-[10px] font-bold transition ${
                          isChecked
                            ? 'bg-brand-pink border-brand-pink text-white shadow-sm'
                            : 'bg-white border-gray-150 text-text-secondary hover:bg-slate-50'
                        }`}
                      >
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-gray-50 pt-4 space-y-4">
              <span className="text-[11px] font-extrabold text-brand-pink uppercase tracking-widest block">
                Usage Example (Optional)
              </span>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary block">
                  Example (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. She decided to set off early."
                  value={exampleEn}
                  onChange={(e) => setExampleEn(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary block">
                  Example (Vietnamese)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cô ấy quyết định khởi hành sớm."
                  value={exampleVi}
                  onChange={(e) => setExampleVi(e.target.value)}
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-50 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-secondary font-bold text-xs rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-6 py-2.5 bg-brand-pink text-white font-extrabold text-xs rounded-full shadow-pastel hover:bg-brand-pink/90 active:scale-95 transition"
              >
                <Check className="w-4 h-4" />
                Add Annotation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
