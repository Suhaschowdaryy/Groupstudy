import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Focus, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function MicroGroupsLanding() {
  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Users,
      title: 'Small Group Focus',
      description: 'Study pods of 4-8 students create intimate learning environments where everyone participates actively.',
    },
    {
      icon: Focus,
      title: 'Targeted Learning',
      description: 'Smaller groups mean more focused discussions and personalized attention for each member.',
    },
    {
      icon: MessageCircle,
      title: 'Better Engagement',
      description: 'Increased participation and meaningful conversations in manageable group sizes.',
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Easier coordination with fewer people means more study sessions that work for everyone.',
    },
  ];

  const benefits = [
    '3x higher engagement rates compared to large study groups',
    'More personalized learning experiences and peer support',
    'Better accountability with close-knit study partnerships',
    'Flexible scheduling that accommodates everyone\'s availability',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center">
                <Users className="text-white text-5xl" />
              </div>
            </div>
            
            <h1 className="text-6xl font-display font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent" data-testid="hero-title">
              Micro Study Groups
            </h1>
            
            <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="hero-subtitle">
              Small, focused study pods for maximum learning impact
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="hero-description">
              Join intimate study groups of 4-8 students where every voice matters, every question gets answered, and every member stays engaged throughout the learning journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="get-started-button"
              >
                Join a Micro Group <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 rounded-xl border-2 border-emerald-600/20 hover:border-emerald-600/40 transition-all duration-300"
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
              Why Small Groups Work Better
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-subtitle">
              Science shows that smaller study groups lead to better learning outcomes and stronger peer connections.
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
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
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
              Proven Benefits of Micro Study Groups
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
                <CheckCircle className="text-emerald-500 h-6 w-6 flex-shrink-0" />
                <p className="text-lg text-muted-foreground">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-cyan-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-display font-bold mb-6" data-testid="cta-title">
              Join Your Perfect Micro Study Group
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="cta-description">
              Experience the power of small, focused study groups designed for your success.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="cta-button"
            >
              Find My Study Group <Users className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}