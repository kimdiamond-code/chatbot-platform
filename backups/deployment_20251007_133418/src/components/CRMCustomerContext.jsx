import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Tag, Calendar, MessageSquare, Star, Filter, Search, Plus, Edit2, Trash2, Archive } from 'lucide-react';

const CRMCustomerContext = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      avatar: '👤',
      tags: ['VIP', 'Enterprise'],
      segment: 'High Value',
      lastConversation: '2 hours ago',
      totalConversations: 15,
      satisfaction: 4.8,
      notes: 'Interested in annual plan. Decision maker at TechCorp.',
      agent: 'Sarah Johnson',
      created: '2024-01-15',
      status: 'active',
      conversations: [
        { date: '2024-03-20', summary: 'Discussed pricing options', sentiment: 'positive' },
        { date: '2024-03-18', summary: 'Technical support inquiry', sentiment: 'neutral' },
        { date: '2024-03-15', summary: 'Feature request for API access', sentiment: 'positive' }
      ]
    },
    {
      id: 2,
      name: 'Emma Wilson',
      email: 'emma.w@company.com',
      phone: '+1 (555) 987-6543',
      avatar: '👩',
      tags: ['Trial', 'Marketing'],
      segment: 'Prospect',
      lastConversation: '1 day ago',
      totalConversations: 3,
      satisfaction: 4.5,
      notes: 'Testing chatbot for marketing team. Comparing with competitors.',
      agent: 'Mike Chen',
      created: '2024-03-10',
      status: 'active',
      conversations: [
        { date: '2024-03-19', summary: 'Demo request scheduled', sentiment: 'positive' },
        { date: '2024-03-17', summary: 'Questions about integrations', sentiment: 'neutral' }
      ]
    },
    {
      id: 3,
      name: 'Robert Davis',
      email: 'robert.d@startup.io',
      phone: '+1 (555) 456-7890',
      avatar: '👨',
      tags: ['Support', 'Startup'],
      segment: 'Active User',
      lastConversation: '5 hours ago',
      totalConversations: 28,
      satisfaction: 4.2,
      notes: 'Frequent support requests. Needs more training on advanced features.',
      agent: 'Lisa Park',
      created: '2024-02-01',
      status: 'active',
      conversations: [
        { date: '2024-03-20', summary: 'Bug report submitted', sentiment: 'negative' },
        { date: '2024-03-19', summary: 'Training session completed', sentiment: 'positive' },
        { date: '2024-03-18', summary: 'Account upgrade completed', sentiment: 'positive' }
      ]
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  const segments = ['all', 'High Value', 'Active User', 'Prospect', 'At Risk', 'Churned'];
  const availableTags = ['VIP', 'Enterprise', 'Trial', 'Support', 'Marketing', 'Sales', 'Technical', 'Startup'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const addNote = () => {
    if (newNote && selectedCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, notes: c.notes + '\n' + new Date().toLocaleDateString() + ': ' + newNote }
          : c
      ));
      setNewNote('');
    }
  };

  const addTag = () => {
    if (newTag && selectedCustomer && !selectedCustomer.tags.includes(newTag)) {
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, tags: [...c.tags, newTag] }
          : c
      ));
      setNewTag('');
    }
  };

  const removeTag = (customerId, tagToRemove) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, tags: c.tags.filter(tag => tag !== tagToRemove) }
        : c
    ));
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM & Customer Context</h1>
        <p className="text-gray-600">Manage customer relationships and conversation history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Customers</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Avg Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">4.5</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Conversations</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">46</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Active Segments</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">5</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <div className="glass-premium p-4 rounded-xl">
            {/* Search and Filter */}
            <div className="mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {segments.map(segment => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer Cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCustomer?.id === customer.id 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{customer.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600 truncate">{customer.email}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Last: {customer.lastConversation}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{customer.segment}</span>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {customer.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {customer.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <div className="glass-premium p-6 rounded-xl">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedCustomer.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {selectedCustomer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {selectedCustomer.segment}
                      </span>
                      <span className="text-sm text-gray-600">
                        Assigned to: <span className="font-medium">{selectedCustomer.agent}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Archive className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-dynamic p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedCustomer.totalConversations}</div>
                  <div className="text-sm text-gray-600">Total Conversations</div>
                </div>
                <div className="glass-dynamic p-4 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{selectedCustomer.satisfaction}</span>
                  </div>
                  <div className="text-sm text-gray-600">Satisfaction Score</div>
                </div>
                <div className="glass-dynamic p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedCustomer.created}</div>
                  <div className="text-sm text-gray-600">Customer Since</div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(selectedCustomer.id, tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="">Add tag...</option>
                      {availableTags.filter(t => !selectedCustomer.tags.includes(t)).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    {newTag && (
                      <button 
                        onClick={addTag}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Internal Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Conversation History */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recent Conversations</h3>
                <div className="space-y-3">
                  {selectedCustomer.conversations.map((conv, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{conv.date}</span>
                          <span className={`text-xs ${getSentimentColor(conv.sentiment)}`}>
                            {conv.sentiment === 'positive' ? '😊' : conv.sentiment === 'negative' ? '😟' : '😐'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{conv.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-premium p-6 rounded-xl h-full flex items-center justify-center min-h-[600px]">
              <div className="text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a customer to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMCustomerContext;