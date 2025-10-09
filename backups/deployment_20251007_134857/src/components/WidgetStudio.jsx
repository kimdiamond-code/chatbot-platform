import React, { useState, useEffect } from 'react';
import { Palette, Code, Eye, Download, Copy, Settings, Smartphone, Globe, MessageSquare } from 'lucide-react';

const WidgetStudio = () => {
  const [widgetConfig, setWidgetConfig] = useState({
    // Appearance
    primaryColor: '#3B82F6',
    textColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    position: 'bottom-right',
    size: 'medium',
    borderRadius: '12',
    
    // Branding
    logoUrl: '',
    companyName: 'Your Company',
    welcomeMessage: 'Hi! How can I help you today?',
    agentName: 'Support Agent',
    agentAvatar: '🤖',
    
    // Behavior
    autoOpen: false,
    autoOpenDelay: 5,
    showTypingIndicator: true,
    soundEnabled: true,
    mobileResponsive: true,
    
    // Custom CSS
    customCSS: '',
    
    // Widget ID
    widgetId: 'widget_' + Math.random().toString(36).substr(2, 9)
  });

  const [previewMode, setPreviewMode] = useState('desktop');
  const [embedCode, setEmbedCode] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    generateEmbedCode();
  }, [widgetConfig]);

  const generateEmbedCode = () => {
    const code = `<!-- Your Company Chat Widget -->
<script>
  (function() {
    var w = window;
    var d = document;
    var s = d.createElement('script');
    s.src = 'https://your-domain.com/widget.js';
    s.async = true;
    s.setAttribute('data-widget-id', '${widgetConfig.widgetId}');
    s.setAttribute('data-primary-color', '${widgetConfig.primaryColor}');
    s.setAttribute('data-position', '${widgetConfig.position}');
    s.setAttribute('data-company', '${widgetConfig.companyName}');
    d.head.appendChild(s);
    
    // Widget configuration
    w.ChatWidgetConfig = ${JSON.stringify(widgetConfig, null, 2)};
  })();
</script>
<!-- End Chat Widget -->`;
    
    setEmbedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const downloadWidgetFile = () => {
    const widgetJS = `
// Chat Widget Loader
(function() {
  const config = ${JSON.stringify(widgetConfig, null, 2)};
  
  // Create widget container
  const container = document.createElement('div');
  container.id = 'chat-widget-container';
  container.style.cssText = \`
    position: fixed;
    \${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
    \${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
    z-index: 999999;
  \`;
  
  // Create chat button
  const chatButton = document.createElement('div');
  chatButton.innerHTML = \`
    <div style="
      background: \${config.primaryColor};
      color: \${config.textColor};
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="\${config.textColor}">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </div>
  \`;
  
  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.style.cssText = \`
    position: absolute;
    \${config.position.includes('bottom') ? 'bottom: 70px' : 'top: 70px'};
    \${config.position.includes('right') ? 'right: 0' : 'left: 0'};
    width: 380px;
    height: 600px;
    background: white;
    border-radius: \${config.borderRadius}px;
    box-shadow: 0 5px 40px rgba(0,0,0,0.16);
    display: none;
    flex-direction: column;
    overflow: hidden;
  \`;
  
  chatWindow.innerHTML = \`
    <div style="
      background: \${config.primaryColor};
      color: \${config.textColor};
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">\${config.agentAvatar}</div>
        <div>
          <div style="font-weight: 600;">\${config.agentName}</div>
          <div style="font-size: 12px; opacity: 0.9;">Online</div>
        </div>
      </div>
      <button onclick="toggleChat()" style="
        background: none;
        border: none;
        color: \${config.textColor};
        cursor: pointer;
        font-size: 24px;
      ">×</button>
    </div>
    <iframe 
      src="https://your-domain.com/chat/\${config.widgetId}"
      style="
        flex: 1;
        width: 100%;
        border: none;
      "
    ></iframe>
  \`;
  
  container.appendChild(chatButton);
  container.appendChild(chatWindow);
  document.body.appendChild(container);
  
  // Toggle chat window
  window.toggleChat = function() {
    const display = chatWindow.style.display;
    chatWindow.style.display = display === 'none' ? 'flex' : 'none';
  };
  
  chatButton.onclick = window.toggleChat;
  
  // Auto-open if configured
  if (config.autoOpen) {
    setTimeout(window.toggleChat, config.autoOpenDelay * 1000);
  }
})();`;
    
    const blob = new Blob([widgetJS], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-widget.js';
    a.click();
  };

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
    { value: 'top-right', label: 'Top Right', icon: '↗️' },
    { value: 'top-left', label: 'Top Left', icon: '↖️' }
  ];

  const sizes = [
    { value: 'small', label: 'Small', dimensions: '320x480' },
    { value: 'medium', label: 'Medium', dimensions: '380x600' },
    { value: 'large', label: 'Large', dimensions: '450x700' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Customization Studio</h1>
        <p className="text-gray-600">Design and deploy your chat widget with full control over appearance and behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, primaryColor: e.target.value})}
                    className="w-20 h-10 border border-gray-200 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, primaryColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={widgetConfig.textColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, textColor: e.target.value})}
                    className="w-20 h-10 border border-gray-200 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={widgetConfig.textColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, textColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {positions.map(pos => (
                    <button
                      key={pos.value}
                      onClick={() => setWidgetConfig({...widgetConfig, position: pos.value})}
                      className={`p-3 border rounded-lg transition-all ${
                        widgetConfig.position === pos.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl mr-2">{pos.icon}</span>
                      <span className="text-sm">{pos.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size.value}
                      onClick={() => setWidgetConfig({...widgetConfig, size: size.value})}
                      className={`p-3 border rounded-lg transition-all ${
                        widgetConfig.size === size.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">{size.label}</div>
                      <div className="text-xs text-gray-500">{size.dimensions}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={widgetConfig.borderRadius}
                  onChange={(e) => setWidgetConfig({...widgetConfig, borderRadius: e.target.value})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{widgetConfig.borderRadius}px</div>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Branding
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={widgetConfig.companyName}
                  onChange={(e) => setWidgetConfig({...widgetConfig, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  value={widgetConfig.welcomeMessage}
                  onChange={(e) => setWidgetConfig({...widgetConfig, welcomeMessage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={widgetConfig.agentName}
                  onChange={(e) => setWidgetConfig({...widgetConfig, agentName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Avatar</label>
                <input
                  type="text"
                  value={widgetConfig.agentAvatar}
                  onChange={(e) => setWidgetConfig({...widgetConfig, agentAvatar: e.target.value})}
                  placeholder="Emoji or image URL"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (optional)</label>
                <input
                  type="url"
                  value={widgetConfig.logoUrl}
                  onChange={(e) => setWidgetConfig({...widgetConfig, logoUrl: e.target.value})}
                  placeholder="https://your-logo.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Behavior
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-open widget</span>
                <input
                  type="checkbox"
                  checked={widgetConfig.autoOpen}
                  onChange={(e) => setWidgetConfig({...widgetConfig, autoOpen: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              
              {widgetConfig.autoOpen && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto-open delay (seconds)</label>
                  <input
                    type="number"
                    value={widgetConfig.autoOpenDelay}
                    onChange={(e) => setWidgetConfig({...widgetConfig, autoOpenDelay: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              )}
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show typing indicator</span>
                <input
                  type="checkbox"
                  checked={widgetConfig.showTypingIndicator}
                  onChange={(e) => setWidgetConfig({...widgetConfig, showTypingIndicator: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sound notifications</span>
                <input
                  type="checkbox"
                  checked={widgetConfig.soundEnabled}
                  onChange={(e) => setWidgetConfig({...widgetConfig, soundEnabled: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Mobile responsive</span>
                <input
                  type="checkbox"
                  checked={widgetConfig.mobileResponsive}
                  onChange={(e) => setWidgetConfig({...widgetConfig, mobileResponsive: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Custom CSS
            </h2>
            
            <textarea
              value={widgetConfig.customCSS}
              onChange={(e) => setWidgetConfig({...widgetConfig, customCSS: e.target.value})}
              placeholder="/* Add custom CSS here */
.chat-widget {
  /* Your styles */
}"
              className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Preview Controls */}
          <div className="glass-premium p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-all ${
                    previewMode === 'desktop' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-all ${
                    previewMode === 'mobile' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Window */}
          <div className="glass-premium p-6 rounded-xl">
            <div 
              className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}
              style={{ height: '600px' }}
            >
              {/* Mock Website */}
              <div className="absolute inset-0 p-8 overflow-y-auto">
                <div className="space-y-4">
                  <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Chat Widget */}
              <div 
                className="absolute"
                style={{
                  [widgetConfig.position.includes('bottom') ? 'bottom' : 'top']: '20px',
                  [widgetConfig.position.includes('right') ? 'right' : 'left']: '20px'
                }}
              >
                <div 
                  className="shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: widgetConfig.primaryColor,
                    color: widgetConfig.textColor,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}
                >
                  💬
                </div>
                
                {/* Chat Window Preview */}
                <div 
                  className="absolute bg-white shadow-2xl"
                  style={{
                    [widgetConfig.position.includes('bottom') ? 'bottom' : 'top']: '70px',
                    [widgetConfig.position.includes('right') ? 'right' : 'left']: '0',
                    width: widgetConfig.size === 'small' ? '320px' : widgetConfig.size === 'large' ? '450px' : '380px',
                    height: widgetConfig.size === 'small' ? '480px' : widgetConfig.size === 'large' ? '700px' : '600px',
                    borderRadius: `${widgetConfig.borderRadius}px`,
                    display: 'none'
                  }}
                >
                  <div 
                    style={{
                      background: widgetConfig.primaryColor,
                      color: widgetConfig.textColor,
                      padding: '20px',
                      borderRadius: `${widgetConfig.borderRadius}px ${widgetConfig.borderRadius}px 0 0`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{widgetConfig.agentAvatar}</div>
                        <div>
                          <div className="font-semibold">{widgetConfig.agentName}</div>
                          <div className="text-xs opacity-90">Online</div>
                        </div>
                      </div>
                      <button className="text-2xl opacity-80 hover:opacity-100">×</button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-800">{widgetConfig.welcomeMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="glass-premium p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Embed Code</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {showCopied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={downloadWidgetFile}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JS
                </button>
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{embedCode}</code>
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Installation Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the embed code above</li>
                <li>Paste it before the closing &lt;/body&gt; tag on your website</li>
                <li>The widget will appear automatically on all pages</li>
                <li>Customize further using the Widget Studio</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetStudio;