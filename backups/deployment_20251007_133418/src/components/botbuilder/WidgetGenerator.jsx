import React, { useState, useEffect } from 'react';

const WidgetGenerator = ({ data, onUpdate, botConfig }) => {
  const [widgetConfig, setWidgetConfig] = useState(data);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [copySuccess, setCopySuccess] = useState('');

  const handleConfigChange = (field, value) => {
    const updatedConfig = { ...widgetConfig, [field]: value };
    setWidgetConfig(updatedConfig);
    onUpdate(updatedConfig);
  };

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right', preview: 'bottom-4 right-4' },
    { value: 'bottom-left', label: 'Bottom Left', preview: 'bottom-4 left-4' },
    { value: 'top-right', label: 'Top Right', preview: 'top-4 right-4' },
    { value: 'top-left', label: 'Top Left', preview: 'top-4 left-4' },
    { value: 'center', label: 'Center', preview: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' }
  ];

  const themes = [
    { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
    { value: 'green', label: 'Green', bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' }
  ];

  const sizes = [
    { value: 'small', label: 'Small', width: 'w-64', height: 'h-80' },
    { value: 'medium', label: 'Medium', width: 'w-80', height: 'h-96' },
    { value: 'large', label: 'Large', width: 'w-96', height: 'h-[500px]' }
  ];

  const generateEmbedCode = () => {
    const config = {
      ...widgetConfig,
      botName: botConfig.personality.name || 'ChatBot',
      greeting: botConfig.personality.greetingMessage || 'Hello! How can I help you?',
      avatar: botConfig.personality.avatar || 'robot'
    };

    return `<!-- ChatBot Widget -->
<script>
  window.ChatBotConfig = ${JSON.stringify(config, null, 2)};
</script>
<script src="https://your-domain.com/widget/chatbot.js"></script>
<div id="chatbot-widget"></div>`;
  };

  const generateReactComponent = () => {
    const config = {
      ...widgetConfig,
      botName: botConfig.personality.name || 'ChatBot',
      greeting: botConfig.personality.greetingMessage || 'Hello! How can I help you?',
      avatar: botConfig.personality.avatar || 'robot'
    };

    return `import React from 'react';
import ChatBotWidget from './ChatBotWidget';

const MyPage = () => {
  const chatbotConfig = ${JSON.stringify(config, null, 2)};

  return (
    <div>
      {/* Your page content */}
      <ChatBotWidget config={chatbotConfig} />
    </div>
  );
};

export default MyPage;`;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const currentTheme = themes.find(t => t.value === widgetConfig.theme) || themes[0];
  const currentSize = sizes.find(s => s.value === widgetConfig.size) || sizes[1];
  const currentPosition = positions.find(p => p.value === widgetConfig.position) || positions[0];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔧 Widget Generator</h2>
        <p className="text-gray-600">Customize and generate your chatbot widget for website integration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Position Settings */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Widget Position</h3>
            <div className="grid grid-cols-2 gap-3">
              {positions.map((position) => (
                <label
                  key={position.value}
                  className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                    widgetConfig.position === position.value
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="position"
                    value={position.value}
                    checked={widgetConfig.position === position.value}
                    onChange={(e) => handleConfigChange('position', e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900">{position.label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Theme & Colors</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <label
                    key={theme.value}
                    className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                      widgetConfig.theme === theme.value
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={widgetConfig.theme === theme.value}
                      onChange={(e) => handleConfigChange('theme', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-full h-8 rounded mb-2 ${theme.bg} ${theme.border} border`}></div>
                    <div className="font-medium text-gray-900 text-sm">{theme.label}</div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Custom Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-purple-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="flex-1 p-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size Settings */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Widget Size</h3>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <label
                  key={size.value}
                  className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                    widgetConfig.size === size.value
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.value}
                    checked={widgetConfig.size === size.value}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900">{size.label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">Advanced Options</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={widgetConfig.showPoweredBy || false}
                  onChange={(e) => handleConfigChange('showPoweredBy', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-orange-800">Show "Powered by" branding</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={widgetConfig.autoOpen || false}
                  onChange={(e) => handleConfigChange('autoOpen', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-orange-800">Auto-open widget on page load</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-orange-800 mb-2">
                  Auto-open delay (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={widgetConfig.autoOpenDelay || 3}
                  onChange={(e) => handleConfigChange('autoOpenDelay', parseInt(e.target.value))}
                  disabled={!widgetConfig.autoOpen}
                  className="w-full p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Preview Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🖥️ Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📱 Mobile
                </button>
              </div>
            </div>

            {/* Preview Container */}
            <div className={`relative border-2 border-gray-300 rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'w-64 h-96 mx-auto' : 'w-full h-80'
            } bg-gradient-to-br from-blue-50 to-purple-50`}>
              {/* Mock Website Content */}
              <div className="p-4 text-center text-gray-500 text-sm">
                <div className="mb-4">🌐 Your Website</div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>

              {/* Widget Preview */}
              <div className={`absolute ${currentPosition.preview} z-10`}>
                <div className={`${currentSize.width} ${currentSize.height} ${currentTheme.bg} ${currentTheme.border} border rounded-lg shadow-lg overflow-hidden`}>
                  {/* Widget Header */}
                  <div className="p-4 border-b" style={{ backgroundColor: widgetConfig.primaryColor }}>
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {botConfig.personality.avatar ? '🤖' : '💬'}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {botConfig.personality.name || 'ChatBot'}
                        </div>
                        <div className="text-white text-xs opacity-75">Online</div>
                      </div>
                    </div>
                  </div>

                  {/* Widget Content */}
                  <div className={`p-4 flex-1 ${currentTheme.text}`}>
                    <div className="space-y-3">
                      <div className="bg-gray-100 rounded-lg p-3 text-sm">
                        {botConfig.personality.greetingMessage || 'Hello! How can I help you today?'}
                      </div>
                      <div className="text-right">
                        <div className="inline-block rounded-lg p-3 text-sm text-white max-w-xs" style={{ backgroundColor: widgetConfig.primaryColor }}>
                          Hi there!
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Widget Input */}
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled
                      />
                      <button
                        className="px-3 py-2 text-white rounded-lg text-sm"
                        style={{ backgroundColor: widgetConfig.primaryColor }}
                        disabled
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Code */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Code</h3>
            
            <div className="space-y-4">
              {/* HTML Embed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">HTML Embed Code</label>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(), 'html')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    {copySuccess === 'html' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <textarea
                  value={generateEmbedCode()}
                  readOnly
                  rows="6"
                  className="w-full p-3 text-xs font-mono bg-gray-800 text-green-400 rounded-lg border border-gray-600"
                />
              </div>

              {/* React Component */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">React Component</label>
                  <button
                    onClick={() => copyToClipboard(generateReactComponent(), 'react')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    {copySuccess === 'react' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <textarea
                  value={generateReactComponent()}
                  readOnly
                  rows="8"
                  className="w-full p-3 text-xs font-mono bg-gray-800 text-green-400 rounded-lg border border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Start Guide</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Copy the HTML embed code above</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Paste it into your website before the closing &lt;/body&gt; tag</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Upload the chatbot.js file to your website</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Test the widget and you're ready to go!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;