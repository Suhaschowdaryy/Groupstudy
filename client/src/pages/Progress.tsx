import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Target, Book, Award, Calendar, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressPage() {
  const { user } = useAuth();

  // Mock data for charts - in real app, this would come from API
  const weeklyData = [
    { day: 'Mon', hours: 2.5, sessions: 2 },
    { day: 'Tue', hours: 3.2, sessions: 3 },
    { day: 'Wed', hours: 1.8, sessions: 1 },
    { day: 'Thu', hours: 4.1, sessions: 3 },
    { day: 'Fri', hours: 2.9, sessions: 2 },
    { day: 'Sat', hours: 3.5, sessions: 2 },
    { day: 'Sun', hours: 2.2, sessions: 1 }
  ];

  const monthlyData = [
    { month: 'Jan', hours: 45 },
    { month: 'Feb', hours: 52 },
    { month: 'Mar', hours: 48 },
    { month: 'Apr', hours: 61 },
    { month: 'May', hours: 55 },
    { month: 'Jun', hours: 67 }
  ];

  const subjectData = [
    { name: 'Mathematics', hours: 25, color: '#3b82f6' },
    { name: 'Physics', hours: 18, color: '#10b981' },
    { name: 'Chemistry', hours: 15, color: '#f59e0b' },
    { name: 'Computer Science', hours: 22, color: '#ef4444' }
  ];

  const achievements = [
    { name: 'Study Streak', value: '15 days', icon: Zap, color: 'text-yellow-500' },
    { name: 'Total Hours', value: '124h', icon: Clock, color: 'text-blue-500' },
    { name: 'Pods Joined', value: '8', icon: Users, color: 'text-green-500' },
    { name: 'Rank', value: '#42', icon: Award, color: 'text-purple-500' }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="text-primary" />
            Learning Progress
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your study journey and achievements
          </p>
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{achievement.name}</p>
                      <p className="text-2xl font-bold">{achievement.value}</p>
                    </div>
                    <achievement.icon className={`w-8 h-8 ${achievement.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Study Hours */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-primary w-5 h-5" />
                Weekly Study Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary w-5 h-5" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Distribution */}
          <Card className="lg:col-span-2 glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="text-primary w-5 h-5" />
                Study Time by Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="hours"
                      label={({ name, value }) => `${name}: ${value}h`}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  {subjectData.map((subject) => (
                    <div key={subject.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-sm text-muted-foreground">{subject.hours}h</span>
                      </div>
                      <Progress 
                        value={(subject.hours / Math.max(...subjectData.map(s => s.hours))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Milestones */}
          <Card className="glassmorphism bg-card/50 dark:bg-card/50 backdrop-blur-lg border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary w-5 h-5" />
                Goals & Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Weekly Goal</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">17/20 hours</p>
                </div>
                
                <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Monthly Target</span>
                    <Badge variant="outline">92%</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">73/80 hours</p>
                </div>
                
                <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Study Streak</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">15/20 days</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Recent Achievements</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>7-Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span>100 Hours Studied</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-green-500" />
                    <span>Pod Contributor</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}