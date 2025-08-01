
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HOGWARTS_HOUSES, HOUSE_NAMES_ARRAY } from '@/lib/constants';
import type { HouseName } from '@/lib/types';
import { BarChart3, Award } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HouseStat {
  name: HouseName;
  count: number;
}

// Mock data - in a real app, this would come from a real-time database
const MOCK_LEADERBOARD_DATA: HouseStat[] = HOUSE_NAMES_ARRAY.map(name => ({
  name,
  count: Math.floor(Math.random() * 500) + 50, // Random counts
}));

const LeaderboardBar: React.FC<{ houseStat: HouseStat, maxCount: number }> = ({ houseStat, maxCount }) => {
  const house = HOGWARTS_HOUSES[houseStat.name];
  if (!house) return null;
  const percentage = maxCount > 0 ? (houseStat.count / maxCount) * 100 : 0;

  return (
    <div className={cn("p-4 rounded-lg shadow-md transition-all duration-500 ease-out hover:shadow-lg", `theme-${house.name.toLowerCase()}`)}
        style={{'--house-primary': `var(${house.colors.primaryVar})`, '--house-secondary': `var(${house.colors.secondaryVar})`} as React.CSSProperties}
    >
      <div className="flex items-center space-x-4 mb-2">
        <Image
          src={house.crest}
          alt={`${house.name} Crest`}
          width={48}
          height={48}
          data-ai-hint={house.dataAiHint}
          className="rounded-full border-2 border-[hsl(var(--house-secondary))]"
        />
        <div>
          <h3 className="text-xl font-semibold font-headline text-[hsl(var(--house-primary))]">{house.name}</h3>
          <p className="text-sm text-[hsl(var(--house-secondary))] font-bold">{houseStat.count.toLocaleString()} students sorted</p>
        </div>
      </div>
      <Progress value={percentage} className={cn("h-3 bg-[hsl(var(--house-secondary)_/_0.3)] [&>div]:bg-[hsl(var(--house-primary))] transition-all duration-1000 ease-out")} />
    </div>
  );
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<HouseStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching and updating data
    setIsLoading(true);
    const sortedData = [...MOCK_LEADERBOARD_DATA].sort((a, b) => b.count - a.count);
    setLeaderboardData(sortedData);
    setIsLoading(false);

    // Simulate live updates - for demonstration
    const interval = setInterval(() => {
      setLeaderboardData(prevData => {
        const newData = prevData.map(stat => ({
          ...stat,
          count: stat.count + Math.floor(Math.random() * 5) + 1, // Increment count
        }));
        return [...newData].sort((a, b) => b.count - a.count);
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const maxCount = Math.max(...leaderboardData.map(stat => stat.count), 0);

  return (
    <div className="container mx-auto py-10 px-4 animate-fade-in-up">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-3">
          Global House Leaderboard
        </h1>
        <p className="text-lg text-foreground/80 max-w-xl mx-auto">
          See which Hogwarts houses are currently leading in the number of new students! The House Cup awaits!
        </p>
      </header>

      {isLoading ? (
        <div className="text-center text-primary">Summoning the leaderboard spirits... <BarChart3 className="inline-block animate-spin h-5 w-5 ml-2" /></div>
      ) : leaderboardData.length > 0 ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          {leaderboardData.map((stat, index) => (
            <div key={stat.name} className="relative">
              <LeaderboardBar houseStat={stat} maxCount={maxCount} />
              {index === 0 && (
                <Award className="absolute -top-3 -right-3 h-8 w-8 text-yellow-400 transform rotate-12 fill-current" style={{filter: "drop-shadow(0 0 5px gold)"}}/>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="enchanted-parchment-dark text-center py-10 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">The Leaderboard is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-foreground/80">
              No students have been sorted yet. Be the first!
            </CardDescription>
          </CardContent>
        </Card>
      )}
       <p className="text-center text-sm text-muted-foreground mt-8">
        Leaderboard updates in real-time (simulated). House points are fluctuating!
      </p>
    </div>
  );
}
