import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Clock, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyTimerProps {
  className?: string;
}

export function StudyTimer({ className }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (isBreak) {
        // Break ended, start new focus session
        setIsBreak(false);
        setTimeLeft(25 * 60);
        setTotalTime(25 * 60);
      } else {
        // Focus session ended, start break
        setSessions(prev => prev + 1);
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
        setTotalTime(5 * 60);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isBreak) {
      setTimeLeft(5 * 60);
      setTotalTime(5 * 60);
    } else {
      setTimeLeft(25 * 60);
      setTotalTime(25 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <Card className={`glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isBreak ? (
            <>
              <Coffee className="text-green-500 w-5 h-5" />
              Break Time
            </>
          ) : (
            <>
              <Clock className="text-primary w-5 h-5" />
              Focus Time
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            className={`text-4xl font-mono font-bold ${isBreak ? 'text-green-500' : 'text-primary'}`}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">
            {isBreak ? 'Take a rest!' : 'Stay focused!'}
          </p>
        </div>

        <Progress 
          value={progress} 
          className={`h-2 ${isBreak ? '[&>div]:bg-green-500' : ''}`} 
        />

        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={toggleTimer}
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Sessions: {sessions}</span>
          <span>Mode: {isBreak ? 'Break' : 'Focus'}</span>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Using Pomodoro Technique (25min focus + 5min break)
        </div>
      </CardContent>
    </Card>
  );
}