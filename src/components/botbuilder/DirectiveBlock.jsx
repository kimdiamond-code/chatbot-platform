import React, { useState } from 'react';

const DirectiveBlock = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data);
  const [newConstraint, setNewConstraint] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      const updatedConstraints = [...formData.constraints, newConstraint.trim()];
      const updatedData = { ...formData, constraints: updatedConstraints };
      setFormData(updatedData);
      onUpdate(updatedData);
      setNewConstraint('');
    }
  };

  const removeConstraint = (index) => {
    const updatedConstraints = formData.constraints.filter((_, i) => i !== index);
    const updatedData = { ...formData, constraints: updatedConstraints };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...formData.goals, newGoal.trim()];
      const updatedData = { ...formData, goals: updatedGoals };
      setFormData(updatedData);
      onUpdate(updatedData);
      setNewGoal('');
    }
  };

  const removeGoal = (index) => {
    const updatedGoals = formData.goals.filter((_, i) => i !== index);
    const updatedData = { ...formData, goals: updatedGoals };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const toneOptions = [
    { value: 'friendly', label: 'Friendly & Approachable', desc: 'Warm, welcoming, and personable' },
    { value: 'professional', label: 'Professional & Formal', desc: 'Business-like, courteous, and respectful' },
    { value: 'casual', label: 'Casual & Conversational', desc: 'Relaxed, informal, and easy-going' },
    { value: 'helpful', label: 'Helpful & Supportive', desc: 'Eager to assist and problem-solve' },
    { value: 'authoritative', label: 'Authoritative & Expert', desc: 'Knowledgeable, confident, and reliable' },
    { value: 'empathetic', label: 'Empathetic & Understanding', desc: 'Compassionate and emotionally aware' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Bot Directive Configuration</h2>
        <p className="text-gray-600">Define your bot's primary purpose, behavior, and operating principles.</p>
      </div>

      <div className="space-y-8">
        {/* Primary Directive */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Primary Directive</h3>
          <p className="text-blue-700 mb-4 text-sm">
            This is the core instruction that defines your bot's role and primary function. Be clear and specific.
          </p>
          <textarea
            value={formData.primaryDirective}
            onChange={(e) => handleInputChange('primaryDirective', e.target.value)}
            placeholder="e.g., You are a customer support assistant for TechCorp. Your primary role is to help customers resolve technical issues, answer product questions, and provide helpful guidance in a friendly and professional manner."
            className="w-full h-32 p-4 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-2 text-sm text-blue-600">
            Characters: {formData.primaryDirective.length}/500
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Tone of Voice</h3>
          <p className="text-green-700 mb-4 text-sm">
            Select the communication style that best represents your brand and target audience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toneOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  formData.toneOfVoice === option.value
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <input
                  type="radio"
                  name="toneOfVoice"
                  value={option.value}
                  checked={formData.toneOfVoice === option.value}
                  onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
                  className="sr-only"
                />
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Constraints & Limitations */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Constraints & Limitations</h3>
          <p className="text-red-700 mb-4 text-sm">
            Define what your bot should NOT do or discuss. These help maintain appropriate boundaries.
          </p>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              placeholder="e.g., Do not provide medical advice, financial advice, etc."
              className="flex-1 p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              onKeyPress={(e) => e.key === 'Enter' && addConstraint()}
            />
            <button
              onClick={addConstraint}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.constraints.length > 0 && (
            <div className="space-y-2">
              {formData.constraints.map((constraint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-red-200 rounded-lg p-3"
                >
                  <span className="text-gray-800">{constraint}</span>
                  <button
                    onClick={() => removeConstraint(index)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals & Objectives */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Goals & Objectives</h3>
          <p className="text-purple-700 mb-4 text-sm">
            Define what success looks like for your bot. What should it accomplish?
          </p>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., Resolve 80% of customer inquiries without human intervention"
              className="flex-1 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <button
              onClick={addGoal}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.goals.length > 0 && (
            <div className="space-y-2">
              {formData.goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-3"
                >
                  <span className="text-gray-800">{goal}</span>
                  <button
                    onClick={() => removeGoal(index)}
                    className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Directive Preview</h3>
          <div className="bg-white border rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {`Primary Role: ${formData.primaryDirective || 'Not defined'}

Tone: ${toneOptions.find(t => t.value === formData.toneOfVoice)?.label || 'Not selected'}

Constraints:
${formData.constraints.length > 0 ? formData.constraints.map(c => `• ${c}`).join('\n') : '• None defined'}

Goals:
${formData.goals.length > 0 ? formData.goals.map(g => `• ${g}`).join('\n') : '• None defined'}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectiveBlock;