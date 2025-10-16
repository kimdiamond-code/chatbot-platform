import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const FileText = () => <span className="text-xl">📝</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Save = () => <span className="text-xl">💾</span>;
const Download = () => <span className="text-xl">⬇️</span>;
const Edit = () => <span className="text-xl">✏️</span>;
const Eye = () => <span className="text-xl">👁️</span>;
const Table = () => <span className="text-xl">📊</span>;

const CustomForms = () => {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeView, setActiveView] = useState('forms'); // 'forms' or 'submissions'
  const [selectedForm, setSelectedForm] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

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
        const settings = JSON.parse(dbConfig.settings || '{}');
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
        const settings = JSON.parse(dbConfig.settings || '{}');
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
        const settings = JSON.parse(dbConfig.settings || '{}');
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
    setFormBuilder({
      name: '',
      description: '',
      fields: []
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText /> Custom Forms
          </h1>
          <p className="text-gray-600 mt-1">Create forms to collect data from customers</p>
        </div>
        
        <div className="flex gap-3">
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

      {activeView === 'forms' && (
        <>
          {/* Form Builder */}
          {isCreating ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {selectedForm ? 'Edit Form' : 'Create New Form'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    value={formBuilder.name}
                    onChange={(e) => setFormBuilder({ ...formBuilder, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Contact Form, Feedback Survey, Registration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formBuilder.description}
                    onChange={(e) => setFormBuilder({ ...formBuilder, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this form is for..."
                  />
                </div>
              </div>

              {/* Existing Fields */}
              {formBuilder.fields.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Form Fields</h3>
                  <div className="space-y-2">
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
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Add New Field</h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        value={newField.label}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Full Name, Email Address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type
                      </label>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={newField.placeholder}
                      onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter placeholder text..."
                    />
                  </div>

                  {['select', 'radio', 'checkbox'].includes(newField.type) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newField.options.join(', ')}
                        onChange={(e) => setNewField({ 
                          ...newField, 
                          options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Required field</span>
                  </label>

                  <button
                    onClick={addField}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Plus /> Add Field
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={saveForm}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  {selectedForm ? 'Update Form' : 'Create Form'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedForm(null);
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
                <div className="col-span-full text-center py-12">
                  <FileText />
                  <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                    No Forms Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first form to start collecting data from customers
                  </p>
                  <button
                    onClick={createNewForm}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <Plus /> Create First Form
                  </button>
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
