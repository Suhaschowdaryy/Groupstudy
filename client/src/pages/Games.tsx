import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Brain, Zap, Target, Trophy, Clock, Shuffle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Games() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [mathScore, setMathScore] = useState(0);
  const [mathProblem, setMathProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);

  const games = [
    {
      id: 'math-rush',
      name: 'Math Rush',
      description: 'Solve math problems as quickly as possible',
      icon: Brain,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Match pairs of cards to improve memory',
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 'word-scramble',
      name: 'Word Scramble',
      description: 'Unscramble words to enhance vocabulary',
      icon: Shuffle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'reaction-time',
      name: 'Reaction Time',
      description: 'Test your reflexes and speed',
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    }
  ];

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer: number;
    let question: string;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setMathProblem({ question, answer });
  };

  const startMathRush = () => {
    setCurrentGame('math-rush');
    setMathScore(0);
    setTimeLeft(60);
    setIsGameActive(true);
    setUserAnswer('');
    generateMathProblem();
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkMathAnswer = () => {
    if (parseInt(userAnswer) === mathProblem.answer) {
      setMathScore(prev => prev + 1);
      generateMathProblem();
      setUserAnswer('');
    }
  };

  const initializeMemoryGame = () => {
    const cards = [];
    for (let i = 1; i <= 8; i++) {
      cards.push(i, i); // Create pairs
    }
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryScore(0);
    setCurrentGame('memory-match');
  };

  const flipCard = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first] === memoryCards[second]) {
        setMatchedCards(prev => [...prev, first, second]);
        setMemoryScore(prev => prev + 1);
      }
      
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  const renderMathRush = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="outline">Score: {mathScore}</Badge>
          <Badge variant={timeLeft > 10 ? "default" : "destructive"}>
            <Clock className="w-3 h-3 mr-1" />
            {timeLeft}s
          </Badge>
        </div>
        <Button onClick={() => setCurrentGame(null)} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
      </div>

      {isGameActive ? (
        <Card className="text-center p-8">
          <div className="text-4xl font-bold mb-6">{mathProblem.question} = ?</div>
          <div className="flex items-center justify-center gap-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkMathAnswer()}
              className="w-24 p-3 text-center text-xl border rounded-lg"
              placeholder="?"
              autoFocus
            />
            <Button onClick={checkMathAnswer} disabled={!userAnswer}>
              Submit
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center p-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <div className="text-2xl font-bold mb-2">Game Over!</div>
          <div className="text-lg mb-4">Final Score: {mathScore}</div>
          <Button onClick={startMathRush}>Play Again</Button>
        </Card>
      )}
    </div>
  );

  const renderMemoryGame = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Matches: {memoryScore}/8</Badge>
        <Button onClick={() => setCurrentGame(null)} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {memoryCards.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={`aspect-square flex items-center justify-center cursor-pointer transition-all ${
                flippedCards.includes(index) || matchedCards.includes(index)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/70'
              }`}
              onClick={() => flipCard(index)}
            >
              <div className="text-2xl font-bold">
                {flippedCards.includes(index) || matchedCards.includes(index) ? card : '?'}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {matchedCards.length === memoryCards.length && (
        <Card className="text-center p-6">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <div className="text-xl font-bold">Congratulations!</div>
          <div className="text-muted-foreground mb-4">You matched all pairs!</div>
          <Button onClick={initializeMemoryGame}>Play Again</Button>
        </Card>
      )}
    </div>
  );

  if (currentGame === 'math-rush') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Brain className="text-blue-500" />
            Math Rush
          </h1>
          {renderMathRush()}
        </main>
      </div>
    );
  }

  if (currentGame === 'memory-match') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Target className="text-green-500" />
            Memory Match
          </h1>
          {renderMemoryGame()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Gamepad2 className="text-primary" />
            Mini Games
          </h1>
          <p className="text-muted-foreground text-lg">
            Take a break and sharpen your mind with fun games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${game.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <game.icon className={`w-6 h-6 ${game.color}`} />
                  </div>
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{game.description}</p>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (game.id === 'math-rush') {
                        startMathRush();
                      } else if (game.id === 'memory-match') {
                        initializeMemoryGame();
                      } else {
                        setCurrentGame(game.id);
                      }
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500 w-5 h-5" />
                Benefits of Brain Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Improve Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhance concentration and attention span for better studying
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold mb-2">Boost Memory</h3>
                  <p className="text-sm text-muted-foreground">
                    Strengthen working memory and information retention
                  </p>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Reduce Stress</h3>
                  <p className="text-sm text-muted-foreground">
                    Take healthy breaks to refresh your mind
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}