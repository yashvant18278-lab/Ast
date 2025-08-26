'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { Skeleton } from '@/components/ui/skeleton';

export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const { init, isMounted } = useUIStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!isMounted) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="flex items-center justify-between px-4 h-14 border-b shrink-0">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Skeleton className="h-48 w-full max-w-4xl rounded-lg" />
        </main>
        <footer className="text-center text-xs py-4 border-t shrink-0">
          <Skeleton className="h-4 w-48 mx-auto" />
        </footer>
      </div>
    );
  }

  return <>{children}</>;
}
