import React, { useState, useEffect } from 'react';
import WelcomeModal from './WelcomeModal';
import ProductTour from './ProductTour';
import SetupChecklist from './SetupChecklist';
import QuickActionsPanel from './QuickActionsPanel';

export default function OnboardingManager({ onNavigate }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    // Check if user is new (first visit)
    const hasSeenWelcome = localStorage.getItem('onboarding-welcome-seen');
    const hasCompletedTour = localStorage.getItem('onboarding-tour-completed');
    
    if (!hasSeenWelcome) {
      // First time user - show welcome modal
      setShowWelcome(true);
    } else if (!hasCompletedTour) {
      // Returning user who hasn't completed tour
      setShowChecklist(true);
      setShowQuickActions(true);
    } else {
      // Completed onboarding - just show checklist if not dismissed
      setShowChecklist(true);
    }
  }, []);

  const handleWelcomeStart = () => {
    setShowWelcome(false);
    setShowTour(true);
    localStorage.setItem('onboarding-welcome-seen', 'true');
  };

  const handleWelcomeSkip = () => {
    setShowWelcome(false);
    setShowChecklist(true);
    setShowQuickActions(true);
    localStorage.setItem('onboarding-welcome-seen', 'true');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setShowChecklist(true);
    setShowQuickActions(true);
    localStorage.setItem('onboarding-tour-completed', 'true');
  };

  const handleTourSkip = () => {
    setShowTour(false);
    setShowChecklist(true);
    setShowQuickActions(true);
    localStorage.setItem('onboarding-tour-completed', 'true');
  };

  const handleQuickActionsClose = () => {
    setShowQuickActions(false);
  };

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          onClose={handleWelcomeSkip}
          onStartTour={handleWelcomeStart}
        />
      )}

      {showTour && (
        <ProductTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {showChecklist && (
        <SetupChecklist
          onNavigate={onNavigate}
        />
      )}

      {showQuickActions && (
        <QuickActionsPanel
          onNavigate={onNavigate}
          onClose={handleQuickActionsClose}
        />
      )}
    </>
  );
}

// Helper function to reset onboarding (useful for testing or re-showing)
export function resetOnboarding() {
  localStorage.removeItem('onboarding-welcome-seen');
  localStorage.removeItem('onboarding-tour-completed');
  localStorage.removeItem('onboarding-checklist');
  localStorage.removeItem('onboarding-checklist-dismissed');
  localStorage.removeItem('quick-actions-dismissed');
  window.location.reload();
}
