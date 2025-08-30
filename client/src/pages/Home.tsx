import { Navigation } from '@/components/Navigation';
import { WelcomeHeader } from '@/components/WelcomeHeader';
import { AIRecommendations } from '@/components/AIRecommendations';
import { MyActivePods } from '@/components/MyActivePods';
import { SidebarWidgets } from '@/components/SidebarWidgets';
import { UpcomingSessions } from '@/components/UpcomingSessions';
import { FloatingActionButton } from '@/components/FloatingActionButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeHeader />
        <AIRecommendations />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MyActivePods />
          <SidebarWidgets />
        </div>
        
        <UpcomingSessions />
      </main>
      
      <FloatingActionButton />
    </div>
  );
}
