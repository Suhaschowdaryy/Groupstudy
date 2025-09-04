import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Brain, Users, Sparkles, ArrowRight, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginUser } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginMutation, isAuthenticated } = useAuth();
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check for OAuth errors in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'google_auth_failed') {
      toast({
        title: "Google Sign-In Failed",
        description: "There was an issue signing in with Google. Please try again or use email/password login.",
        variant: "destructive",
      });
      // Clear the error parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (data: LoginUser) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email"
                            data-testid="input-email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your password" 
                            type="password"
                            data-testid="input-password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={loginMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-5 w-5" />
                    )}
                    {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleLogin}
                variant="outline"
                size="lg"
                className="w-full text-lg py-3 rounded-xl border-border/50 hover:border-border transition-all duration-300"
                data-testid="button-google-login"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
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