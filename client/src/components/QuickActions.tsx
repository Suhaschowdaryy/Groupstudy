import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen, Brain, Gamepad2, Target } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: 'Create Pod',
      description: 'Start a new study group',
      to: '/create-pod',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Users,
      label: 'Join Pod',
      description: 'Find study partners',
      to: '/discover',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Brain,
      label: 'AI Chat',
      description: 'Get study help',
      to: '/ai-chat',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Gamepad2,
      label: 'Mini Games',
      description: 'Take a break',
      to: '/games',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: Target,
      label: 'Set Goals',
      description: 'Track progress',
      to: '/progress',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    },
    {
      icon: BookOpen,
      label: 'Study Plans',
      description: 'Personalized plans',
      to: '/ai-chat',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    }
  ];

  return (
    <Card className={`glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-primary w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.to}>
                <Button
                  variant="ghost"
                  className="w-full h-auto p-3 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all duration-300"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-xs">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}