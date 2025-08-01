"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/context/QuizContext';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizProgressBar } from '@/components/quiz/QuizProgressBar';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { HOGWARTS_HOUSES } from '@/lib/constants';

export default function QuizPage() {
  const { state, dispatch, currentQuestion, totalQuestions } = useQuiz();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (state.isCompleted && state.sortedHouse) {
      router.push(`/quiz/result/${state.sortedHouse.toLowerCase()}`);
    }
  }, [state.isCompleted, state.sortedHouse, router]);

  if (!currentQuestion && !state.isCompleted) {
     // Could be initial state before questions load or an error
    return (
      <div className="text-center py-10">
        <p className="text-xl text-foreground">Loading the Sorting Hat's questions...</p>
        {/* Optionally, add a button to manually start/restart if stuck */}
         <Button onClick={() => dispatch({ type: 'START_QUIZ' })} className="mt-4 button-gold">
          Begin Sorting
        </Button>
      </div>
    );
  }
  
  if (state.isCompleted || !currentQuestion) {
    // This case should ideally be handled by the useEffect redirect.
    // If still here, maybe show a loading or completion message.
    return (
      <div className="text-center py-10">
        <p className="text-xl text-foreground">The Sorting Hat has made its decision...</p>
      </div>
    );
  }


  const handleAnswer = (questionId: string, optionId: string) => {
    setSelectedOption(optionId);
    dispatch({ type: 'ANSWER_QUESTION', questionId, optionId });
  };

  const handleNextQuestion = () => {
    if (selectedOption) {
      dispatch({ type: 'NEXT_QUESTION' });
      setSelectedOption(undefined); // Reset for next question
    } else {
      // Optionally show a message to select an option
      alert("Please select an answer before proceeding.");
    }
  };
  
  const handleRetakeQuiz = () => {
    dispatch({ type: 'RETAKE_QUIZ' });
    setSelectedOption(undefined);
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <QuizProgressBar currentStep={state.currentQuestionIndex + 1} totalSteps={totalQuestions} />
      
      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        selectedOptionId={selectedOption}
      />

      <div className="flex space-x-4 mt-6">
        <Button onClick={handleRetakeQuiz} variant="outline" className="text-foreground hover:text-accent-foreground hover:border-accent">
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
        <Button 
          onClick={handleNextQuestion} 
          disabled={!selectedOption}
          className="button-burgundy"
        >
          {state.currentQuestionIndex === totalQuestions - 1 ? 'Reveal My House' : 'Next Question'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
