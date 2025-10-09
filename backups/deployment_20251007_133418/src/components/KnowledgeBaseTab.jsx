import React, { useState } from 'react';

const KnowledgeBaseTab = ({ botConfig, updateConfig, Upload, Globe, Link, BookOpen, Trash }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [webUrl, setWebUrl] = useState('');
  const [webScraping, setWebScraping] = useState(false);
  const [discoveredPages, setDiscoveredPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [scrapingProgress, setScrapingProgress] = useState(null);
  const [showSubpages, setShowSubpages] = useState(false);

  const debugLog = (message, data = null) => {
    console.log(`🔍 Knowledge Base: ${message}`, data);
  };

  // Discover subpages from a URL
  const discoverSubpages = async (url) => {
    debugLog('Discovering subpages', { url });
    setWebScraping(true);
    
    try {
      // Validate URL
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
      
      // Fetch the main page
      const response = await fetch('/api/scrape-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }

      const data = await response.json();
      
      // Extract unique internal links
      const links = data.links || [];
      const uniqueLinks = [...new Set(links)]
        .filter(link => {
          // Only include links from same domain
          try {
            const linkUrl = new URL(link, baseUrl);
            return linkUrl.hostname === urlObj.hostname && 
                   !link.match(/\.(jpg|jpeg|png|gif|pdf|zip|doc|docx)$/i) && // Skip files
                   !link.includes('#') && // Skip anchors
                   !link.includes('mailto:') && // Skip email links
                   !link.includes('tel:'); // Skip phone links
          } catch {
            return false;
          }
        })
        .map(link => {
          const fullUrl = link.startsWith('http') ? link : new URL(link, baseUrl).href;
          return {
            url: fullUrl,
            title: link.split('/').filter(Boolean).pop() || 'Home Page',
            selected: link === url // Auto-select the main page
          };
        })
        .slice(0, 50); // Limit to 50 pages

      // Add the main page if not in list
      const mainPageInList = uniqueLinks.some(p => p.url === url);
      if (!mainPageInList) {
        uniqueLinks.unshift({
          url,
          title: 'Main Page',
          selected: true
        });
      }

      debugLog('Discovered pages', { count: uniqueLinks.length });
      setDiscoveredPages(uniqueLinks);
      setSelectedPages(uniqueLinks.filter(p => p.selected).map(p => p.url));
      setShowSubpages(true);
      
    } catch (error) {
      debugLog('Discovery error', error);
      console.error('Error discovering subpages:', error);
      alert(`Error discovering subpages: ${error.message}`);
      
      // Fallback: Just add the main URL
      setDiscoveredPages([{
        url,
        title: 'Main Page',
        selected: true
      }]);
      setSelectedPages([url]);
      setShowSubpages(true);
    } finally {
      setWebScraping(false);
    }
  };

  // Toggle page selection
  const togglePageSelection = (pageUrl) => {
    setSelectedPages(prev => {
      if (prev.includes(pageUrl)) {
        return prev.filter(url => url !== pageUrl);
      } else {
        return [...prev, pageUrl];
      }
    });
  };

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(discoveredPages.map(p => p.url));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  // Scrape selected pages
  const scrapeSelectedPages = async () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page to scrape');
      return;
    }

    debugLog('Scraping selected pages', { count: selectedPages.length });
    setWebScraping(true);
    setScrapingProgress({ current: 0, total: selectedPages.length, currentUrl: '' });

    const scrapedItems = [];

    for (let i = 0; i < selectedPages.length; i++) {
      const pageUrl = selectedPages[i];
      
      setScrapingProgress({
        current: i + 1,
        total: selectedPages.length,
        currentUrl: pageUrl
      });

      try {
        debugLog(`Scraping page ${i + 1}/${selectedPages.length}`, { url: pageUrl });

        // Scrape the page
        const response = await fetch('/api/scrape-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pageUrl })
        });

        if (!response.ok) {
          throw new Error('Failed to scrape page');
        }

        const data = await response.json();
        
        // Create knowledge item
        const knowledgeItem = {
          id: Date.now() + i,
          name: data.title || new URL(pageUrl).pathname.split('/').filter(Boolean).pop() || 'Web Page',
          type: 'webpage',
          content: data.content.substring(0, 300) + (data.content.length > 300 ? '...' : ''),
          fullContent: data.content,
          status: 'processed',
          uploadDate: new Date().toISOString().split('T')[0],
          wordCount: data.content.split(/\s+/).filter(word => word.length > 0).length,
          url: pageUrl,
          source: 'web'
        };

        scrapedItems.push(knowledgeItem);
        debugLog('Page scraped successfully', { url: pageUrl });

      } catch (error) {
        debugLog(`Error scraping ${pageUrl}`, error);
        console.error(`Error scraping ${pageUrl}:`, error);
      }

      // Small delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Add all scraped items to knowledge base
    if (scrapedItems.length > 0) {
      const currentKnowledge = botConfig.knowledgeBase || [];
      updateConfig('knowledgeBase', [...currentKnowledge, ...scrapedItems]);
      
      alert(`Successfully scraped ${scrapedItems.length} page(s) and added to knowledge base!`);
    }

    // Reset
    setWebScraping(false);
    setScrapingProgress(null);
    setShowSubpages(false);
    setDiscoveredPages([]);
    setSelectedPages([]);
    setWebUrl('');
  };

  const handleFileUpload = async (files) => {
    debugLog('File upload triggered', { filesCount: files?.length });
    
    if (!files || files.length === 0) {
      debugLog('No files provided');
      return;
    }
    
    const fileArray = Array.from(files);
    debugLog('Processing files', fileArray.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    for (const file of fileArray) {
      debugLog(`Processing file: ${file.name}`);
      setUploadProgress({ file: file.name, status: 'reading', progress: 25 });
      
      try {
        const validTypes = ['.txt', '.pdf', '.doc', '.docx'];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const isValidType = validTypes.some(type => type.includes(fileExtension));
        
        if (!isValidType) {
          debugLog(`Invalid file type: ${fileExtension}`);
          setUploadProgress({ file: file.name, status: 'error', progress: 0, error: 'Unsupported file type' });
          alert(`Unsupported file type: .${fileExtension}. Please use TXT, PDF, DOC, or DOCX files.`);
          setTimeout(() => setUploadProgress(null), 5000);
          continue;
        }

        debugLog(`Reading file content for: ${file.name}`);
        setUploadProgress({ file: file.name, status: 'reading', progress: 50 });
        
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            debugLog(`File read successfully: ${file.name}`, { contentLength: e.target.result?.length || 0 });
            resolve(e.target.result || '');
          };
          reader.onerror = (e) => {
            debugLog(`File read error: ${file.name}`, e);
            reject(new Error(`Failed to read file: ${file.name}`));
          };
          reader.readAsText(file, 'UTF-8');
        });
        
        setUploadProgress({ file: file.name, status: 'processing', progress: 75 });
        debugLog(`Processing content for: ${file.name}`, { contentPreview: fileContent.substring(0, 100) });
        
        const knowledgeItem = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: 'file',
          content: fileContent.substring(0, 300) + (fileContent.length > 300 ? '...' : ''),
          fullContent: fileContent,
          status: 'processed',
          uploadDate: new Date().toISOString().split('T')[0],
          wordCount: fileContent.split(/\s+/).filter(word => word.length > 0).length,
          size: file.size,
          source: 'upload',
          fileType: fileExtension
        };
        
        debugLog(`Created knowledge item:`, knowledgeItem);
        
        const currentKnowledge = botConfig.knowledgeBase || [];
        updateConfig('knowledgeBase', [...currentKnowledge, knowledgeItem]);
        
        setUploadProgress({ file: file.name, status: 'success', progress: 100 });
        debugLog(`Successfully added ${file.name} to knowledge base`);
        
        setTimeout(() => setUploadProgress(null), 3000);
        
      } catch (error) {
        debugLog(`Error processing ${file.name}:`, error);
        console.error('File processing error:', error);
        setUploadProgress({ file: file.name, status: 'error', progress: 0, error: error.message });
        setTimeout(() => setUploadProgress(null), 5000);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isDragEnterOrOver = e.type === "dragenter" || e.type === "dragover";
    setDragActive(isDragEnterOrOver);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeKnowledgeItem = (id) => {
    debugLog('Removing knowledge item', { id });
    const updatedKnowledge = (botConfig.knowledgeBase || []).filter(item => item.id !== id);
    updateConfig('knowledgeBase', updatedKnowledge);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Upload /> Upload Documents
        </h3>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadProgress ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {uploadProgress.status === 'success' && '✅ Upload Complete!'}
                {uploadProgress.status === 'error' && '❌ Upload Failed!'}
                {uploadProgress.status === 'reading' && '📖 Reading File...'}
                {uploadProgress.status === 'processing' && '⚙️ Processing...'}
              </div>
              <div className="text-sm text-gray-600">{uploadProgress.file}</div>
              {uploadProgress.error && (
                <div className="text-red-600 text-xs">{uploadProgress.error}</div>
              )}
              {uploadProgress.status !== 'success' && uploadProgress.status !== 'error' && (
                <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="text-gray-400 mx-auto text-4xl" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Drag files here or</p>
                <input
                  type="file"
                  multiple
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload-input"
                />
                <label 
                  htmlFor="file-upload-input"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer inline-block"
                >
                  Choose Files
                </label>
                <p className="text-xs text-gray-500 mt-2">TXT, PDF, DOC, DOCX (Max 10MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Web Scraper Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Globe /> Web Content Scraper
        </h3>
        
        {!showSubpages ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://example.com"
                  disabled={webScraping}
                />
                <button
                  onClick={() => discoverSubpages(webUrl)}
                  disabled={!webUrl.trim() || webScraping}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                >
                  {webScraping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Link /> Discover Pages
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Discover all pages on the website, then select which ones to scrape
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Subpages Selection */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Discovered Pages ({discoveredPages.length})
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPages}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllPages}
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {discoveredPages.map((page, index) => (
                  <label
                    key={index}
                    className="flex items-start space-x-2 p-2 hover:bg-white rounded cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page.url)}
                      onChange={() => togglePageSelection(page.url)}
                      className="mt-0.5 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{page.title}</div>
                      <div className="text-xs text-gray-500 truncate">{page.url}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                {selectedPages.length} page(s) selected
              </div>
            </div>

            {/* Scraping Progress */}
            {scrapingProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Scraping page {scrapingProgress.current} of {scrapingProgress.total}
                  </span>
                  <span className="text-xs text-blue-700">
                    {Math.round((scrapingProgress.current / scrapingProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(scrapingProgress.current / scrapingProgress.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-700 truncate">
                  {scrapingProgress.currentUrl}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={scrapeSelectedPages}
                disabled={selectedPages.length === 0 || webScraping}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {webScraping ? 'Scraping...' : `Scrape ${selectedPages.length} Page(s)`}
              </button>
              <button
                onClick={() => {
                  setShowSubpages(false);
                  setDiscoveredPages([]);
                  setSelectedPages([]);
                }}
                disabled={webScraping}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Knowledge Base Display */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          📚 Knowledge Base ({(botConfig.knowledgeBase || []).length})
        </h3>
        
        {(!botConfig.knowledgeBase || botConfig.knowledgeBase.length === 0) ? (
          <div className="text-center py-6 text-gray-500">
            <BookOpen className="mx-auto mb-2 text-4xl opacity-50" />
            <p className="text-sm">No documents added yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {botConfig.knowledgeBase.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-lg flex-shrink-0">
                    {item.source === 'web' ? '🌐' : '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <span>📅 {item.uploadDate}</span>
                      {item.wordCount && <span>📝 {item.wordCount.toLocaleString()} words</span>}
                    </div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate block mt-1"
                      >
                        🔗 {item.url}
                      </a>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => removeKnowledgeItem(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                  title="Remove"
                >
                  <Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseTab;
