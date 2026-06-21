import { Sparkles } from 'lucide-react';

export function Logo({ showText = true, className = '' }: { showText?: boolean; className?: string }) {
  return (
    <div className={`group flex items-center gap-2.5 ${className}`}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform">
          <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Creator<span className="text-gradient">AI</span>
        </span>
      )}
    </div>
  );
}
