import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const tourSteps = [
  {
    target: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Your command center. Track conversations, engagement, and key metrics at a glance.',
    position: 'center'
  },
  {
    target: 'bot-builder',
    title: 'Bot Builder',
    description: 'Customize your chatbot\'s personality, add knowledge, and configure responses here.',
    position: 'center'
  },
  {
    target: 'analytics',
    title: 'Analytics & Insights',
    description: 'Deep dive into performance data, conversion rates, and customer behavior patterns.',
    position: 'center'
  },
  {
    target: 'proactive',
    title: 'Proactive Engagement',
    description: 'Set up smart triggers to engage visitors based on behavior, time, or page URLs.',
    position: 'center'
  },
  {
    target: 'integrations',
    title: 'Integrations',
    description: 'Connect Shopify, CRM tools, and communication channels to centralize everything.',
    position: 'center'
  }
];

export default function ProductTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity" />

      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-lg w-full z-50 p-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Indicators */}
        <div className="flex gap-2 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="text-sm text-blue-600 font-semibold mb-2">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <h3 className="text-2xl font-bold mb-3">{currentTourStep.title}</h3>
          <p className="text-gray-600 leading-relaxed">{currentTourStep.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
