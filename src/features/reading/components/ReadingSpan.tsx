import { VocabularyPopover } from './VocabularyPopover';
import { useTrackReadingLookup } from '../hooks/useTrackReadingLookup';
import { useMe } from '../../auth/hooks/useMe';

interface ReadingSpanProps {
  readingId: string;
  span: any;
  vocabulary?: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReadingSpan({ readingId, span, vocabulary, isOpen, onOpenChange }: ReadingSpanProps) {
  const { data: user } = useMe();
  const trackLookup = useTrackReadingLookup();

  const handleSpanClick = () => {
    const nextOpen = !isOpen;
    onOpenChange(nextOpen);
    if (nextOpen && user && vocabulary) {
      trackLookup.mutate({
        readingId,
        vocabularyId: vocabulary.id || vocabulary._id,
        readingSpanId: span._id || span.orderIndex.toString(),
        lookupText: span.text,
      });
    }
  };

  if (!span.isClickable || !vocabulary) {
    if (span.spanType === 'space') {
      return <span className="whitespace-pre-wrap">{span.text}</span>;
    }
    return <span>{span.text}</span>;
  }

  // Get pastel background class according to AuraEnglish theme spec
  const getHighlightClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'single_word':
        return 'bg-[#89D4FF]/45 border-b-[3px] border-[#44ACFF] hover:bg-[#89D4FF]/60';
      case 'collocation':
        return 'bg-[#F9F6C4]/75 border-b-[3px] border-[#D8C94F] hover:bg-[#F9F6C4]/95';
      case 'phrasal_verb':
        return 'bg-[#44ACFF]/20 border-b-[3px] border-[#44ACFF] hover:bg-[#44ACFF]/35';
      case 'idiom':
        return 'bg-[#FE9EC7]/30 border-b-[3px] border-[#FE9EC7] hover:bg-[#FE9EC7]/45';
      case 'fixed_phrase':
        return 'bg-[#FE9EC7]/26 border-b-[3px] border-[#FE9EC7] hover:bg-[#FE9EC7]/40';
      default:
        return 'bg-yellow-50 hover:bg-yellow-100 border-b-2 border-yellow-400';
    }
  };

  return (
    <span className="relative inline-block">
      <button
        onClick={handleSpanClick}
        className={`px-0.5 rounded-lg font-bold transition-all duration-150 cursor-pointer select-text ${getHighlightClass(vocabulary.type)}`}
      >
        {span.text}
      </button>

      {isOpen && (
        <VocabularyPopover
          readingId={readingId}
          span={span}
          vocabulary={vocabulary}
          onClose={() => onOpenChange(false)}
        />
      )}
    </span>
  );
}
