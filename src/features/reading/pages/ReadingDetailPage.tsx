import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadingDetail } from '../hooks/useReadingDetail';
import { useUpdateReadingProgress } from '../hooks/useUpdateReadingProgress';
import { useMe } from '../../auth/hooks/useMe';
import { ReadingRenderer } from '../components/ReadingRenderer';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ArrowLeft, CheckCircle2, Clock, Eye } from 'lucide-react';
import { AiVocabularyAnalysisPanel } from '../../admin-reading-ai/components/AiVocabularyAnalysisPanel';

export function ReadingDetailPage() {
  const { id } = useParams();
  const { data: user } = useMe();
  const { data, isLoading } = useReadingDetail(id!);
  const updateProgress = useUpdateReadingProgress();

  const [markedCompleted, setMarkedCompleted] = useState(false);

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="Reading not found" description="The reading article does not exist or has been deleted." />;

  const { reading, vocabularyMap, userProgress } = data;

  const handleMarkCompleted = async () => {
    if (!user) return;
    try {
      await updateProgress.mutateAsync({
        readingId: reading.id || reading._id,
        progressPercent: 100,
        lastPositionIndex: reading.spans?.length || 0,
      });
      setMarkedCompleted(true);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const isAlreadyCompleted = userProgress?.completedAt || markedCompleted;

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <Link to="/readings" className="flex items-center gap-1.5 text-text-secondary hover:text-brand-pink font-bold text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>

      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
            {reading.level && (
              <span className="bg-brand-pink/20 text-brand-pink px-2.5 py-1 rounded-full">
                {reading.level}
              </span>
            )}
            {reading.estimatedReadingTimeMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {reading.estimatedReadingTimeMinutes} min read
              </span>
            )}
            {userProgress?.lookupCount > 0 && (
              <span className="flex items-center gap-1 text-brand-blue">
                <Eye className="w-3.5 h-3.5" />
                {userProgress.lookupCount} lookups
              </span>
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight max-w-2xl mx-auto">
            {reading.title}
          </h1>

          {reading.subtitle && (
            <p className="text-lg text-text-secondary max-w-xl mx-auto font-medium">
              {reading.subtitle}
            </p>
          )}
        </div>

        <ReadingRenderer
          readingId={reading.id || reading._id}
          spans={reading.spans}
          vocabularyMap={vocabularyMap}
        />

        {/* Read progress completion action */}
        {user && (
          <div className="pt-8 text-center">
            {isAlreadyCompleted ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue/10 text-brand-blue rounded-full border border-brand-blue/30 font-bold text-base shadow-sm">
                <CheckCircle2 className="w-5 h-5 fill-brand-blue text-white" />
                Completed Reading!
              </div>
            ) : (
              <button
                onClick={handleMarkCompleted}
                disabled={updateProgress.isPending}
                className="px-8 py-3.5 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-full font-bold shadow-pastel hover:shadow-lg transition duration-200"
              >
                Mark as Completed
              </button>
            )}
          </div>
        )}

        {/* Admin AI Vocabulary Analysis Panel */}
        {user?.role === 'admin' && (
          <AiVocabularyAnalysisPanel readingId={reading.id || reading._id} />
        )}
      </div>
    </div>
  );
}
