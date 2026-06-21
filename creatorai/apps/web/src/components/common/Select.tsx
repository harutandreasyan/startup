import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { useStyles } from '../../lib/useStyles';
import { makeSelectStyles } from './Select.styles';

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
  const s = useStyles(() => makeSelectStyles(open, disabled, !!selected), [open, disabled, selected]);

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
        className={s.trigger}
      >
        <span className={s.triggerLabel}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={s.chevron} />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div className={s.backdrop} onClick={() => setOpen(false)} />
            <div
              className={s.menu}
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
                    className={s.option(active)}
                  >
                    <span className={s.optionText}>
                      <span>{o.label}</span>
                      {o.hint && <span className={s.optionHint}>{o.hint}</span>}
                    </span>
                    {active && <Check className={s.checkIcon} />}
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
