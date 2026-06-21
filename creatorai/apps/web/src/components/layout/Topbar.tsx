import { Gem } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';

export function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 border-b border-border bg-surface backdrop-blur-2xl">
      <Logo />
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 text-xs font-medium text-foreground">
          <Gem className="h-3.5 w-3.5 text-primary" />
          {user?.creditBalance ?? 0}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
