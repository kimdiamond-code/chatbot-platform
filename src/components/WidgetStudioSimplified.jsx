import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Code } from 'lucide-react';
import rbacService, { PERMISSIONS } from '../services/rbacService';

const WidgetStudioSimplified = () => {
  const [copied, setCopied] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Check if user has permission to view code
  const canViewCode = rbacService.hasPermission(PERMISSIONS.VIEW_WIDGET_CODE);
  const canEditCode = rbacService.hasPermission(PERMISSIONS.EDIT_WIDGET_CODE);

  // Widget code (simplified for regular users)
  const widgetCode = `<!-- AgenStack Chatbot Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://chatbot-platform-v2.vercel.app/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([widgetCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatbot-widget.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Regular user view (simplified)
  if (!canViewCode) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="glass-premium rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Install Your Chatbot</h1>
            <p className="text-gray-600">Add the chatbot to your website in seconds</p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <button
              onClick={handleCopyCode}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="font-semibold">Copy Widget Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Download Code File</span>
            </button>

            <button
              onClick={() => setShowInstallModal(true)}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-semibold">View Installation Guide</span>
            </button>
          </div>

          {/* Quick Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
              <div className="text-sm text-gray-600">Copy the code</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Paste before &lt;/body&gt;</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">3</div>
              <div className="text-sm text-gray-600">Your bot is live!</div>
            </div>
          </div>

          {/* Platform-specific guides */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Install Guides</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-sm font-medium text-gray-700">WordPress</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-sm font-medium text-gray-700">Shopify</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-sm font-medium text-gray-700">Wix</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-sm font-medium text-gray-700">Custom HTML</div>
              </div>
            </div>
          </div>

          {/* Support Note */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Contact your administrator for advanced customization options.
            </p>
          </div>
        </div>

        {/* Installation Modal */}
        {showInstallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Installation Guide</h2>
                  <button
                    onClick={() => setShowInstallModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Standard HTML Website</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Copy the widget code above</li>
                      <li>Open your website's HTML file</li>
                      <li>Paste the code just before the closing &lt;/body&gt; tag</li>
                      <li>Save and upload the file</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">WordPress</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Go to Appearance → Theme Editor</li>
                      <li>Select footer.php</li>
                      <li>Paste the code before &lt;/body&gt;</li>
                      <li>Click "Update File"</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Shopify</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Go to Online Store → Themes</li>
                      <li>Click Actions → Edit Code</li>
                      <li>Open theme.liquid</li>
                      <li>Paste the code before &lt;/body&gt;</li>
                      <li>Save</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Make sure to test the widget on your site after installation.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowInstallModal(false)}
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/Developer view - full code editor (import full component)
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Admin View:</strong> Full widget customization available. Import WidgetStudio component for complete features.
        </p>
      </div>
      
      {/* Show simplified version for now */}
      <div className="glass-premium rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Widget Studio</h1>
        
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <pre className="text-gray-100 text-sm overflow-x-auto">
            <code>{widgetCode}</code>
          </pre>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetStudioSimplified;
