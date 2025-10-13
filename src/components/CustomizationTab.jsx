import React, { useState, useRef } from 'react';

const CustomizationTab = ({ botConfig, updateConfig }) => {
  const [logoPreview, setLogoPreview] = useState(botConfig.customization?.logo || null);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setLogoPreview(base64);
        updateConfig('customization', { logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateConfig('customization', { logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const customization = botConfig.customization || {
    // Colors
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    botMessageBg: '#F3F4F6',
    userMessageBg: '#3B82F6',
    
    // Typography
    fontFamily: 'system-ui',
    fontSize: 'medium',
    
    // Widget
    position: 'bottom-right',
    widgetSize: 'medium',
    borderRadius: 'rounded',
    
    // Branding
    logo: null,
    showBranding: true,
    brandName: 'ChatBot',
    
    // Chat Bubble
    bubbleIcon: '💬',
    bubbleColor: '#3B82F6',
    bubbleSize: 'large'
  };

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🎨</span> Color Scheme
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => updateConfig('customization', { primaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={(e) => updateConfig('customization', { primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#3B82F6"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">User messages, buttons, highlights</p>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.secondaryColor}
                onChange={(e) => updateConfig('customization', { secondaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.secondaryColor}
                onChange={(e) => updateConfig('customization', { secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#10B981"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Links, accents, success states</p>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.backgroundColor}
                onChange={(e) => updateConfig('customization', { backgroundColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.backgroundColor}
                onChange={(e) => updateConfig('customization', { backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Chat window background</p>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.textColor}
                onChange={(e) => updateConfig('customization', { textColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.textColor}
                onChange={(e) => updateConfig('customization', { textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#1F2937"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Main text color</p>
          </div>

          {/* Bot Message Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot Message Background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.botMessageBg}
                onChange={(e) => updateConfig('customization', { botMessageBg: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.botMessageBg}
                onChange={(e) => updateConfig('customization', { botMessageBg: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#F3F4F6"
              />
            </div>
          </div>

          {/* User Message Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Message Background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.userMessageBg}
                onChange={(e) => updateConfig('customization', { userMessageBg: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.userMessageBg}
                onChange={(e) => updateConfig('customization', { userMessageBg: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#3B82F6"
              />
            </div>
          </div>
        </div>

        {/* Quick Color Themes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Themes</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'Blue', primary: '#3B82F6', secondary: '#10B981' },
              { name: 'Purple', primary: '#8B5CF6', secondary: '#EC4899' },
              { name: 'Green', primary: '#10B981', secondary: '#3B82F6' },
              { name: 'Orange', primary: '#F59E0B', secondary: '#EF4444' },
              { name: 'Red', primary: '#EF4444', secondary: '#F59E0B' },
              { name: 'Indigo', primary: '#6366F1', secondary: '#8B5CF6' },
              { name: 'Teal', primary: '#14B8A6', secondary: '#06B6D4' },
              { name: 'Dark', primary: '#1F2937', secondary: '#374151' }
            ].map((theme) => (
              <button
                key={theme.name}
                onClick={() => updateConfig('customization', {
                  primaryColor: theme.primary,
                  secondaryColor: theme.secondary,
                  userMessageBg: theme.primary
                })}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all"
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo & Branding */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🏷️</span> Logo & Branding
        </h3>
        
        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Change Logo
                  </button>
                  <button
                    onClick={removeLogo}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📤</span>
                <span className="text-sm font-medium text-gray-700">Click to upload logo</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={customization.brandName}
              onChange={(e) => updateConfig('customization', { brandName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Your Company Name"
            />
          </div>

          {/* Show Branding */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customization.showBranding}
              onChange={(e) => updateConfig('customization', { showBranding: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Show "Powered by" branding</span>
              <p className="text-xs text-gray-500">Display attribution in chat footer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📝</span> Typography
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={customization.fontFamily}
              onChange={(e) => updateConfig('customization', { fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="system-ui">System Default</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={customization.fontSize}
              onChange={(e) => updateConfig('customization', { fontSize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Widget Position & Size */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📍</span> Widget Position & Size
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['bottom-right', 'bottom-left', 'top-right', 'top-left'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateConfig('customization', { position: pos })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                    customization.position === pos
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pos.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Widget Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => updateConfig('customization', { widgetSize: size })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm capitalize ${
                    customization.widgetSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corner Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'square', label: 'Square', icon: '⬜' },
                { value: 'rounded', label: 'Rounded', icon: '▢' },
                { value: 'pill', label: 'Pill', icon: '⬭' }
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateConfig('customization', { borderRadius: style.value })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm flex flex-col items-center gap-1 ${
                    customization.borderRadius === style.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{style.icon}</span>
                  <span className="text-xs">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bubble */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">💬</span> Chat Bubble
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Bubble Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['💬', '💭', '🤖', '👋', '💡', '❓', '📧', '✨'].map((icon) => (
                <button
                  key={icon}
                  onClick={() => updateConfig('customization', { bubbleIcon: icon })}
                  className={`w-12 h-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${
                    customization.bubbleIcon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Bubble Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bubble Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.bubbleColor}
                onChange={(e) => updateConfig('customization', { bubbleColor: e.target.value })}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customization.bubbleColor}
                onChange={(e) => updateConfig('customization', { bubbleColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Bubble Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bubble Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => updateConfig('customization', { bubbleSize: size })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm capitalize ${
                    customization.bubbleSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationTab;
