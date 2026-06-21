import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function Select({ value, onChange, options, disabled, placeholder = 'Select…' }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-surface-2 border text-sm text-left transition-all duration-200 ${
          open ? 'border-primary/60 ring-4 ring-primary/15' : 'border-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={selected ? 'text-foreground' : 'text-muted'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[120]" onClick={() => setOpen(false)} />
            <div
              className="fixed z-[121] max-h-64 overflow-auto rounded-xl bg-surface-solid border border-border shadow-2xl backdrop-blur-xl p-1.5 animate-scale-in"
              style={{ top: rect.top, left: rect.left, width: rect.width }}
            >
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-foreground/[0.06]'
                    }`}
                  >
                    <span className="flex flex-col items-start">
                      <span>{o.label}</span>
                      {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
