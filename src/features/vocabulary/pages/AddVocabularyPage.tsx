import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Sparkles, Check, AlertCircle, BookOpen, X } from 'lucide-react';
import { createVocabularyAdmin } from '../api/vocabularyApi';
import { useTopics } from '../hooks/useTopics';

const VOCAB_TYPES = [
  { value: 'single_word', label: 'Single Word' },
  { value: 'compound_word', label: 'Compound Word' },
  { value: 'collocation', label: 'Collocation' },
  { value: 'phrasal_verb', label: 'Phrasal Verb' },
  { value: 'idiom', label: 'Idiom' },
  { value: 'fixed_phrase', label: 'Fixed Phrase' },
  { value: 'sentence_pattern', label: 'Sentence Pattern' },
];

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface MeaningForm {
  meaningVi: string;
  meaningEn: string;
  exampleEn: string;
  exampleVi: string;
}

interface FormEntry {
  formText: string;
  formType: string;
}

interface VocabForm {
  text: string;
  type: string;
  level: string;
  partOfSpeech: string;
  phonetic: string;
  meanings: MeaningForm[];
  forms: FormEntry[];
  topicIds: string[];
  status: string;
  useAi: boolean;
}

const defaultMeaning: MeaningForm = { meaningVi: '', meaningEn: '', exampleEn: '', exampleVi: '' };

const defaultForm: VocabForm = {
  text: '',
  type: 'single_word',
  level: 'B1',
  partOfSpeech: '',
  phonetic: '',
  meanings: [{ ...defaultMeaning }],
  forms: [],
  topicIds: [],
  status: 'approved',
  useAi: true,
};

export function AddVocabularyPage() {
  const [form, setForm] = useState<VocabForm>({ ...defaultForm, meanings: [{ ...defaultMeaning }] });
  const [successVocab, setSuccessVocab] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data: topics } = useTopics();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (payload: any) => createVocabularyAdmin(payload),
    onSuccess: (data) => {
      if (data.success) {
        setSuccessVocab(data.data);
        setErrorMsg(null);
        queryClient.invalidateQueries({ queryKey: ['vocabularies'] });
        // Reset form but keep useAi preference
        setForm((prev) => ({ ...defaultForm, useAi: prev.useAi, meanings: [{ ...defaultMeaning }] }));
      } else {
        setErrorMsg(data.message || 'Failed to add vocabulary');
        setSuccessVocab(null);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred';
      setErrorMsg(msg);
      setSuccessVocab(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSuccessVocab(null);
    setErrorMsg(null);

    const payload: any = {
      text: form.text.trim(),
      type: form.type || undefined,
      level: form.level || undefined,
      partOfSpeech: form.partOfSpeech.trim() || undefined,
      phonetic: form.phonetic.trim() || undefined,
      topicIds: form.topicIds,
      status: form.status,
      useAi: form.useAi,
    };

    // Build meanings (skip empty)
    const filteredMeanings = form.meanings.filter((m) => m.meaningVi.trim());
    if (filteredMeanings.length > 0) {
      payload.meanings = filteredMeanings.map((m) => ({
        meaningVi: m.meaningVi.trim(),
        meaningEn: m.meaningEn.trim() || undefined,
        examples: m.exampleEn.trim()
          ? [{ exampleEn: m.exampleEn.trim(), exampleVi: m.exampleVi.trim() || undefined }]
          : [],
      }));
    }

    // Build forms (skip empty)
    const filteredForms = form.forms.filter((f) => f.formText.trim());
    if (filteredForms.length > 0) {
      payload.forms = filteredForms.map((f) => ({
        formText: f.formText.trim(),
        formType: f.formType.trim() || undefined,
      }));
    }

    addMutation.mutate(payload);
  };

  const updateMeaning = (idx: number, key: keyof MeaningForm, val: string) => {
    const m = [...form.meanings];
    m[idx] = { ...m[idx], [key]: val };
    setForm({ ...form, meanings: m });
  };

  const addMeaning = () => {
    setForm({ ...form, meanings: [...form.meanings, { ...defaultMeaning }] });
  };

  const removeMeaning = (idx: number) => {
    if (form.meanings.length === 1) return;
    setForm({ ...form, meanings: form.meanings.filter((_, i) => i !== idx) });
  };

  const addFormEntry = () => {
    setForm({ ...form, forms: [...form.forms, { formText: '', formType: '' }] });
  };

  const updateFormEntry = (idx: number, key: keyof FormEntry, val: string) => {
    const f = [...form.forms];
    f[idx] = { ...f[idx], [key]: val };
    setForm({ ...form, forms: f });
  };

  const removeFormEntry = (idx: number) => {
    setForm({ ...form, forms: form.forms.filter((_, i) => i !== idx) });
  };

  const toggleTopic = (id: string) => {
    setForm((prev) => ({
      ...prev,
      topicIds: prev.topicIds.includes(id)
        ? prev.topicIds.filter((t) => t !== id)
        : [...prev.topicIds, id],
    }));
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-pink" />
          Add Vocabulary
        </h1>
        <p className="text-text-secondary mt-2 text-base">
          Add a new word or phrase to the database. Enable AI enrichment to auto-fill missing fields.
        </p>
      </div>

      {/* Success toast */}
      {successVocab && (
        <div className="mb-6 flex items-start gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-800">
              "{successVocab.text}" added successfully!
            </p>
            <p className="text-sm text-emerald-600 mt-0.5">
              {successVocab.type?.replace('_', ' ')} · {successVocab.level || 'No level'} · {successVocab.status}
            </p>
          </div>
          <button onClick={() => setSuccessVocab(null)} className="text-emerald-400 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="mb-6 flex items-start gap-4 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-700">Error</p>
            <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-soft space-y-6">
          {/* AI Toggle */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-purple-800">AI Auto-fill</p>
                <p className="text-xs text-purple-500">Let AI fill in missing fields automatically</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, useAi: !p.useAi }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.useAi ? 'bg-purple-500' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.useAi ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Word/Phrase */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Word / Phrase <span className="text-red-400">*</span>
            </label>
            <input
              id="vocab-text"
              type="text"
              required
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="e.g. set off, give up, environment..."
              className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl px-4 py-3.5 text-base font-medium outline-none transition"
            />
          </div>

          {/* Type + Level row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition"
              >
                {VOCAB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">CEFR Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition"
              >
                <option value="">-- Select --</option>
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Part of speech + Phonetic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Part of Speech</label>
              <input
                type="text"
                value={form.partOfSpeech}
                onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                placeholder="e.g. noun, verb..."
                className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl px-4 py-3 text-sm font-medium outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">Phonetic</label>
              <input
                type="text"
                value={form.phonetic}
                onChange={(e) => setForm({ ...form, phonetic: e.target.value })}
                placeholder="e.g. /ɪnˈvaɪrənmənt/"
                className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl px-4 py-3 text-sm font-medium outline-none transition"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">Status</label>
            <div className="flex gap-3">
              {['approved', 'draft'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                    form.status === s
                      ? s === 'approved' ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meanings Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary">
              Meanings {form.useAi && <span className="text-xs font-medium text-purple-400 ml-2">(AI will fill if empty)</span>}
            </h3>
            <button
              type="button"
              onClick={addMeaning}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-pink/80 transition"
            >
              <Plus className="w-4 h-4" /> Add Meaning
            </button>
          </div>

          {form.meanings.map((m, idx) => (
            <div key={idx} className="p-5 bg-gray-50 rounded-2xl space-y-3 relative">
              {form.meanings.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeaning(idx)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Meaning {idx + 1}</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Vietnamese meaning *"
                  value={m.meaningVi}
                  onChange={(e) => updateMeaning(idx, 'meaningVi', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
                />
                <input
                  type="text"
                  placeholder="English meaning"
                  value={m.meaningEn}
                  onChange={(e) => updateMeaning(idx, 'meaningEn', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Example (English)"
                  value={m.exampleEn}
                  onChange={(e) => updateMeaning(idx, 'exampleEn', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
                />
                <input
                  type="text"
                  placeholder="Example (Vietnamese)"
                  value={m.exampleVi}
                  onChange={(e) => updateMeaning(idx, 'exampleVi', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Word Forms Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Word Forms {form.useAi && <span className="text-xs font-medium text-purple-400 ml-2">(AI will suggest if empty)</span>}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Extra inflections: running, ran, runs...</p>
            </div>
            <button
              type="button"
              onClick={addFormEntry}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:text-brand-pink/80 transition"
            >
              <Plus className="w-4 h-4" /> Add Form
            </button>
          </div>

          {form.forms.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4 bg-gray-50 rounded-2xl">
              {form.useAi ? 'AI will suggest word forms automatically.' : 'No extra forms added.'}
            </p>
          )}

          {form.forms.map((f, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Form text (e.g. running)"
                value={f.formText}
                onChange={(e) => updateFormEntry(idx, 'formText', e.target.value)}
                className="flex-1 bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
              />
              <input
                type="text"
                placeholder="Type (e.g. gerund)"
                value={f.formType}
                onChange={(e) => updateFormEntry(idx, 'formType', e.target.value)}
                className="w-36 bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none transition"
              />
              <button
                type="button"
                onClick={() => removeFormEntry(idx)}
                className="text-gray-300 hover:text-red-400 transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Topics Card */}
        {topics && topics.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-text-primary">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((t: any) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTopic(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                    form.topicIds.includes(t.id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setForm({ ...defaultForm, useAi: form.useAi, meanings: [{ ...defaultMeaning }] })}
            className="px-6 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-text-secondary hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={addMutation.isPending || !form.text.trim()}
            id="add-vocab-submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-pink text-white text-sm font-bold shadow-soft hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {addMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Database
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
