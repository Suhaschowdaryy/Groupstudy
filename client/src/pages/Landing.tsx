import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, Sparkles, Target, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Landing() {

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm matches you with compatible study partners based on your goals, pace, and availability.',
      link: '/ai-matching',
    },
    {
      icon: Users,
      title: 'Micro Study Groups',
      description: 'Join small, focused study pods of 4-8 students for more personalized and effective learning experiences.',
      link: '/micro-groups',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized study suggestions, resource recommendations, and learning paths tailored to your needs.',
      link: '/smart-recommendations',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and track your academic goals with detailed progress analytics and achievement milestones.',
      link: '/goal-tracking',
    },
    {
      icon: Zap,
      title: 'Real-time Collaboration',
      description: 'Collaborate seamlessly with group chat, video sessions, and shared study resources.',
      link: '/collaboration',
    },
    {
      icon: Star,
      title: 'Gamified Learning',
      description: 'Earn badges, climb leaderboards, and stay motivated with our engaging gamification system.',
      link: '/gamification',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Brain className="text-white text-4xl" />
              </div>
            </div>
            
            <h1 className="text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent" data-testid="hero-title">
              StudyPod
            </h1>
            
            <p className="text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto" data-testid="hero-subtitle">
              AI-Powered Study Platform for Collaborative Learning
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="hero-description">
              Join personalized micro study groups, collaborate with peers, and accelerate your learning with AI-driven recommendations and smart matching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="get-started-button"
                >
                  Get Started with AI Matching
                </Button>
              </Link>
              
              <Link href="/login">
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                  data-testid="login-button"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="features-title">
              Revolutionize Your Study Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-subtitle">
              Experience the future of collaborative learning with our comprehensive platform designed for academic success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={feature.link}>
                  <Card 
                    className="glassmorphism hover:shadow-xl transition-all duration-300 h-full bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50 cursor-pointer group"
                    data-testid={`feature-card-${index}`}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="text-white w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4" data-testid={`feature-title-${index}`}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed" data-testid={`feature-description-${index}`}>
                        {feature.description}
                      </p>
                      <div className="mt-4 text-primary font-semibold group-hover:underline">
                        Learn More →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="stats-title">
              Join Thousands of Successful Students
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Students', testId: 'stat-students' },
              { number: '2.5K+', label: 'Study Pods Created', testId: 'stat-pods' },
              { number: '95%', label: 'Success Rate', testId: 'stat-success' },
              { number: '50K+', label: 'Study Hours Completed', testId: 'stat-hours' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
                data-testid={stat.testId}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="cta-title">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="cta-description">
              Join StudyPod today and experience the power of AI-driven collaborative learning.
            </p>
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="cta-button"
              >
                Start Your Learning Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
