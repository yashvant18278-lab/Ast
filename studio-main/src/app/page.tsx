
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Atom, Sigma, Bot, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/math-graph/theme-toggle';

export default function LandingPage() {
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleLaunch = (href: string) => {
    setLoadingHref(href);
    router.push(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground">
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Sigma className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-lg">GraphSim</h1>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <section className="text-center py-12 md:py-24">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
                Visualize, Analyze, and Learn
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                GraphSim is your interactive toolkit for exploring the worlds of mathematics and physics. Plot complex functions, simulate physical motion, and gain deeper insights with AI-powered explanations.
            </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow border-primary/20 hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sigma className="w-6 h-6 text-accent" />
                <span>Math Simulator</span>
              </CardTitle>
              <CardDescription>
                Plot functions, analyze properties, and visualize complex relationships. Features an AI assistant to explain equations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleLaunch('/math')}
                disabled={loadingHref === '/math'}
              >
                {loadingHref === '/math' ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        <span>Go to Math Simulator</span>
                        <ArrowRight />
                    </>
                )}
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow border-primary/20 hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Atom className="w-6 h-6 text-accent" />
                <span>Physics Simulators</span>
              </CardTitle>
              <CardDescription>
                Explore a variety of physics simulations, from kinematics and projectile motion to waves and electricity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleLaunch('/physics')}
                disabled={loadingHref === '/physics'}
              >
                 {loadingHref === '/physics' ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                       <span>Go to Physics Simulators</span>
                       <ArrowRight />
                    </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-4 border-t shrink-0">
        GraphSim — Built with Firebase and Google AI.
      </footer>
    </div>
  );
}
