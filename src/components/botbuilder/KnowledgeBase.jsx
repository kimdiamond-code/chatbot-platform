import React, { useState } from 'react';

const KnowledgeBase = ({ data, onUpdate }) => {
  const [documents, setDocuments] = useState(data || []);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'webpage'
  
  // Webpage form state
  const [webpageForm, setWebpageForm] = useState({
    url: '',
    title: '',
    category: 'general',
    description: ''
  });

  const categories = [
    { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-700' },
    { value: 'support', label: 'Support', color: 'bg-green-100 text-green-700' },
    { value: 'technical', label: 'Technical', color: 'bg-purple-100 text-purple-700' },
    { value: 'policies', label: 'Policies', color: 'bg-red-100 text-red-700' },
    { value: 'procedures', label: 'Procedures', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'faq', label: 'FAQ', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'training', label: 'Training', color: 'bg-pink-100 text-pink-700' },
    { value: 'website', label: 'Website Pages', color: 'bg-teal-100 text-teal-700' }
  ];

  const supportedFormats = [
    { ext: 'pdf', icon: '📄', label: 'PDF Documents' },
    { ext: 'doc', icon: '📝', label: 'Word Documents' },
    { ext: 'docx', icon: '📝', label: 'Word Documents' },
    { ext: 'txt', icon: '📋', label: 'Text Files' },
    { ext: 'url', icon: '🌐', label: 'Web Pages' }
  ];

  const updateDocuments = (docs) => {
    setDocuments(docs);
    onUpdate(docs);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return supportedFormats.some(format => format.ext === ext && format.ext !== 'url');
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF, DOC, DOCX, and TXT files are supported.');
    }

    const newDocuments = [];

    for (const file of validFiles) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const content = await readFileContent(file);
        
        const doc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          category: 'general',
          uploadDate: new Date().toISOString(),
          content: content,
          wordCount: content.split(/\s+/).length,
          enabled: true,
          source: 'file'
        };
        
        newDocuments.push(doc);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }

    const updatedDocuments = [...documents, ...newDocuments];
    updateDocuments(updatedDocuments);
    setUploading(false);
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (ext === 'txt') {
          resolve(e.target.result);
        } else if (ext === 'pdf') {
          resolve(`[PDF Content] This is extracted text from ${file.name}. In a real implementation, this would use a PDF parsing library to extract actual text content from the PDF file.`);
        } else if (ext === 'doc' || ext === 'docx') {
          resolve(`[Document Content] This is extracted text from ${file.name}. In a real implementation, this would use a document parsing library to extract actual text content from the Word document.`);
        } else {
          resolve('Unsupported file format');
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const addWebpage = async () => {
    if (!webpageForm.url || !webpageForm.title) {
      alert('Please provide both URL and title for the webpage.');
      return;
    }

    setUploading(true);

    try {
      // Simulate webpage content extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const content = await extractWebpageContent(webpageForm.url);
      
      const webpage = {
        id: Date.now() + Math.random(),
        name: webpageForm.title,
        url: webpageForm.url,
        size: content.length,
        type: 'text/html',
        category: webpageForm.category,
        uploadDate: new Date().toISOString(),
        content: content,
        wordCount: content.split(/\s+/).length,
        enabled: true,
        source: 'webpage',
        description: webpageForm.description
      };

      const updatedDocuments = [...documents, webpage];
      updateDocuments(updatedDocuments);
      
      // Reset form
      setWebpageForm({
        url: '',
        title: '',
        category: 'website',
        description: ''
      });

      alert('✅ Webpage added successfully!');
    } catch (error) {
      console.error('Error adding webpage:', error);
      alert(`Error adding webpage: ${error.message}`);
    }

    setUploading(false);
  };

  const extractWebpageContent = async (url) => {
    // Simulate webpage content extraction
    // In a real implementation, this would use a web scraping service or API
    const sampleContent = `
[Webpage Content from ${url}]

This is simulated content extracted from the webpage. In a real implementation, this would:

1. Fetch the actual webpage content
2. Extract text from HTML elements
3. Remove navigation, ads, and irrelevant content
4. Clean and format the text for search

Key information that might be found:
- Product descriptions and specifications
- FAQ sections and help articles  
- Company policies and procedures
- Contact information and hours
- Service details and pricing
- Support documentation

The bot will be able to search through this content to answer customer questions about topics covered on this webpage.

Sample extracted content: "Our company offers 24/7 customer support through multiple channels including live chat, email, and phone. We specialize in providing high-quality solutions for businesses of all sizes. Our team of experts is dedicated to helping customers achieve their goals with our comprehensive suite of products and services."
`;

    return sampleContent;
  };

  const deleteDocument = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      updateDocuments(updatedDocuments);
    }
  };

  const toggleDocument = (id) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === id ? { ...doc, enabled: !doc.enabled } : doc
    );
    updateDocuments(updatedDocuments);
  };

  const updateDocumentCategory = (id, category) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === id ? { ...doc, category } : doc
    );
    updateDocuments(updatedDocuments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (doc) => {
    if (doc.source === 'webpage') return '🌐';
    const ext = doc.name.split('.').pop().toLowerCase();
    const format = supportedFormats.find(f => f.ext === ext);
    return format ? format.icon : '📄';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.url && doc.url.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 Knowledge Base</h2>
        <p className="text-gray-600">Upload documents and add webpages to build your bot's knowledge base for intelligent responses.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📁 Upload Files
          </button>
          <button
            onClick={() => setActiveTab('webpage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'webpage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🌐 Add Webpages
          </button>
        </nav>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Knowledge Documents
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-blue-600">Processing files...</span>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <p>Supported formats: PDF, DOC, DOCX, TXT</p>
              <p>Maximum file size: 10MB per file</p>
            </div>
          </div>
        </div>
      )}

      {/* Webpage Tab */}
      {activeTab === 'webpage' && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Webpage to Knowledge Base</h3>
            <p className="text-gray-600 mb-6">Add any webpage URL and the bot will extract and learn from its content.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webpage URL *
                </label>
                <input
                  type="url"
                  value={webpageForm.url}
                  onChange={(e) => setWebpageForm({ ...webpageForm, url: e.target.value })}
                  placeholder="https://example.com/support/faq"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">The URL to extract content from</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={webpageForm.title}
                  onChange={(e) => setWebpageForm({ ...webpageForm, title: e.target.value })}
                  placeholder="FAQ Page - Customer Support"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">A descriptive title for this webpage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={webpageForm.category}
                  onChange={(e) => setWebpageForm({ ...webpageForm, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={webpageForm.description}
                  onChange={(e) => setWebpageForm({ ...webpageForm, description: e.target.value })}
                  placeholder="Contains FAQ about shipping, returns, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={addWebpage}
                disabled={uploading || !webpageForm.url || !webpageForm.title}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Extracting Content...</span>
                  </div>
                ) : (
                  '🌐 Add Webpage'
                )}
              </button>
            </div>
          </div>

          {/* Quick Add Suggestions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">💡 Suggested Pages to Add:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="text-blue-700">• FAQ / Help Center pages</div>
              <div className="text-blue-700">• Product documentation</div>
              <div className="text-blue-700">• Support articles</div>
              <div className="text-blue-700">• Company policies</div>
              <div className="text-blue-700">• Pricing information</div>
              <div className="text-blue-700">• Contact & hours pages</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {documents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents and webpages..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {documents.length} items • {documents.filter(d => d.enabled).length} enabled • {documents.filter(d => d.source === 'webpage').length} webpages
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'No Content Added Yet' : 'No Matching Items'}
            </h3>
            <p className="text-gray-600">
              {documents.length === 0 
                ? 'Upload your first document or add a webpage to start building your knowledge base.'
                : 'Try adjusting your search terms or category filter.'
              }
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white border rounded-lg p-4 ${
                doc.enabled ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getFileIcon(doc)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                      {!doc.enabled && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Disabled
                        </span>
                      )}
                      {doc.source === 'webpage' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Webpage
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      {doc.source === 'webpage' ? (
                        <>
                          <span>🌐 {doc.url}</span>
                          <span>{doc.wordCount} words</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.wordCount} words</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <select
                        value={doc.category}
                        onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        categories.find(c => c.value === doc.category)?.color || 'bg-gray-100 text-gray-700'
                      }`}>
                        {categories.find(c => c.value === doc.category)?.label}
                      </span>
                    </div>

                    {doc.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {doc.description}
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <details>
                        <summary className="cursor-pointer hover:text-gray-800">
                          Content Preview
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono max-h-32 overflow-y-auto">
                          {doc.content.substring(0, 500)}
                          {doc.content.length > 500 && '...'}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => toggleDocument(doc.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      doc.enabled
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={doc.enabled ? 'Disable' : 'Enable'}
                  >
                    {doc.enabled ? '✅' : '⭕'}
                  </button>
                  {doc.source === 'webpage' && (
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visit webpage"
                    >
                      🔗
                    </button>
                  )}
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {documents.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Bulk Actions</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const updatedDocs = documents.map(doc => ({ ...doc, enabled: true }));
                updateDocuments(updatedDocs);
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => {
                const updatedDocs = documents.map(doc => ({ ...doc, enabled: false }));
                updateDocuments(updatedDocs);
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Disable All
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all items? This cannot be undone.')) {
                  updateDocuments([]);
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Knowledge Base Stats */}
      {documents.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Knowledge Base Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-700">{documents.length}</div>
              <div className="text-blue-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{documents.filter(d => d.enabled).length}</div>
              <div className="text-blue-600">Active Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{documents.filter(d => d.source === 'webpage').length}</div>
              <div className="text-blue-600">Webpages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {documents.reduce((total, doc) => total + doc.wordCount, 0).toLocaleString()}
              </div>
              <div className="text-blue-600">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {new Set(documents.map(d => d.category)).size}
              </div>
              <div className="text-blue-600">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;