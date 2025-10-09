import React, { useState } from 'react';

const QADatabase = ({ data, onUpdate }) => {
  const [qaEntries, setQaEntries] = useState(data || []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: 'general',
    enabled: true
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'support', label: 'Support' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' },
    { value: 'sales', label: 'Sales' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'account', label: 'Account' }
  ];

  const updateEntries = (entries) => {
    setQaEntries(entries);
    onUpdate(entries);
  };

  const addEntry = () => {
    if (newEntry.question.trim() && newEntry.answer.trim()) {
      const entry = {
        ...newEntry,
        keywords: newEntry.keywords.split(',').map(k => k.trim()).filter(k => k),
        id: Date.now()
      };
      const updatedEntries = [...qaEntries, entry];
      updateEntries(updatedEntries);
      setNewEntry({
        question: '',
        answer: '',
        keywords: '',
        category: 'general',
        enabled: true
      });
      setIsAddingNew(false);
    }
  };

  const updateEntry = (index, updatedEntry) => {
    const entries = [...qaEntries];
    entries[index] = {
      ...updatedEntry,
      keywords: typeof updatedEntry.keywords === 'string' 
        ? updatedEntry.keywords.split(',').map(k => k.trim()).filter(k => k)
        : updatedEntry.keywords
    };
    updateEntries(entries);
    setEditingIndex(null);
  };

  const deleteEntry = (index) => {
    if (confirm('Are you sure you want to delete this Q&A entry?')) {
      const entries = qaEntries.filter((_, i) => i !== index);
      updateEntries(entries);
    }
  };

  const toggleEntry = (index) => {
    const entries = [...qaEntries];
    entries[index].enabled = !entries[index].enabled;
    updateEntries(entries);
  };

  const duplicateEntry = (index) => {
    const entry = { ...qaEntries[index] };
    entry.question = `${entry.question} (Copy)`;
    entry.id = Date.now();
    const updatedEntries = [...qaEntries, entry];
    updateEntries(updatedEntries);
  };

  const filteredEntries = qaEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const EntryEditor = ({ entry, onSave, onCancel, isNew = false }) => {
    const [formData, setFormData] = useState(entry);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="What is your return policy?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Our return policy allows returns within 30 days of purchase..."
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(formData.keywords) ? formData.keywords.join(', ') : formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="return, refund, exchange, policy"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enabled (bot can use this Q&A)</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.question.trim() || !formData.answer.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isNew ? 'Add Q&A' : 'Save Changes'}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">❓ Q&A Database</h2>
        <p className="text-gray-600">Build a comprehensive question and answer database for your bot.</p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Q&A entries..."
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

          <button
            onClick={() => setIsAddingNew(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add New Q&A
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-6 text-sm text-gray-600">
            <span>Total Entries: <strong>{qaEntries.length}</strong></span>
            <span>Enabled: <strong>{qaEntries.filter(q => q.enabled).length}</strong></span>
            <span>Categories: <strong>{new Set(qaEntries.map(q => q.category)).size}</strong></span>
            {searchTerm && <span>Filtered: <strong>{filteredEntries.length}</strong></span>}
          </div>
        </div>
      </div>

      {/* Add New Entry Form */}
      {isAddingNew && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Q&A Entry</h3>
          <EntryEditor
            entry={newEntry}
            onSave={(entry) => {
              addEntry();
            }}
            onCancel={() => setIsAddingNew(false)}
            isNew={true}
          />
        </div>
      )}

      {/* Q&A Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {qaEntries.length === 0 ? 'No Q&A Entries Yet' : 'No Matching Entries'}
            </h3>
            <p className="text-gray-600 mb-4">
              {qaEntries.length === 0 
                ? 'Get started by adding your first question and answer pair.'
                : 'Try adjusting your search terms or category filter.'
              }
            </p>
            {qaEntries.length === 0 && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Q&A
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const actualIndex = qaEntries.findIndex(q => q.id === entry.id);
            
            if (editingIndex === actualIndex) {
              return (
                <div key={entry.id}>
                  <EntryEditor
                    entry={{
                      ...entry,
                      keywords: entry.keywords.join(', ')
                    }}
                    onSave={(updatedEntry) => updateEntry(actualIndex, updatedEntry)}
                    onCancel={() => setEditingIndex(null)}
                  />
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className={`bg-white border rounded-lg p-4 ${
                  entry.enabled ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.enabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {categories.find(c => c.value === entry.category)?.label}
                      </span>
                      {!entry.enabled && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{entry.question}</h4>
                    <p className="text-gray-700 text-sm mb-3">{entry.answer}</p>
                    
                    {entry.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => toggleEntry(actualIndex)}
                      className={`p-2 rounded-lg transition-colors ${
                        entry.enabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={entry.enabled ? 'Disable' : 'Enable'}
                    >
                      {entry.enabled ? '✅' : '⭕'}
                    </button>
                    <button
                      onClick={() => setEditingIndex(actualIndex)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => duplicateEntry(actualIndex)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => deleteEntry(actualIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk Actions */}
      {qaEntries.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Bulk Actions</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const entries = qaEntries.map(entry => ({ ...entry, enabled: true }));
                updateEntries(entries);
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => {
                const entries = qaEntries.map(entry => ({ ...entry, enabled: false }));
                updateEntries(entries);
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Disable All
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all Q&A entries? This cannot be undone.')) {
                  updateEntries([]);
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QADatabase;