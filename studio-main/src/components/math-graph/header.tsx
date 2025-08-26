import { ThemeToggle } from './theme-toggle';
import { Sigma } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b shrink-0">
      <div className="flex items-center gap-2">
        <Sigma className="h-6 w-6 text-primary" />
        <h1 className="font-semibold text-lg">GraphSim</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
