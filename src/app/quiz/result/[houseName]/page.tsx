"use client";

import { useParams, useRouter } from 'next/navigation';
import { HOGWARTS_HOUSES, HOUSE_NAMES_ARRAY } from '@/lib/constants';
import type { HouseName } from '@/lib/types';
import { HouseCrestDisplay } from '@/components/results/HouseCrestDisplay';
import { HouseInfoCard } from '@/components/results/HouseInfoCard';
import { AIFactGenerator } from '@/components/results/AIFactGenerator';
import { Button } from '@/components/ui/button';
import { RotateCcw, Share2, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function HouseResultPage() {
  const params = useParams();
  const router = useRouter();
  const { state: quizState, dispatch: quizDispatch } = useQuiz();

  const houseNameParam = params.houseName as string;
  const houseName = HOUSE_NAMES_ARRAY.find(hn => hn.toLowerCase() === houseNameParam?.toLowerCase()) || quizState.sortedHouse;
  
  const [showShareModal, setShowShareModal] = useState(false); // For share functionality

  useEffect(() => {
    // If the user lands here directly without completing the quiz, or if houseName is invalid, redirect.
    if (!quizState.isCompleted || !houseName || !HOGWARTS_HOUSES[houseName]) {
       // If there's a sorted house in context, use that. Otherwise, to quiz.
      if(quizState.sortedHouse && HOGWARTS_HOUSES[quizState.sortedHouse]){
        router.replace(`/quiz/result/${quizState.sortedHouse.toLowerCase()}`);
      } else {
        router.replace('/quiz');
      }
    }
  }, [houseName, quizState.isCompleted, quizState.sortedHouse, router]);


  if (!houseName || !HOGWARTS_HOUSES[houseName]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <h1 className="text-3xl font-headline text-destructive mb-4">House Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The Sorting Hat seems to be puzzled. Let's try that again.
        </p>
        <Button asChild className="button-gold">
          <Link href="/quiz">Retake the Quiz</Link>
        </Button>
      </div>
    );
  }

  const house = HOGWARTS_HOUSES[houseName];

  const handleRetakeQuiz = () => {
    quizDispatch({ type: 'RETAKE_QUIZ' });
    router.push('/quiz');
  };

  const handleShare = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: `I've been sorted into ${house.name}!`,
        text: `I took the Hogwarts Sorting Quiz and got ${house.name}! ${house.quote}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShowShareModal(true); // Fallback for browsers not supporting Web Share API
    }
  };
  
  const handleDownloadCard = () => {
    // Mock download functionality. In a real app, this would generate an image.
    alert(`Imagine a beautiful ${house.name} result card is downloaded!`);
  };

  // Calculate scores percentage for display
  const totalScoreSum = Object.values(quizState.scores).reduce((sum, score = 0) => sum + Math.max(0,score), 0);


  return (
    <div className={cn("flex flex-col items-center space-y-8 py-10 min-h-[calc(100vh-200px)] animate-fade-in-up", `theme-${house.name.toLowerCase()}`)}>
      <header className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground/80">The Sorting Hat has spoken!</p>
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-[hsl(var(--house-primary))]">
          Welcome to {house.name}!
        </h1>
      </header>

      <HouseCrestDisplay house={house} size={250} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <HouseInfoCard house={house} />
        <AIFactGenerator houseName={house.name} />
      </div>

      {/* Shareable Card Placeholder */}
      <Card className={cn("w-full max-w-md enchanted-parchment-dark", `theme-${house.name.toLowerCase()}`)}>
        <CardHeader>
          <CardTitle className="font-headline text-xl text-[hsl(var(--house-primary))]">Your Sorting Result</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-foreground">Congratulations! You embody the spirit of <strong className="text-[hsl(var(--house-secondary))]">{house.name}</strong>.</p>
          {/* Placeholder for name input if implementing user specific cards */}
          {/* <Input placeholder="Enter Your Name for the Card" className="my-2 bg-background/50 border-border" /> */}
          <div className="flex justify-center space-x-3">
            <Button onClick={handleShare} variant="outline" className="border-[hsl(var(--house-primary))] text-[hsl(var(--house-primary))] hover:bg-[hsl(var(--house-primary)_/_0.1)]">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button onClick={handleDownloadCard} variant="outline" className="border-[hsl(var(--house-primary))] text-[hsl(var(--house-primary))] hover:bg-[hsl(var(--house-primary)_/_0.1)]">
              <Download className="mr-2 h-4 w-4" /> Download Card
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Score Distribution */}
       {totalScoreSum > 0 && (
        <Card className="w-full max-w-md enchanted-parchment-dark">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Your Affinity Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {HOUSE_NAMES_ARRAY.map(hn => {
              const houseData = HOGWARTS_HOUSES[hn];
              const score = quizState.scores[hn] || 0;
              const percentage = totalScoreSum > 0 ? (Math.max(0, score) / totalScoreSum) * 100 : 0;
              return (
                <div key={hn} className={cn("py-1", `theme-${hn.toLowerCase()}`)}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[hsl(var(--house-primary))]">{hn}</span>
                    <span className="text-xs text-[hsl(var(--house-secondary))]">{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} className={cn("h-2 [&>div]:bg-[hsl(var(--house-primary))]", hn === house.name ? "bg-[hsl(var(--house-primary)_/_0.3)]" : "bg-muted/30")} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}


      <div className="mt-8">
        <Button onClick={handleRetakeQuiz} size="lg" className="button-burgundy">
          <RotateCcw className="mr-2 h-5 w-5" />
          Take the Quiz Again
        </Button>
      </div>

      {/* Basic Modal for Share Fallback */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-popover p-6 rounded-lg shadow-xl max-w-sm w-full">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Share Your Result!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-popover-foreground mb-2">You belong to {house.name}!</p>
              <p className="text-sm text-muted-foreground mb-4">Share this link with your friends:</p>
              <input type="text" readOnly value={window.location.href} className="w-full p-2 border border-input rounded bg-background text-foreground text-sm" />
              <Button onClick={() => setShowShareModal(false)} className="mt-4 w-full button-accent">Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// This function is needed if you plan to use generateStaticParams for SSG (not strictly necessary for this dynamic page but good practice for some scenarios)
// export async function generateStaticParams() {
//   return HOUSE_NAMES_ARRAY.map((houseName) => ({
//     houseName: houseName.toLowerCase(),
//   }));
// }

