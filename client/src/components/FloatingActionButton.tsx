import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Users, Search, Bot } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: Users,
      label: 'Create Pod',
      to: '/create-pod',
      color: 'bg-primary',
      testId: 'fab-create-pod'
    },
    {
      icon: Search,
      label: 'Find Pods',
      to: '/discover',
      color: 'bg-secondary',
      testId: 'fab-find-pods'
    },
    {
      icon: Bot,
      label: 'Ask AI',
      to: '/ai-chat',
      color: 'bg-accent',
      testId: 'fab-ask-ai'
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={item.to}>
                    <Card 
                      className="flex items-center space-x-3 glassmorphism rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all group cursor-pointer bg-card/80 dark:bg-card/80 backdrop-blur-xl border border-border/50"
                      data-testid={item.testId}
                    >
                      <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                        <item.icon className="text-white w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap pr-2">{item.label}</span>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <Button
          onClick={toggleMenu}
          className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 animate-pulse border-2 border-accent/20 hover:border-accent/40"
          data-testid="floating-action-button"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="text-white text-xl" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
