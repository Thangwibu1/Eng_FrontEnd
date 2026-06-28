import { useParams, Link } from 'react-router-dom';
import { useVocabularyDetail } from '../hooks/useVocabularyDetail';
import { useSaveVocabulary } from '../hooks/useSaveVocabulary';
import { useMarkVocabularyKnown } from '../hooks/useMarkVocabularyKnown';
import { useMarkVocabularyDifficult } from '../hooks/useMarkVocabularyDifficult';
import { useMe } from '../../auth/hooks/useMe';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Bookmark, CheckCircle2, AlertTriangle, ArrowLeft, Volume2 } from 'lucide-react';

export function VocabularyDetailPage() {
  const { id } = useParams();
  const { data: user } = useMe();
  
  const { data, isLoading } = useVocabularyDetail(id!);
  const saveMutation = useSaveVocabulary();
  const knownMutation = useMarkVocabularyKnown();
  const difficultMutation = useMarkVocabularyDifficult();

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="Word not found" description="This vocabulary item does not exist or has been deleted." />;

  const { vocabulary, userProgress } = data;

  const playAudio = () => {
    if (vocabulary.audioUrl) {
      const audio = new Audio(vocabulary.audioUrl);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const currentStatus = userProgress?.status || 'new';

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <Link to="/vocabularies" className="flex items-center gap-1.5 text-text-secondary hover:text-brand-pink font-bold text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Dictionary
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-brand-sky/20 text-brand-blue px-3 py-1 rounded-full">
                {vocabulary.type?.replace('_', ' ')}
              </span>
              {vocabulary.level && (
                <span className="text-xs font-bold bg-brand-pink/20 text-brand-pink px-2.5 py-1 rounded-full">
                  {vocabulary.level}
                </span>
              )}
              {userProgress?.status && (
                <span className="text-xs font-bold bg-gray-100 text-text-secondary px-2.5 py-1 rounded-full capitalize">
                  Status: {currentStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
                {vocabulary.text}
              </h1>
              {vocabulary.audioUrl && (
                <button
                  onClick={playAudio}
                  className="p-2 bg-brand-sky/20 hover:bg-brand-sky/35 text-brand-blue rounded-full transition"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {vocabulary.phonetic && (
              <p className="text-lg text-text-secondary font-mono mt-1">{vocabulary.phonetic}</p>
            )}
          </div>

          {/* Action buttons (only if logged in) */}
          {user && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => saveMutation.mutate(vocabulary.id)}
                disabled={saveMutation.isPending}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-sm font-bold border transition duration-200 ${
                  currentStatus === 'saved'
                    ? 'bg-brand-pink/10 border-brand-pink text-brand-pink'
                    : 'bg-white border-gray-200 text-text-secondary hover:border-brand-pink hover:text-brand-pink'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${currentStatus === 'saved' ? 'fill-brand-pink' : ''}`} />
                {currentStatus === 'saved' ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={() => knownMutation.mutate(vocabulary.id)}
                disabled={knownMutation.isPending}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-sm font-bold border transition duration-200 ${
                  currentStatus === 'known'
                    ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                    : 'bg-white border-gray-200 text-text-secondary hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Known
              </button>

              <button
                onClick={() => difficultMutation.mutate(vocabulary.id)}
                disabled={difficultMutation.isPending}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-sm font-bold border transition duration-200 ${
                  currentStatus === 'difficult'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600'
                    : 'bg-white border-gray-200 text-text-secondary hover:border-amber-500 hover:text-amber-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Difficult
              </button>
            </div>
          )}
        </div>

        {/* Meanings & Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text-primary">Meanings</h2>
          {vocabulary.meanings?.map((meaning: any, index: number) => (
            <div key={index} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-lg font-bold text-text-primary">
                  {index + 1}. {meaning.meaningVi}
                </p>
                {meaning.meaningEn && (
                  <p className="text-text-secondary text-base italic">{meaning.meaningEn}</p>
                )}
                {meaning.note && (
                  <p className="text-xs text-brand-pink bg-brand-pink/5 px-2 py-0.5 rounded inline-block font-medium">
                    Note: {meaning.note}
                  </p>
                )}
              </div>

              {meaning.examples?.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Examples</h4>
                  <div className="space-y-2">
                    {meaning.examples.map((ex: any, exIdx: number) => (
                      <div key={exIdx} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm text-sm">
                        <p className="font-semibold text-text-primary">{ex.exampleEn}</p>
                        {ex.exampleVi && (
                          <p className="text-text-secondary mt-0.5">{ex.exampleVi}</p>
                        )}
                        {ex.source && (
                          <span className="text-[10px] text-gray-400 mt-1 block">Source: {ex.source}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Word Forms */}
        {vocabulary.forms?.length > 1 && (
          <div className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-text-primary">Other Word Forms</h2>
            <div className="flex flex-wrap gap-2.5">
              {vocabulary.forms.map((f: any, fIdx: number) => (
                <div
                  key={fIdx}
                  className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm flex items-center gap-2"
                >
                  <span className="font-bold text-text-primary">{f.formText}</span>
                  {f.formType && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-text-secondary rounded-full">
                      {f.formType}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
