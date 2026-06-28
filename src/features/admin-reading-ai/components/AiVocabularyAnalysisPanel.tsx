import { useState } from 'react';
import { Sparkles, RefreshCw, Layers, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { useReadingDetail } from '../../reading/hooks/useReadingDetail';
import {
  useReadingAiSuggestions,
  useAnalyzeReadingWithAi,
  useReprocessReading,
} from '../hooks/useReadingAiSuggestions';
import { AiSuggestionTable } from './AiSuggestionTable';

interface AiVocabularyAnalysisPanelProps {
  readingId: string;
}

export function AiVocabularyAnalysisPanel({ readingId }: AiVocabularyAnalysisPanelProps) {
  const { data: readingDetail, refetch: refetchReading } = useReadingDetail(readingId);
  const reading = readingDetail?.reading;

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useReadingAiSuggestions(
    readingId,
    activeTab === 'all' ? undefined : activeTab
  );

  const analyzeMutation = useAnalyzeReadingWithAi();
  const reprocessMutation = useReprocessReading();

  if (!reading) return null;

  const handleAnalyze = async (force = false) => {
    try {
      await analyzeMutation.mutateAsync({ readingId, force });
      refetchReading();
    } catch (err) {
      console.error('AI Analysis failed:', err);
    }
  };

  const handleReprocess = async () => {
    if (confirm('Are you sure you want to reprocess reading spans based on approved vocabulary?')) {
      try {
        await reprocessMutation.mutateAsync(readingId);
        refetchReading();
        alert('Reading spans reprocessed successfully!');
      } catch (err) {
        console.error('Reprocess failed:', err);
      }
    }
  };

  // Compute stats
  const status = reading.aiAnalysisStatus || 'not_started';
  const lastAnalyzed = reading.aiAnalyzedAt
    ? new Date(reading.aiAnalyzedAt).toLocaleString()
    : null;
  const analysisError = reading.aiAnalysisError;

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 md:p-8 space-y-8 mt-12 shadow-inner">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-text-primary flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-brand-pink fill-brand-pink/15" />
            AI Vocabulary Analysis Console
          </h2>
          <p className="text-sm text-text-secondary">
            Extract reading terms with AI, verify duplicates, edit entries, and approve into dictionary.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          {status !== 'processing' ? (
            <>
              <button
                onClick={() => handleAnalyze(false)}
                disabled={analyzeMutation.isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-pink text-white font-extrabold text-xs rounded-full shadow-pastel hover:bg-brand-pink/90 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                {status === 'not_started' ? 'Extract with AI' : 'Analyze Changes'}
              </button>

              {status === 'completed' && (
                <button
                  onClick={() => handleAnalyze(true)}
                  disabled={analyzeMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-secondary font-bold text-xs rounded-full transition"
                  title="Ignore cache and perform full extraction query"
                >
                  <RefreshCw className={`w-4 h-4 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
                  Force Re-analyze
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 rounded-full font-bold text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              AI processing reading...
            </div>
          )}

          <button
            onClick={handleReprocess}
            disabled={reprocessMutation.isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-blue text-white font-extrabold text-xs rounded-full shadow-pastel hover:bg-brand-blue/90 active:scale-95 transition"
            title="Update highlights/spans mappings manually"
          >
            <Layers className="w-4 h-4" />
            Reprocess Spans
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid gap-4 sm:grid-cols-3">
        
        {/* Status card */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
          <div className={`p-2.5 rounded-full ${
            status === 'completed'
              ? 'bg-emerald-50 text-emerald-500'
              : status === 'failed'
              ? 'bg-rose-50 text-rose-500'
              : status === 'processing'
              ? 'bg-brand-pink/10 text-brand-pink animate-pulse'
              : 'bg-slate-100 text-slate-400'
          }`}>
            {status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : status === 'failed' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : status === 'processing' ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Analysis Status</span>
            <span className="text-sm font-extrabold capitalize text-text-primary">{status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Timestamps card */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 text-text-secondary rounded-full">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Last Analyzed At</span>
            <span className="text-xs font-semibold text-text-secondary">
              {lastAnalyzed || 'Never'}
            </span>
          </div>
        </div>

        {/* Total suggestions found */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-full">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Found Suggestions</span>
            <span className="text-sm font-extrabold text-text-primary">
              {suggestions.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {analysisError && (
        <div className="bg-rose-50 border border-rose-150 text-rose-700 p-4 rounded-2xl font-bold flex items-center gap-3 text-sm shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-extrabold">Extraction Failed</p>
            <p className="text-xs font-medium opacity-85 mt-0.5">{analysisError}</p>
          </div>
        </div>
      )}

      {/* Suggestions Workspace */}
      {status !== 'not_started' && (
        <div className="space-y-4 pt-2">
          
          {/* Sub-tabs */}
          <div className="flex border-b border-slate-200 gap-1.5">
            {[
              { id: 'pending', label: 'Pending / Edited' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All suggestions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-4 font-bold text-xs border-b-2 transition duration-200 ${
                  activeTab === tab.id
                    ? 'border-brand-pink text-brand-pink'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100/50 rounded-t-xl'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table display */}
          {isSuggestionsLoading ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="w-8 h-8 text-brand-pink animate-spin" />
            </div>
          ) : (
            <AiSuggestionTable readingId={readingId} items={suggestions} />
          )}
        </div>
      )}
    </div>
  );
}
