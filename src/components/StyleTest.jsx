import React from 'react';

// Simple test component to verify enhanced styling
const StyleTest = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Enhanced Styling Test</h2>
      
      {/* Glass Effect Test */}
      <div className="glass-premium p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Glass Premium Effect</h3>
        <p>This should have glassmorphism with blur background</p>
      </div>

      {/* 3D Hover Effect Test */}
      <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt cursor-pointer">
        <h3 className="text-lg font-semibold mb-2">3D Hover Effect</h3>
        <p>This should tilt in 3D when you hover over it</p>
      </div>

      {/* Sparkle Effect Test */}
      <div className="bg-blue-500 text-white p-6 rounded-xl sparkle-effect">
        <h3 className="text-lg font-semibold mb-2">Sparkle Effect</h3>
        <p>This should have sparkle animations in corners</p>
      </div>

      {/* Text Effects Test */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-shine mb-2">Gradient Text Effect</h3>
        <p className="text-glow-wow text-xl">This text should have a glow effect</p>
      </div>

      {/* Floating Animation Test */}
      <div className="text-center">
        <div className="text-6xl animate-float-3d inline-block">🚀</div>
        <p className="animate-bounce-subtle">This should float in 3D and bounce</p>
      </div>

      {/* Background Test */}
      <div className="gradient-background p-6 rounded-xl">
        <h3 className="text-lg font-semibold">Animated Gradient Background</h3>
        <p>This background should have animated gradients</p>
      </div>

      {/* Floating Orbs Test */}
      <div className="relative h-32 overflow-hidden rounded-xl bg-gray-100">
        <div className="floating-orb"></div>
        <div className="floating-orb" style={{ animationDelay: '-5s', left: '60%' }}></div>
        <div className="relative z-10 p-4">
          <h3 className="font-semibold">Floating Orbs Background</h3>
          <p>You should see animated floating orbs</p>
        </div>
      </div>
    </div>
  );
};

export default StyleTest;