import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const FileText = () => <span className="text-xl">📋</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Save = () => <span className="text-xl">💾</span>;
const Download = () => <span className="text-xl">⬇️</span>;
const Edit = () => <span className="text-xl">✏️</span>;
const Eye = () => <span className="text-xl">👁️</span>;
const Table = () => <span className="text-xl">📊</span>;
const Info = () => <span className="text-xl">ℹ️</span>;
const Lightbulb = () => <span className="text-xl">💡</span>;
const CheckCircle = () => <span className="text-xl">✅</span>;
const Template = () => <span className="text-xl">📑</span>;
const Sparkles = () => <span className="text-xl">✨</span>;

// Pre-built Form Templates
const FORM_TEMPLATES = [
  {
    id: 'contact',
    name: 'Contact Form',
    icon: '📧',
    description: 'Collect name, email, and message from visitors',
    category: 'Lead Generation',
    fields: [
      { label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
      { label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
      { label: 'Phone Number', type: 'phone', required: false, placeholder: '(555) 123-4567' },
      { label: 'Subject', type: 'text', required: true, placeholder: 'How can we help?' },
      { label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us more...' }
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback Survey',
    icon: '⭐',
    description: 'Gather customer satisfaction and improvement suggestions',
    category: 'Customer Experience',
    fields: [
      { label: 'Overall Rating', type: 'radio', required: true, options: ['😞 Poor', '😐 Fair', '😊 Good', '😄 Great', '🤩 Excellent'] },
      { label: 'What did you like most?', type: 'textarea', required: false, placeholder: 'Tell us what you loved...' },
      { label: 'What could we improve?', type: 'textarea', required: false, placeholder: 'How can we do better?' },
      { label: 'Would you recommend us?', type: 'radio', required: true, options: ['Yes', 'No', 'Maybe'] },
      { label: 'Email (optional for follow-up)', type: 'email', required: false, placeholder: 'your@email.com' }
    ]
  },
  {
    id: 'quote',
    name: 'Quote Request',
    icon: '💼',
    description: 'Collect project details and budget from leads',
    category: 'Sales',
    fields: [
      { label: 'Company Name', type: 'text', required: true, placeholder: 'Your company' },
      { label: 'Contact Name', type: 'text', required: true, placeholder: 'Your name' },
      { label: 'Email', type: 'email', required: true, placeholder: 'business@email.com' },
      { label: 'Phone', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { label: 'Project Type', type: 'select', required: true, options: ['Website Development', 'Mobile App', 'E-commerce', 'Consulting', 'Other'] },
      { label: 'Budget Range', type: 'select', required: true, options: ['Under $5k', '$5k - $15k', '$15k - $50k', '$50k+'] },
      { label: 'Timeline', type: 'select', required: true, options: ['ASAP', '1-3 months', '3-6 months', '6+ months'] },
      { label: 'Project Description', type: 'textarea', required: true, placeholder: 'Describe your project needs...' }
    ]
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    icon: '📰',
    description: 'Simple email capture for marketing campaigns',
    category: 'Marketing',
    fields: [
      { label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
      { label: 'First Name', type: 'text', required: false, placeholder: 'Your first name' },
      { label: 'Interests', type: 'checkbox', required: false, options: ['Product Updates', 'Special Offers', 'Company News', 'Events'] },
      { label: 'Hear about us from?', type: 'select', required: false, options: ['Google', 'Social Media', 'Friend', 'Advertisement', 'Other'] }
    ]
  },
  {
    id: 'support',
    name: 'Support Ticket',
    icon: '🎫',
    description: 'Collect issue details and urgency level',
    category: 'Customer Support',
    fields: [
      { label: 'Your Name', type: 'text', required: true, placeholder: 'Full name' },
      { label: 'Email', type: 'email', required: true, placeholder: 'contact@email.com' },
      { label: 'Order Number (if applicable)', type: 'text', required: false, placeholder: '#12345' },
      { label: 'Issue Type', type: 'select', required: true, options: ['Order Problem', 'Technical Issue', 'Account Question', 'Product Question', 'Other'] },
      { label: 'Priority', type: 'radio', required: true, options: ['Low', 'Medium', 'High', 'Urgent'] },
      { label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the issue in detail...' }
    ]
  },
  {
    id: 'product-inquiry',
    name: 'Product Inquiry',
    icon: '🛍️',
    description: 'Capture interest in specific products',
    category: 'E-commerce',
    fields: [
      { label: 'Product Name/SKU', type: 'text', required: true, placeholder: 'Which product?' },
      { label: 'Your Name', type: 'text', required: true, placeholder: 'Full name' },
      { label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
      { label: 'Phone', type: 'phone', required: false, placeholder: '(555) 123-4567' },
      { label: 'Question Type', type: 'select', required: true, options: ['Availability', 'Pricing', 'Specifications', 'Shipping', 'Bulk Order', 'Other'] },
      { label: 'Your Question', type: 'textarea', required: true, placeholder: 'What would you like to know?' }
    ]
  },
  {
    id: 'return-request',
    name: 'Return Request',
    icon: '↩️',
    description: 'Process return and refund requests',
    category: 'E-commerce',
    fields: [
      { label: 'Order Number', type: 'text', required: true, placeholder: '#12345' },
      { label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' },
      { label: 'Item(s) to Return', type: 'textarea', required: true, placeholder: 'List items you want to return' },
      { label: 'Reason for Return', type: 'select', required: true, options: ['Wrong size', 'Defective', 'Changed mind', 'Wrong item received', 'Not as described', 'Other'] },
      { label: 'Preferred Resolution', type: 'radio', required: true, options: ['Refund', 'Exchange', 'Store Credit'] },
      { label: 'Additional Details', type: 'textarea', required: false, placeholder: 'Any other information?' }
    ]
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    icon: '🎟️',
    description: 'Register attendees for events or webinars',
    category: 'Events',
    fields: [
      { label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
      { label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
      { label: 'Company', type: 'text', required: false, placeholder: 'Company name' },
      { label: 'Job Title', type: 'text', required: false, placeholder: 'Your role' },
      { label: 'Number of Attendees', type: 'number', required: true, placeholder: '1' },
      { label: 'Dietary Restrictions', type: 'text', required: false, placeholder: 'Any allergies or preferences?' },
      { label: 'Special Requests', type: 'textarea', required: false, placeholder: 'Anything we should know?' }
    ]
  }
];

const CustomForms = () => {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeView, setActiveView] = useState('forms'); // 'forms', 'submissions', 'templates'
  const [selectedForm, setSelectedForm] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const [formBuilder, setFormBuilder] = useState({
    name: '',
    description: '',
    fields: []
  });

  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: []
  });

  useEffect(() => {
    loadForms();
    loadSubmissions();
  }, []);

  const loadForms = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        //  FIX: Handle settings that are already objects OR strings
        let settings;
        if (typeof dbConfig.settings === 'string') {
          settings = JSON.parse(dbConfig.settings || '{}');
        } else if (typeof dbConfig.settings === 'object' && dbConfig.settings !== null) {
          settings = dbConfig.settings;
        } else {
          settings = {};
        }
        setForms(settings.customForms || []);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        //  FIX: Handle settings that are already objects OR strings
        let settings;
        if (typeof dbConfig.settings === 'string') {
          settings = JSON.parse(dbConfig.settings || '{}');
        } else if (typeof dbConfig.settings === 'object' && dbConfig.settings !== null) {
          settings = dbConfig.settings;
        } else {
          settings = {};
        }
        setSubmissions(settings.formSubmissions || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const saveForms = async () => {
    setSaveStatus('saving');
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        //  FIX: Handle settings that are already objects OR strings
        let settings;
        if (typeof dbConfig.settings === 'string') {
          settings = JSON.parse(dbConfig.settings || '{}');
        } else if (typeof dbConfig.settings === 'object' && dbConfig.settings !== null) {
          settings = dbConfig.settings;
        } else {
          settings = {};
        }
        settings.customForms = forms;
        settings.formSubmissions = submissions;
        
        await dbService.saveBotConfig({
          ...dbConfig,
          settings: JSON.stringify(settings)
        });
        
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error saving forms:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const createNewForm = () => {
    setIsCreating(true);
    setActiveView('forms');
    setFormBuilder({
      name: '',
      description: '',
      fields: []
    });
    setSelectedForm(null);
  };

  const useTemplate = (template) => {
    setIsCreating(true);
    setActiveView('forms');
    setFormBuilder({
      name: template.name,
      description: template.description,
      fields: template.fields.map((field, index) => ({
        id: Date.now() + index,
        ...field
      }))
    });
    setSelectedForm(null);
  };

  const saveForm = () => {
    if (!formBuilder.name.trim()) {
      alert('Please enter a form name');
      return;
    }

    if (formBuilder.fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    const newForm = {
      id: Date.now(),
      ...formBuilder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedForm) {
      setForms(forms.map(f => f.id === selectedForm.id ? newForm : f));
    } else {
      setForms([...forms, newForm]);
    }

    setIsCreating(false);
    setSelectedForm(null);
    saveForms();
  };

  const editForm = (form) => {
    setFormBuilder(form);
    setSelectedForm(form);
    setIsCreating(true);
  };

  const deleteForm = (id) => {
    if (confirm('Are you sure you want to delete this form?')) {
      setForms(forms.filter(f => f.id !== id));
      saveForms();
    }
  };

  const addField = () => {
    if (!newField.label.trim()) {
      alert('Please enter a field label');
      return;
    }

    const field = {
      id: Date.now(),
      ...newField
    };

    setFormBuilder({
      ...formBuilder,
      fields: [...formBuilder.fields, field]
    });

    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    });
  };

  const removeField = (fieldId) => {
    setFormBuilder({
      ...formBuilder,
      fields: formBuilder.fields.filter(f => f.id !== fieldId)
    });
  };

  const exportToCSV = (formId) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    const formSubmissions = submissions.filter(s => s.formId === formId);
    if (formSubmissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    // Create CSV headers
    const headers = ['Submission Date', ...form.fields.map(f => f.label)];
    
    // Create CSV rows
    const rows = formSubmissions.map(sub => [
      new Date(sub.submittedAt).toLocaleString(),
      ...form.fields.map(f => {
        const value = sub.data[f.id];
        return typeof value === 'object' ? JSON.stringify(value) : value || '';
      })
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/\s+/g, '_')}_submissions_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText /> Forms
            </h1>
            <p className="text-lg text-gray-700 mt-2 font-medium">Collect information from customers during conversations</p>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Forms let your bot gather specific information from customers (like email, phone, feedback) in a structured way. The bot asks the questions, collects the answers, and saves them for you to review.
            </p>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <Info /> {showHelp ? 'Hide' : 'Show'} Examples & Tips
            </button>
          </div>
          
          <div className="flex gap-3 ml-4">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveView('forms')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'forms'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText /> Forms ({forms.length})
            </button>
            <button
              onClick={() => setActiveView('templates')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                activeView === 'templates'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles /> Templates
            </button>
            <button
              onClick={() => setActiveView('submissions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'submissions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table /> Submissions ({submissions.length})
            </button>
          </div>
          
          {activeView === 'forms' && !isCreating && (
            <button
              onClick={createNewForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus /> New Form
            </button>
          )}
          
          {forms.length > 0 && (
            <button
              onClick={saveForms}
              disabled={saveStatus === 'saving'}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                saveStatus === 'saved' ? 'bg-green-600 text-white' :
                saveStatus === 'error' ? 'bg-red-600 text-white' :
                saveStatus === 'saving' ? 'bg-blue-400 text-white cursor-not-allowed' :
                'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              <Save />
              {saveStatus === 'saved' ? 'Saved!' : 
               saveStatus === 'error' ? 'Error' :
               saveStatus === 'saving' ? 'Saving...' : 'Save All'}
            </button>
          )}
          </div>
        </div>
        
        {/* Help Section */}
        {showHelp && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                  <Lightbulb /> Common Use Cases
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Contact Form:</strong> Collect name, email, and message from potential customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Feedback Survey:</strong> Ask customers to rate their experience and provide comments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Quote Request:</strong> Gather project details, budget, and contact info from leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Support Ticket:</strong> Collect issue details, urgency level, and customer info</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-green-900 flex items-center gap-2 mb-3">
                  <FileText /> How It Works
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li><strong>Create your form:</strong> Add a name and the fields you want to collect</li>
                  <li><strong>Choose field types:</strong> Text, email, phone, dropdowns, checkboxes, etc.</li>
                  <li><strong>Mark required fields:</strong> Make sure you get critical information</li>
                  <li><strong>Use in conversations:</strong> Bot will ask each question and wait for answers</li>
                  <li><strong>Review submissions:</strong> See all responses in the Submissions tab</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-xs text-green-800 italic">
                    💡 Tip: Keep forms short (3-5 fields) for better completion rates. Try our templates for quick setup!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Templates View */}
      {activeView === 'templates' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles />
              <h2 className="text-2xl font-bold text-gray-900">Form Templates</h2>
            </div>
            <p className="text-gray-700">
              Start with a ready-made template and customize it to your needs. Click "Use Template" to get started instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORM_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-purple-600 font-medium mt-1">{template.category}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Fields included:</span>
                    <span className="text-gray-600">{template.fields.length}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.fields.slice(0, 3).map(f => f.label).join(', ')}
                    {template.fields.length > 3 && '...'}
                  </div>
                </div>
                
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus /> Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'forms' && (
        <>
          {/* Form Builder */}
          {isCreating ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedForm ? 'Edit Form' : 'Create New Form'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedForm(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
              
              {/* Instructional Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>📋 Quick Start:</strong> Name your form, then add the fields (questions) you want to ask customers. Each field is one piece of information you'll collect.
                </p>
              </div>
              
              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    1. What is this form called? *
                  </label>
                  <input
                    type="text"
                    value={formBuilder.name}
                    onChange={(e) => setFormBuilder({ ...formBuilder, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="e.g., Contact Form, Feedback Survey, Quote Request"
                  />
                  <p className="text-xs text-gray-500 mt-1">Give it a name you'll recognize later</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    2. What's it for? (optional)
                  </label>
                  <textarea
                    value={formBuilder.description}
                    onChange={(e) => setFormBuilder({ ...formBuilder, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Collect customer contact info and inquiry details"
                  />
                </div>
              </div>

              {/* Existing Fields */}
              {formBuilder.fields.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">3. Your Form Fields</h3>
                  <p className="text-sm text-gray-600 mb-3">These are the questions your bot will ask customers</p>
                  <div className="space-y-3">
                    {formBuilder.fields.map((field, index) => (
                      <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                                Field {index + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{field.label}</span>
                              {field.required && (
                                <span className="text-xs text-red-600">*Required</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Type: <span className="capitalize">{field.type}</span>
                              {field.placeholder && ` • Placeholder: "${field.placeholder}"`}
                            </div>
                            {field.options && field.options.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Options: {field.options.join(', ')}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Field */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300 mb-6">
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Plus /> Add Field #{formBuilder.fields.length + 1}
                </h4>
                <p className="text-xs text-gray-600 mb-4">Each field is one question the bot will ask</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      What information do you want? *
                    </label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Full Name, Email Address, Phone Number, Message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      What type of answer?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'text', icon: '📝', label: 'Short Text' },
                        { value: 'email', icon: '📧', label: 'Email' },
                        { value: 'phone', icon: '📞', label: 'Phone' },
                        { value: 'number', icon: '🔢', label: 'Number' },
                        { value: 'date', icon: '📅', label: 'Date' },
                        { value: 'textarea', icon: '📝', label: 'Long Text' },
                        { value: 'select', icon: '🔽', label: 'Dropdown' },
                        { value: 'radio', icon: '◉', label: 'Choice' },
                        { value: 'checkbox', icon: '☑️', label: 'Checkboxes' },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewField({ ...newField, type: type.value })}
                          className={`px-3 py-2 rounded-lg border-2 text-left transition-all ${
                            newField.type === type.value
                              ? 'border-green-500 bg-green-100 text-green-900 shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-lg">{type.icon}</div>
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Placeholder text (optional)
                    </label>
                    <input
                      type="text"
                      value={newField.placeholder}
                      onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Enter your full name..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Helpful hint shown in the field</p>
                  </div>

                  {['select', 'radio', 'checkbox'].includes(newField.type) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        What are the options?
                      </label>
                      <input
                        type="text"
                        value={newField.options.join(', ')}
                        onChange={(e) => setNewField({ 
                          ...newField, 
                          options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Small, Medium, Large (separate with commas)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Type each option separated by commas</p>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer bg-white rounded-lg p-3 border border-gray-300 hover:border-green-400">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      className="rounded w-5 h-5"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Required field</div>
                      <div className="text-xs text-gray-500">Customer must answer this question</div>
                    </div>
                  </label>

                  <button
                    onClick={addField}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus /> Add This Field to Form
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
                <button
                  onClick={saveForm}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save /> {selectedForm ? 'Save Changes' : 'Create Form'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedForm(null);
                  }}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Forms List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => {
                const formSubs = submissions.filter(s => s.formId === form.id);
                return (
                  <div
                    key={form.id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{form.name}</h3>
                      <p className="text-sm text-gray-600">{form.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Fields:</span>
                        <span className="text-gray-600">{form.fields.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">Submissions:</span>
                        <span className="text-gray-600">{formSubs.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editForm(form)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                      >
                        <Edit /> Edit
                      </button>
                      {formSubs.length > 0 && (
                        <button
                          onClick={() => exportToCSV(form.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          title="Export to CSV"
                        >
                          <Download />
                        </button>
                      )}
                      <button
                        onClick={() => deleteForm(form.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        title="Delete"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                );
              })}

              {forms.length === 0 && !isCreating && (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Ready to Collect Information?
                  </h3>
                  <p className="text-gray-600 mb-3 max-w-md mx-auto">
                    Forms help you gather specific information from customers in an organized way.
                  </p>
                  <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
                    For example: A contact form can collect name, email, and message. Your bot asks each question, and all responses are saved here.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={createNewForm}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 inline-flex items-center gap-2 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus /> Create from Scratch
                    </button>
                    <button
                      onClick={() => setActiveView('templates')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 inline-flex items-center gap-2 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Sparkles /> Browse Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === 'submissions' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Form Submissions</h2>
            {submissions.length > 0 && (
              <div className="text-sm text-gray-600">
                Total: {submissions.length} submissions
              </div>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Table />
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Form submissions will appear here once customers start filling them out
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => {
                const formSubs = submissions.filter(s => s.formId === form.id);
                if (formSubs.length === 0) return null;

                return (
                  <div key={form.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                      <button
                        onClick={() => exportToCSV(form.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                      >
                        <Download /> Export CSV
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-2 text-gray-700">Date</th>
                            {form.fields.map(field => (
                              <th key={field.id} className="text-left p-2 text-gray-700">
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formSubs.map((sub) => (
                            <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-2 text-gray-600">
                                {new Date(sub.submittedAt).toLocaleDateString()}
                              </td>
                              {form.fields.map(field => (
                                <td key={field.id} className="p-2 text-gray-900">
                                  {sub.data[field.id] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomForms;
