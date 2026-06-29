import { Search, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SelectionToolbarProps {
  rect: DOMRect | null;
  onLookup: () => void;
  onAddManually: () => void;
  onCancel: () => void;
}

export function SelectionToolbar({
  rect,
  onLookup,
  onAddManually,
  onCancel,
}: SelectionToolbarProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rect) {
      setCoords(null);
      return;
    }

    // Position toolbar above the selection and horizontally centered
    const top = rect.top + window.scrollY - 50;
    const left = rect.left + window.scrollX + rect.width / 2;

    setCoords({ top, left });
  }, [rect]);

  if (!coords) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="z-50 bg-slate-900/95 backdrop-blur text-white py-1 px-1.5 rounded-full shadow-2xl border border-slate-800 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <button
        type="button"
        onClick={onLookup}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 text-xs font-extrabold rounded-full transition text-slate-100"
      >
        <Search className="w-3.5 h-3.5 text-brand-pink" />
        Lookup Dict
      </button>

      <div className="w-[1px] h-4 bg-slate-800" />

      <button
        type="button"
        onClick={onAddManually}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-800 text-xs font-extrabold rounded-full transition text-slate-100"
      >
        <Plus className="w-3.5 h-3.5 text-brand-blue" />
        Add Manually
      </button>

      <div className="w-[1px] h-4 bg-slate-800" />

      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white"
        title="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
