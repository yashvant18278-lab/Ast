
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Atom, Sigma, Bot, Wind, Repeat, Loader2 } from 'lucide-react';
import { Header } from '@/components/math-graph/header';
import { Footer } from '@/components/math-graph/footer';

const physicsCategories = [
    {
        name: 'Simulators',
        icon: Atom,
        simulations: [
            {
                name: '1D Kinematics',
                description: 'Analyze motion with constant acceleration or custom equations.',
                href: '/physics/kinematics',
                icon: Wind,
            },
            {
                name: 'Projectile Motion',
                description: 'Visualize parabolic trajectory, range, and height.',
                href: '/physics/projectile',
                icon: Sigma,
            },
            {
                name: 'Circular Motion',
                description: 'Explore angular displacement, velocity, and acceleration.',
                href: '/physics/circular',
                icon: Repeat,
            }
        ]
    },
];


export default function PhysicsHubPage() {
  const router = useRouter();
  const [loadingSim, setLoadingSim] = useState<string | null>(null);

  const handleLaunch = (href: string) => {
    setLoadingSim(href);
    router.push(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground">
        <Header />
        <main className="flex-1 p-4 md:p-8">
            <section className="text-center mb-12">
                <h1 className="text-4xl font-bold text-primary">Physics Toolkit</h1>
                <p className="text-muted-foreground mt-2">Explore concepts with simulators or ask our AI to solve problems.</p>
            </section>
            
            <div className="space-y-12">
                <div className="max-w-xl mx-auto">
                    <Card className="shadow-xl hover:shadow-primary/20 transition-shadow border-border hover:border-primary/40 flex flex-col bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <Bot className="w-8 h-8 text-primary"/>
                                AI Physics Solver
                            </CardTitle>
                            <CardDescription>Ask any 1D Kinematics problem and get a step-by-step solution with interactive graphs.</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button 
                                className="w-full text-lg py-6" 
                                onClick={() => handleLaunch('/physics/ai-solver')}
                                disabled={loadingSim === '/physics/ai-solver'}
                            >
                                {loadingSim === '/physics/ai-solver' ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Launch AI Solver
                                        <ArrowRight />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {physicsCategories.map(category => (
                    <div key={category.name}>
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                            <category.icon className="w-7 h-7 text-accent" />
                            <span>{category.name}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.simulations.map(sim => (
                                <Card key={sim.name} className="shadow-lg hover:shadow-primary/20 transition-shadow border-border hover:border-primary/40 flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <sim.icon className="w-6 h-6 text-primary"/>
                                            {sim.name}
                                        </CardTitle>
                                        <CardDescription>{sim.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <Button 
                                            variant="outline" 
                                            className="w-full" 
                                            onClick={() => handleLaunch(sim.href)}
                                            disabled={loadingSim === sim.href}
                                        >
                                            {loadingSim === sim.href ? (
                                                <>
                                                    <Loader2 className="animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    Launch Simulator
                                                    <ArrowRight />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
        <Footer />
    </div>
  );
}
