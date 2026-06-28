import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMe } from '../../auth/hooks/useMe';
import { httpClient } from '../../../shared/api/httpClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useTopics } from '../../vocabulary/hooks/useTopics';
import { createTopic, deleteTopic } from '../../vocabulary/api/topicApi';
import { 
  PlusCircle, 
  Check, 
  X, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAnalyzeContributionReadingAi } from '../hooks/useAnalyzeContributionReadingAi';
import { AiSuggestionEditor } from '../components/AiSuggestionEditor';

export function ContributionPage() {
  const { data: user } = useMe();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'my' | 'new-vocab' | 'new-reading' | 'review' | 'history' | 'topics'>('my');
  
  // Submit Form States - Vocabulary
  const [vocabText, setVocabText] = useState('');
  const [vocabType, setVocabType] = useState('single_word');
  const [vocabLevel, setVocabLevel] = useState('A1');
  const [vocabMeaningVi, setVocabMeaningVi] = useState('');
  const [vocabExampleEn, setVocabExampleEn] = useState('');
  const [vocabExampleVi, setVocabExampleVi] = useState('');

  // Submit Form States - Reading
  const [readingTitle, setReadingTitle] = useState('');
  const [readingSubtitle, setReadingSubtitle] = useState('');
  const [readingBody, setReadingBody] = useState('');
  const [readingLevel, setReadingLevel] = useState('A1');
  const [readingTime, setReadingTime] = useState(5);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiAssisted, setAiAssisted] = useState(false);

  // Admin Topic States
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // Admin notes
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Contributions List
  const { data: listData, isLoading, refetch } = useQuery({
    queryKey: ['contributions'],
    queryFn: async () => {
      const res = await httpClient.get('/contributions');
      return res.data.data;
    },
    enabled: Boolean(user),
  });

  // Fetch Topics (used for Admin panel)
  const { data: topics, isLoading: topicsLoading } = useTopics();

  // Topic CRUD mutations
  const createTopicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      setNewTopicName('');
      setNewTopicDesc('');
      setSubmitMessage('Topic created successfully!');
      setTimeout(() => setSubmitMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to create topic');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      setSubmitMessage('Topic deleted successfully.');
      setTimeout(() => setSubmitMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to delete topic');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await httpClient.post('/contributions', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      setSubmitMessage('Contribution submitted successfully! Waiting for admin review.');
      // Reset forms
      setVocabText('');
      setVocabMeaningVi('');
      setVocabExampleEn('');
      setVocabExampleVi('');
      setReadingTitle('');
      setReadingSubtitle('');
      setReadingBody('');
      setReadingTime(5);
      setAiSuggestions([]);
      setAiAssisted(false);
      setActiveTab('my');
      setTimeout(() => setSubmitMessage(''), 5000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error?.message || 'Submission failed.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  });

  // Approve/Reject Mutations
  const processMutation = useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) => {
      const res = await httpClient.post(`/contributions/${id}/${action}`, { adminNote: note });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      refetch();
    }
  });

  const handleVocabSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vocabText.trim() || !vocabMeaningVi.trim()) {
      alert('Please fill in word text and Vietnamese meaning.');
      return;
    }
    const payload = {
      text: vocabText.trim(),
      normalizedText: vocabText.trim().toLowerCase(),
      type: vocabType,
      level: vocabLevel,
      meanings: [{
        meaningVi: vocabMeaningVi.trim(),
        examples: vocabExampleEn ? [{
          exampleEn: vocabExampleEn.trim(),
          exampleVi: vocabExampleVi.trim() || undefined
        }] : []
      }],
      forms: [],
      components: [],
      topicIds: []
    };
    submitMutation.mutate({
      type: 'vocabulary',
      action: 'create',
      payload
    });
  };

  const analyzeAiMutation = useAnalyzeContributionReadingAi();

  const handleAiAnalyzeReading = async () => {
    if (!readingBody.trim() || readingBody.trim().length < 50) {
      alert('Please enter at least 50 characters before using AI.');
      return;
    }
    try {
      const res = await analyzeAiMutation.mutateAsync({
        title: readingTitle.trim(),
        content: readingBody.trim(),
        level: readingLevel,
      });
      setAiSuggestions(res.items);
      setAiAssisted(true);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'AI analysis failed.');
    }
  };

  const handleReadingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!readingTitle.trim() || !readingBody.trim()) {
      alert('Please fill in title and body text.');
      return;
    }
    const aiMatchedItems = aiSuggestions.filter((x: any) => x.status === 'matched');
    const aiMissingItems = aiSuggestions.filter((x: any) => x.status === 'missing');

    const payload = {
      title: readingTitle.trim(),
      subtitle: readingSubtitle.trim() || undefined,
      bodyText: readingBody.trim(),
      level: readingLevel,
      estimatedReadingTimeMinutes: Number(readingTime),
      spans: [], // calculated in backend preprocessor
      vocabularyMap: {},
      aiAssisted,
      aiMatchedItems,
      aiMissingItems,
      suggestedVocabularyItems: aiSuggestions,
    };
    submitMutation.mutate({
      type: aiAssisted ? 'reading_with_ai_vocabulary' : 'reading',
      action: 'create',
      payload
    });
  };

  const handleProcess = (id: string, action: 'approve' | 'reject') => {
    const note = adminNotes[id] || '';
    processMutation.mutate({ id, action, note });
  };

  const handleNoteChange = (id: string, val: string) => {
    setAdminNotes({ ...adminNotes, [id]: val });
  };

  if (!user) {
    return (
      <div className="py-8 max-w-md mx-auto text-center space-y-4">
        <EmptyState title="Log In Required" description="You must be logged in to contribute new vocabularies or articles." />
        <Link to="/login" className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-full font-bold shadow-pastel hover:scale-105 transition duration-200">Log In</Link>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const contributions = listData || [];
  const pendingCount = contributions.filter((c: any) => c.status === 'pending').length;
  const historyCount = contributions.filter((c: any) => c.status !== 'pending').length;

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Contributions</h1>
        <p className="text-text-secondary mt-1 text-base">Help expand the system dictionary or submit readings for community practice.</p>
      </div>

      {submitMessage && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-700 p-4 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          {submitMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-150 text-rose-700 p-4 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-100 gap-1 pt-1.5">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 ${
            activeTab === 'my'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-brand-pink/5 rounded-t-2xl'
          }`}
        >
          My Contributions ({contributions.length})
        </button>
        <button
          onClick={() => setActiveTab('new-vocab')}
          className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 ${
            activeTab === 'new-vocab'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-brand-pink/5 rounded-t-2xl'
          }`}
        >
          Add Vocabulary
        </button>
        <button
          onClick={() => setActiveTab('new-reading')}
          className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 ${
            activeTab === 'new-reading'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-brand-pink/5 rounded-t-2xl'
          }`}
        >
          Submit Reading
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('review')}
              className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-blue/70 hover:text-brand-blue hover:bg-brand-blue/5 rounded-t-2xl'
              }`}
            >
              Review Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-blue/70 hover:text-brand-blue hover:bg-brand-blue/5 rounded-t-2xl'
              }`}
            >
              Review History ({historyCount})
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`pb-3 px-5 font-bold text-sm border-b-[3px] transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'topics'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-brand-pink/5 rounded-t-2xl'
              }`}
            >
              Manage Topics
            </button>
          </>
        )}
      </div>

      {/* Tab 1: My Contributions */}
      {activeTab === 'my' && (
        <section className="space-y-6">
          {isLoading ? (
            <Loading />
          ) : contributions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {contributions.map((item: any) => {
                const payload = JSON.parse(item.payloadJson);
                return (
                  <div key={item._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft flex flex-col justify-between hover:scale-[1.01] transition-all-180 duration-300">
                    <div className="space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase bg-slate-50 text-text-secondary border border-gray-100 px-3 py-1 rounded-full">
                            {item.type}
                          </span>
                          <span className="text-xs text-text-muted font-medium">
                            Submitted {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div>
                        {item.type === 'vocabulary' ? (
                          <div>
                            <h4 className="text-lg font-black text-text-primary">Word: <span className="text-brand-pink">{payload.text}</span></h4>
                            <p className="text-sm font-bold text-text-secondary mt-1">Meaning: {payload.meanings?.[0]?.meaningVi}</p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-lg font-black text-text-primary">Article: {payload.title}</h4>
                            <p className="text-sm text-text-secondary mt-1 truncate italic">"{payload.subtitle}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.adminNote && (
                      <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-xs mt-4">
                        <span className="font-bold text-text-primary block mb-1">Admin Feedback:</span>
                        <p className="text-text-secondary italic">"{item.adminNote}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              title="No contributions yet" 
              description="Contribute items using the other tabs to enrich our community library." 
            />
          )}
        </section>
      )}

      {/* Tab 2: New Vocabulary Form */}
      {activeTab === 'new-vocab' && (
        <section className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-soft max-w-2xl mx-auto">
          <form onSubmit={handleVocabSubmit} className="space-y-6">
            <h3 className="text-2xl font-black text-text-primary flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-brand-pink" />
              Contribute Vocabulary
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Vocabulary Word / Phrase</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. break a leg"
                  value={vocabText}
                  onChange={(e) => setVocabText(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Vocabulary Type</label>
                <select
                  value={vocabType}
                  onChange={(e) => setVocabType(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
                >
                  <option value="single_word">Single Word</option>
                  <option value="compound_word">Compound Word</option>
                  <option value="collocation">Collocation</option>
                  <option value="phrasal_verb">Phrasal Verb</option>
                  <option value="idiom">Idiom</option>
                  <option value="fixed_phrase">Fixed Phrase</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">CEFR level</label>
                <select
                  value={vocabLevel}
                  onChange={(e) => setVocabLevel(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Mastery</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Vietnamese Meaning</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chúc may mắn"
                  value={vocabMeaningVi}
                  onChange={(e) => setVocabMeaningVi(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-50 pt-4">
              <span className="text-xs font-extrabold text-brand-pink uppercase tracking-widest block">Usage Example (Optional)</span>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary block">Example Sentence (English)</label>
                <input
                  type="text"
                  placeholder="e.g. You have a show tonight? Break a leg!"
                  value={vocabExampleEn}
                  onChange={(e) => setVocabExampleEn(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary block">Example Sentence (Vietnamese Translation)</label>
                <input
                  type="text"
                  placeholder="e.g. Cậu có buổi biểu diễn tối nay hả? Chúc may mắn nhé!"
                  value={vocabExampleVi}
                  onChange={(e) => setVocabExampleVi(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full py-3.5 bg-brand-pink text-white font-extrabold rounded-full shadow-pastel hover:bg-brand-pink/90 hover:scale-[1.01] active:scale-[0.99] transition-all-180"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Vocabulary'}
            </button>
          </form>
        </section>
      )}

      {/* Tab 3: New Reading Form */}
      {activeTab === 'new-reading' && (
        <section className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-soft max-w-2xl mx-auto">
          <form onSubmit={handleReadingSubmit} className="space-y-6">
            <h3 className="text-2xl font-black text-text-primary flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-pink" />
              Contribute Reading Article
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. The Science of Memory"
                value={readingTitle}
                onChange={(e) => setReadingTitle(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Subtitle (Short Summary)</label>
              <input
                type="text"
                placeholder="e.g. How repetition helps solidify schemas in human neurons."
                value={readingSubtitle}
                onChange={(e) => setReadingSubtitle(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">CEFR level</label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
                >
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Mastery</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Est. Time (minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Article Body Text</label>
              <textarea
                required
                placeholder="Write the full English article text here. Note: Words that match the dictionary will be clickable automatically once preprocessed."
                value={readingBody}
                onChange={(e) => setReadingBody(e.target.value)}
                className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAiAnalyzeReading}
                disabled={analyzeAiMutation.isPending || readingBody.trim().length < 50}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink/10 hover:bg-brand-pink/15 text-brand-pink font-extrabold text-xs rounded-full transition disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${analyzeAiMutation.isPending ? 'animate-spin' : ''}`} />
                {analyzeAiMutation.isPending ? 'Analyzing vocabulary...' : 'Use AI to analyze vocabulary'}
              </button>
            </div>

            {aiAssisted && (
              <div className="border-t border-gray-50 pt-4">
                <AiSuggestionEditor items={aiSuggestions} onChange={setAiSuggestions} />
              </div>
            )}

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full py-3.5 bg-brand-pink text-white font-extrabold rounded-full shadow-pastel hover:bg-brand-pink/90 hover:scale-[1.01] active:scale-[0.99] transition-all-180"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Reading Article'}
            </button>
          </form>
        </section>
      )}

      {/* Tab 4: Admin pending reviews */}
      {activeTab === 'review' && isAdmin && (
        <section className="space-y-6">
          {isLoading ? (
            <Loading />
          ) : contributions.filter((c: any) => c.status === 'pending').length > 0 ? (
            <div className="space-y-6">
              {contributions.filter((c: any) => c.status === 'pending').map((item: any) => {
                const payload = JSON.parse(item.payloadJson);
                return (
                  <div key={item._id} className="bg-white rounded-3xl border border-brand-blue/30 p-6 md:p-8 shadow-soft space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase bg-brand-blue/15 text-brand-blue px-3 py-1 rounded-full">
                          Pending {item.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">
                          Submitted by {item.submittedBy?.displayName || item.submittedBy?.username} ({item.submittedBy?.email})
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcess(item._id, 'approve')}
                          disabled={processMutation.isPending}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-full shadow-soft transition hover:scale-105 active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcess(item._id, 'reject')}
                          disabled={processMutation.isPending}
                          className="flex items-center gap-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-soft transition hover:scale-105 active:scale-95"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Payload Details */}
                    <div className="bg-slate-50 border border-slate-100/50 p-5 rounded-2xl space-y-4">
                      {item.type === 'vocabulary' ? (
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-lg text-text-primary">
                            Word: <span className="text-brand-pink font-black">{payload.text}</span>
                          </h4>
                          <div className="grid gap-2 text-xs sm:grid-cols-3">
                            <p><strong>Type:</strong> {payload.type}</p>
                            <p><strong>Level:</strong> {payload.level}</p>
                            <p><strong>Meaning:</strong> {payload.meanings?.[0]?.meaningVi}</p>
                          </div>
                          {payload.meanings?.[0]?.examples?.[0] && (
                            <div className="pt-2 border-t border-gray-200 mt-2 text-xs italic space-y-1">
                              <p className="font-bold text-text-primary">Example:</p>
                              <p className="text-text-secondary">"{payload.meanings[0].examples[0].exampleEn}"</p>
                              <p className="text-text-secondary">Translation: "{payload.meanings[0].examples[0].exampleVi}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-lg text-text-primary">{payload.title}</h4>
                            {payload.aiAssisted && (
                              <span className="flex items-center gap-1 text-[10px] bg-brand-pink/15 text-brand-pink border border-brand-pink/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                AI Assisted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Level: {payload.level} · Reading time: {payload.estimatedReadingTimeMinutes} min</p>
                          <p className="text-text-secondary italic">"{payload.subtitle}"</p>
                          <div className="p-4 bg-white border border-gray-100 rounded-xl leading-relaxed text-xs text-text-primary max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {payload.bodyText}
                          </div>

                          {/* Match and Missing lists */}
                          {((payload.aiMatchedItems && payload.aiMatchedItems.length > 0) || 
                            (payload.aiMissingItems && payload.aiMissingItems.length > 0) ||
                            (payload.suggestedVocabularyItems && payload.suggestedVocabularyItems.length > 0)) && (
                            <div className="space-y-4 pt-2">
                              {payload.aiMatchedItems && payload.aiMatchedItems.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Matched Vocabulary (Will Link to DB) ({payload.aiMatchedItems.length})</span>
                                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-40 overflow-y-auto">
                                    {payload.aiMatchedItems.map((v: any, idx: number) => {
                                      const word = v.vocabulary?.text || v.text;
                                      const meaning = v.vocabulary?.meaningVi || v.meaningVi;
                                      const level = v.vocabulary?.level || v.level;
                                      return (
                                        <div key={idx} className="p-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition text-xs">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-brand-pink">{word}</p>
                                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{level}</span>
                                              <span className="text-[9px] text-text-muted capitalize">({v.type.replace('_', ' ')})</span>
                                            </div>
                                            <p className="font-semibold text-text-primary">{meaning}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {payload.aiMissingItems && payload.aiMissingItems.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Missing Vocabulary (Will Create on Approval) ({payload.aiMissingItems.length})</span>
                                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-40 overflow-y-auto">
                                    {payload.aiMissingItems.map((v: any, idx: number) => {
                                      const sv = v.suggestedVocabulary || v;
                                      return (
                                        <div key={idx} className="p-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition text-xs">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-brand-pink">{sv.text}</p>
                                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{sv.level}</span>
                                              <span className="text-[9px] text-text-muted capitalize">({sv.type.replace('_', ' ')})</span>
                                            </div>
                                            <p className="font-semibold text-text-primary">{sv.meaningVi || `[Draft] ${sv.text}`}</p>
                                            {sv.exampleEn && (
                                              <p className="text-[9px] text-text-secondary italic">"{sv.exampleEn}"</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {(!payload.aiMatchedItems && !payload.aiMissingItems && payload.suggestedVocabularyItems && payload.suggestedVocabularyItems.length > 0) && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">Submitted Vocabulary Suggestions ({payload.suggestedVocabularyItems.length})</span>
                                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-40 overflow-y-auto">
                                    {payload.suggestedVocabularyItems.map((v: any, idx: number) => (
                                      <div key={v.clientId || idx} className="p-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition text-xs">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-brand-pink">{v.text}</p>
                                            <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{v.level}</span>
                                            <span className="text-[9px] text-text-muted capitalize">({v.type.replace('_', ' ')})</span>
                                          </div>
                                          <p className="font-semibold text-text-primary">{v.meaningVi}</p>
                                          {v.exampleEn && (
                                            <p className="text-[9px] text-text-secondary italic">"{v.exampleEn}"</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Review Feedback comment box */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-widest block">Review Feedback / Admin Note</label>
                      <input
                        type="text"
                        placeholder="Add a reason or feedback for rejection/approval..."
                        value={adminNotes[item._id] || ''}
                        onChange={(e) => handleNoteChange(item._id, e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-blue focus:bg-white text-text-primary text-xs font-medium transition"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              title="Review queue empty" 
              description="No contributor submissions are pending review." 
            />
          )}
        </section>
      )}
      {/* Tab 4.5: Admin Review History */}
      {activeTab === 'history' && isAdmin && (
        <section className="space-y-6">
          {contributions.filter((c: any) => c.status !== 'pending').length > 0 ? (
            <div className="space-y-6">
              {contributions.filter((c: any) => c.status !== 'pending').map((item: any) => {
                const payload = JSON.parse(item.payloadJson);
                const reviewedDate = item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : new Date(item.updatedAt).toLocaleString();
                const submittedDate = new Date(item.createdAt).toLocaleString();
                return (
                  <div key={item._id} className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-soft space-y-6 hover:shadow-pastel transition-all-180 duration-300">
                    {/* Header bar */}
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-text-secondary px-3 py-1 rounded-full border border-slate-200">
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">
                          Submitted by {item.submittedBy?.displayName || item.submittedBy?.username} ({item.submittedBy?.email})
                        </span>
                      </div>
                      
                      <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Metadata dates */}
                    <div className="grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                      <p><strong>Submitted At:</strong> {submittedDate}</p>
                      <p><strong>Reviewed At:</strong> {reviewedDate}</p>
                    </div>

                    {/* Payload Details */}
                    <div className="bg-slate-50 border border-slate-100/50 p-5 rounded-2xl space-y-4">
                      {item.type === 'vocabulary' ? (
                        <div className="space-y-2 text-sm">
                          <h4 className="font-extrabold text-base text-text-primary">
                            Word: <span className="text-brand-pink font-black">{payload.text}</span>
                          </h4>
                          <div className="grid gap-2 text-xs sm:grid-cols-3">
                            <p><strong>Type:</strong> {payload.type}</p>
                            <p><strong>Level:</strong> {payload.level}</p>
                            <p><strong>Meaning:</strong> {payload.meanings?.[0]?.meaningVi}</p>
                          </div>
                          {payload.meanings?.[0]?.examples?.[0] && (
                            <div className="pt-2 border-t border-gray-200 mt-2 text-xs italic space-y-1">
                              <p className="font-bold text-text-primary">Example:</p>
                              <p className="text-text-secondary">"{payload.meanings[0].examples[0].exampleEn}"</p>
                              <p className="text-text-secondary">Translation: "{payload.meanings[0].examples[0].exampleVi}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-base text-text-primary">{payload.title}</h4>
                            {payload.aiAssisted && (
                              <span className="flex items-center gap-1 text-[10px] bg-brand-pink/15 text-brand-pink border border-brand-pink/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                AI Assisted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Level: {payload.level} · Reading time: {payload.estimatedReadingTimeMinutes} min</p>
                          {payload.subtitle && <p className="text-text-secondary italic">"{payload.subtitle}"</p>}
                          <div className="p-4 bg-white border border-gray-100 rounded-xl leading-relaxed text-xs text-text-primary max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {payload.bodyText}
                          </div>

                          {/* Match and Missing lists */}
                          {((payload.aiMatchedItems && payload.aiMatchedItems.length > 0) || 
                            (payload.aiMissingItems && payload.aiMissingItems.length > 0) ||
                            (payload.suggestedVocabularyItems && payload.suggestedVocabularyItems.length > 0)) && (
                            <div className="space-y-4 pt-2">
                              {payload.aiMatchedItems && payload.aiMatchedItems.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Matched Vocabulary (Linked to DB) ({payload.aiMatchedItems.length})</span>
                                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-40 overflow-y-auto">
                                    {payload.aiMatchedItems.map((v: any, idx: number) => {
                                      const word = v.vocabulary?.text || v.text;
                                      const meaning = v.vocabulary?.meaningVi || v.meaningVi;
                                      const level = v.vocabulary?.level || v.level;
                                      return (
                                        <div key={idx} className="p-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition text-xs">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-brand-pink">{word}</p>
                                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{level}</span>
                                              <span className="text-[9px] text-text-muted capitalize">({v.type.replace('_', ' ')})</span>
                                            </div>
                                            <p className="font-semibold text-text-primary">{meaning}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {payload.aiMissingItems && payload.aiMissingItems.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Missing Vocabulary (Created on Approval) ({payload.aiMissingItems.length})</span>
                                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 max-h-40 overflow-y-auto">
                                    {payload.aiMissingItems.map((v: any, idx: number) => {
                                      const sv = v.suggestedVocabulary || v;
                                      return (
                                        <div key={idx} className="p-3 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition text-xs">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-brand-pink">{sv.text}</p>
                                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">{sv.level}</span>
                                              <span className="text-[9px] text-text-muted capitalize">({sv.type.replace('_', ' ')})</span>
                                            </div>
                                            <p className="font-semibold text-text-primary">{sv.meaningVi || `[Draft] ${sv.text}`}</p>
                                            {sv.exampleEn && (
                                              <p className="text-[9px] text-text-secondary italic">"{sv.exampleEn}"</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin notes display */}
                    {item.adminNote && (
                      <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-text-primary block">Admin Feedback Note:</span>
                        <p className="text-text-secondary italic">"{item.adminNote}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              title="No review history" 
              description="No submissions have been approved or rejected yet." 
            />
          )}
        </section>
      )}


      {/* Tab 5: Admin Manage Topics */}
      {activeTab === 'topics' && isAdmin && (
        <section className="grid gap-8 md:grid-cols-3">
          {/* Create Topic Form */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-soft space-y-4 h-fit">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-brand-pink" />
              Add New Topic
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTopicName.trim()) return;
                createTopicMutation.mutate({
                  name: newTopicName.trim(),
                  description: newTopicDesc.trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel & Holiday"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Topic context description..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={createTopicMutation.isPending}
                className="w-full py-3.5 bg-brand-pink text-white font-extrabold rounded-full shadow-pastel hover:bg-brand-pink/90 hover:scale-[1.01] active:scale-[0.99] transition-all-180 text-sm"
              >
                Create Topic
              </button>
            </form>
          </div>

          {/* Topics List */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-soft space-y-4">
            <h3 className="text-xl font-bold text-text-primary">Existing Topics</h3>
            
            {topicsLoading ? (
              <Loading />
            ) : topics && topics.length > 0 ? (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto pr-2">
                {topics.map((topic: any) => (
                  <div key={topic.id} className="py-3 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{topic.name}</h4>
                      {topic.description && (
                        <p className="text-xs text-text-secondary mt-0.5">{topic.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete topic "${topic.name}"?`)) {
                          deleteTopicMutation.mutate(topic.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-full hover:text-rose-600 transition hover:scale-105 active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm italic">No topics found. Create one above.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
