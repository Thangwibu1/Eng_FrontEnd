import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSaveVocabulary } from '../hooks/useSaveVocabulary';
import { useMe } from '../../auth/hooks/useMe';

interface VocabularyCardProps {
  vocabulary: any;
}

export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const { data: user } = useMe();
  const saveMutation = useSaveVocabulary();

  const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save vocabulary');
      return;
    }
    saveMutation.mutate(vocabulary.id || vocabulary._id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saved':
        return <Bookmark className="w-5 h-5 text-brand-pink fill-brand-pink" />;
      case 'known':
        return <CheckCircle2 className="w-5 h-5 text-brand-blue" />;
      case 'difficult':
        return <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-100" />;
      default:
        return <Bookmark className="w-5 h-5 text-gray-300" />;
    }
  };

  const getTypeStyleAndLabel = (type: string) => {
    const label = type.replace('_', ' ').toUpperCase();
    switch (type.toLowerCase()) {
      case 'single_word':
        return { label, classes: 'bg-[#89D4FF]/15 text-[#44ACFF] border border-[#89D4FF]/30' };
      case 'collocation':
        return { label, classes: 'bg-[#F9F6C4] text-amber-800 border border-amber-200' };
      case 'phrasal_verb':
        return { label, classes: 'bg-[#44ACFF]/15 text-[#44ACFF] border border-[#44ACFF]/25' };
      case 'idiom':
        return { label, classes: 'bg-[#FE9EC7]/20 text-[#FE9EC7] border border-[#FE9EC7]/35' };
      case 'fixed_phrase':
        return { label, classes: 'bg-[#FE9EC7]/10 text-[#FE9EC7] border border-[#FE9EC7]/20' };
      default:
        return { label, classes: 'bg-gray-50 text-text-secondary border border-gray-150' };
    }
  };

  const getLevelStyle = (level?: string) => {
    if (!level) return '';
    const lvl = level.toUpperCase();
    if (lvl.startsWith('A')) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    } else if (lvl.startsWith('B')) {
      return 'bg-brand-pink/15 text-brand-pink border border-brand-pink/20';
    } else {
      return 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20';
    }
  };

  const typeConfig = getTypeStyleAndLabel(vocabulary.type);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.03] transition-all-180 duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${typeConfig.classes}`}>
            {typeConfig.label}
          </span>
          {vocabulary.level && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getLevelStyle(vocabulary.level)}`}>
              {vocabulary.level}
            </span>
          )}
        </div>

        <Link to={`/vocabularies/${vocabulary.id || vocabulary._id}`}>
          <h3 className="text-2xl font-black text-text-primary hover:text-brand-pink transition mb-1 truncate">
            {vocabulary.text}
          </h3>
        </Link>

        {vocabulary.phonetic && (
          <p className="text-xs text-text-muted font-mono mb-3">{vocabulary.phonetic}</p>
        )}

        <div className="mt-3 space-y-1">
          <p className="font-bold text-text-primary text-base leading-snug line-clamp-2">
            {vocabulary.meanings?.[0]?.meaningVi}
          </p>
          {vocabulary.meanings?.[0]?.meaningEn && (
            <p className="text-sm text-text-secondary line-clamp-2 italic">
              {vocabulary.meanings[0].meaningEn}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center shrink-0">
        {user ? (
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-pink transition"
          >
            {getStatusIcon(vocabulary.userStatus)}
            <span className="font-bold uppercase tracking-wider">Save</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-pink transition"
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider">Save</span>
          </Link>
        )}
        
        <Link
          to={`/vocabularies/${vocabulary.id || vocabulary._id}`}
          className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-pink transition group uppercase tracking-wider"
        >
          Details
          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-all-180" />
        </Link>
      </div>
    </div>
  );
}
