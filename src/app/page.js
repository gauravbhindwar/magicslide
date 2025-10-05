'use client';

import WelcomeSection from '@/components/WelcomeSection';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const handleQuickStart = (prompt) => {
    // Store the prompt in sessionStorage and navigate to chat
    sessionStorage.setItem('quickStartPrompt', prompt);
    router.push('/chat');
  };

  const handleCustomCreate = () => {
    router.push('/pre');
  };

  return (
    <WelcomeSection 
      onQuickStart={handleQuickStart}
      onCustomCreate={handleCustomCreate}
    />
  );
}