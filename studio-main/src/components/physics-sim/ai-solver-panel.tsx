
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bot, Lightbulb, Sparkles } from 'lucide-react';
import { usePhysicsStore } from '@/stores/physics-store';
import { Skeleton } from '../ui/skeleton';
import { solvePhysicsProblem } from '@/ai/flows/solve-physics-problem-flow';
import 'katex/dist/katex.min.css';
import katex from 'katex';

function EquationDisplay({ equations }: { equations: string[] }) {
    return (
        <div className="space-y-2 text-center bg-secondary p-3 rounded-md">
            <h4 className="font-semibold text-sm">Key Equations</h4>
            {equations.map((eq, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: katex.renderToString(eq, { throwOnError: false, displayMode: true }) }} />
            ))}
        </div>
    )
}

export function AiSolverPanel() {
    const { aiQuestion, setAiQuestion, aiIsLoading, aiResponse, setAiIsLoading, setAiResponse, setPlotData } = usePhysicsStore();

    const handleSolve = async () => {
        setAiIsLoading(true);
        setAiResponse(null);
        setPlotData(null);
        try {
            const result = await solvePhysicsProblem({ question: aiQuestion });
            setAiResponse(result);
            if (result.plots) {
                setPlotData(result.plots);
            }

        } catch (err: any) {
            setAiResponse({
                explanation: 'Sorry, I was unable to solve this problem. Please check if the question is a valid physics problem with enough information.',
                error: err.message,
            });
        } finally {
            setAiIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span>AI Problem Solver</span>
                </CardTitle>
                <CardDescription>Enter a physics word problem below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ai-question">Question</Label>
                    <Textarea
                        id="ai-question"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="e.g., A car starts from rest and accelerates at 2 m/s² for 5 seconds. What is its final velocity?"
                        className="min-h-[100px]"
                    />
                </div>
                <Button onClick={handleSolve} disabled={aiIsLoading || !aiQuestion} className="w-full">
                    {aiIsLoading ? (
                        'Solving...'
                    ) : (
                        <>
                            <Bot className="mr-2" /> Solve with AI
                        </>
                    )}
                </Button>

                <div className="pt-2">
                    {aiIsLoading && (
                         <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    )}
                    {aiResponse && (
                        aiResponse.error ? (
                             <div className="flex flex-col items-center justify-center h-full text-destructive text-sm p-4 gap-2 text-center">
                                <AlertTriangle className="w-8 h-8"/>
                                <p className="font-semibold">Error</p>
                                <p className="text-xs">{aiResponse.explanation}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Solution</h3>
                                    <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-md whitespace-pre-wrap font-mono">
                                        {aiResponse.explanation}
                                    </div>
                                </div>
                                {aiResponse.equations && aiResponse.equations.length > 0 && <EquationDisplay equations={aiResponse.equations} />}
                                {aiResponse.answer !== undefined && (
                                    <div className="text-center font-bold text-primary text-lg pt-2 bg-primary/10 p-3 rounded-lg">
                                        Answer: {aiResponse.answer}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                     {!aiIsLoading && !aiResponse && (
                        <div className="text-center text-muted-foreground text-sm p-4 space-y-2">
                            <Lightbulb className="w-8 h-8 mx-auto text-accent"/>
                            <p>The AI can solve various physics problems. Try one!</p>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
