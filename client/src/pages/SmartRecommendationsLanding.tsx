import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, TrendingUp, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function SmartRecommendationsLanding() {
  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Personalized Resources',
      description: 'Get curated study materials, articles, and resources tailored to your specific learning goals and subjects.',
    },
    {
      icon: TrendingUp,
      title: 'Adaptive Learning Paths',
      description: 'AI creates dynamic study paths that evolve based on your progress and learning patterns.',
    },
    {
      icon: Lightbulb,
      title: 'Smart Study Tips',
      description: 'Receive contextual advice and study strategies optimized for your learning style and current challenges.',
    },
    {
      icon: Sparkles,
      title: 'Intelligent Insights',
      description: 'Discover patterns in your learning habits and get recommendations to optimize your study sessions.',
    },
  ];

  const benefits = [
    'Save hours with AI-curated study materials and resources',
    'Improve retention rates with personalized learning strategies',
    'Get unstuck faster with contextual study recommendations',
    'Track progress with intelligent learning analytics',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl flex items-center justify-center">
                <Sparkles className="text-white text-5xl" />
              </div>
            </div>
            
            <h1 className="text-6xl font-display font-bold mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 bg-clip-text text-transparent" data-testid="hero-title">
              Smart Recommendations
            </h1>
            
            <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="hero-subtitle">
              Personalized study guidance powered by artificial intelligence
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="hero-description">
              Get intelligent recommendations for study materials, learning paths, and strategies that adapt to your unique learning style and academic goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="get-started-button"
              >
                Get Smart Recommendations <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 rounded-xl border-2 border-amber-600/20 hover:border-amber-600/40 transition-all duration-300"
                  data-testid="back-home-button"
                >
                  Back to Home
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
              Intelligent Study Assistance
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-subtitle">
              Our AI analyzes your learning patterns to provide personalized recommendations that accelerate your academic success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className="glassmorphism hover:shadow-xl transition-all duration-300 h-full bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50"
                  data-testid={`feature-card-${index}`}
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                      <feature.icon className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4" data-testid={`feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed" data-testid={`feature-description-${index}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="benefits-title">
              Transform Your Study Efficiency
            </h2>
          </motion.div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center space-x-4"
                data-testid={`benefit-${index}`}
              >
                <CheckCircle className="text-amber-500 h-6 w-6 flex-shrink-0" />
                <p className="text-lg text-muted-foreground">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-pink-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="cta-title">
              Get Personalized Study Recommendations
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="cta-description">
              Let AI guide your learning journey with intelligent recommendations tailored just for you.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="cta-button"
            >
              Start Getting Recommendations <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}