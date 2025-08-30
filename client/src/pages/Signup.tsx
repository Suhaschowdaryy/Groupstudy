import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Sparkles, Target, Zap, Star, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Signup() {
  const handleSignup = () => {
    window.location.href = '/api/login';
  };

  const benefits = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Find perfect study partners with intelligent compatibility scoring.',
    },
    {
      icon: Users,
      title: 'Micro Study Groups',
      description: 'Join small, focused groups for maximum learning impact.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized study suggestions and learning resources.',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and achieve academic goals with detailed progress analytics.',
    },
    {
      icon: Zap,
      title: 'Real-time Collaboration',
      description: 'Chat, video call, and share resources seamlessly.',
    },
    {
      icon: Star,
      title: 'Gamified Learning',
      description: 'Earn badges, climb leaderboards, and stay motivated.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"></div>
      
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Benefits and Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Brain className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-display font-bold ml-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              StudyPod
            </h1>
          </div>
          
          <h2 className="text-4xl font-display font-bold mb-6" data-testid="welcome-title">
            Join the Future of Collaborative Learning
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8" data-testid="welcome-subtitle">
            Create your account and unlock AI-powered study partnerships.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-3"
                data-testid={`benefit-preview-${index}`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-white w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Signup Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="glassmorphism w-full max-w-md bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display font-bold" data-testid="signup-card-title">
                Create Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground" data-testid="signup-description">
                Join thousands of students already using AI to find their perfect study partners.
              </p>
              
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-primary mb-2">✨ Free Features Included:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• AI-powered study partner matching</p>
                    <p>• Join up to 3 study pods</p>
                    <p>• Basic goal tracking and badges</p>
                    <p>• Group chat and collaboration tools</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSignup}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="signup-button"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Sign Up with Replit
              </Button>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?
                </p>
                <Link href="/login">
                  <Button 
                    variant="outline"
                    className="w-full text-primary border-primary/20 hover:border-primary/40 transition-all duration-300"
                    data-testid="login-link-button"
                  >
                    Log In <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <Link href="/">
                  <Button 
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="home-link-button"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}