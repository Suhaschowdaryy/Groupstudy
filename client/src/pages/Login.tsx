import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Find perfect study partners with intelligent compatibility scoring.',
    },
    {
      icon: Users,
      title: 'Micro Study Groups',
      description: 'Join small, focused groups of 4-8 students for effective learning.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized study suggestions and learning resources.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"></div>
      
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding and Features */}
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
            Welcome Back to Your Learning Journey
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8" data-testid="welcome-subtitle">
            Log in to continue your AI-powered collaborative learning experience.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-4"
                data-testid={`feature-preview-${index}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <feature.icon className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="glassmorphism w-full max-w-md bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display font-bold" data-testid="login-card-title">
                Log In to StudyPod
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground" data-testid="login-description">
                Access your personalized study dashboard and connect with your study partners.
              </p>
              
              <Button 
                onClick={handleLogin}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="login-button"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Log In with Replit
              </Button>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  New to StudyPod?
                </p>
                <Link href="/signup">
                  <Button 
                    variant="outline"
                    className="w-full text-primary border-primary/20 hover:border-primary/40 transition-all duration-300"
                    data-testid="signup-link-button"
                  >
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
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