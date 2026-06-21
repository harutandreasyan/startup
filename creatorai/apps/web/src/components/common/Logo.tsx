import { Sparkles } from 'lucide-react';

export function Logo({ showText = true, className = '' }: { showText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
        <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Creator<span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
}
