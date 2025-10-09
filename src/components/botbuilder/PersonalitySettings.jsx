import React, { useState } from 'react';

const PersonalitySettings = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data);
  const [newTrait, setNewTrait] = useState('');

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      const updatedTraits = [...formData.traits, newTrait.trim()];
      const updatedData = { ...formData, traits: updatedTraits };
      setFormData(updatedData);
      onUpdate(updatedData);
      setNewTrait('');
    }
  };

  const removeTrait = (index) => {
    const updatedTraits = formData.traits.filter((_, i) => i !== index);
    const updatedData = { ...formData, traits: updatedTraits };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const avatarOptions = [
    { value: 'robot', icon: '🤖', label: 'Robot' },
    { value: 'assistant', icon: '👨‍💼', label: 'Assistant' },
    { value: 'support', icon: '👩‍💻', label: 'Support Agent' },
    { value: 'friendly', icon: '😊', label: 'Friendly Face' },
    { value: 'professional', icon: '🎯', label: 'Professional' },
    { value: 'tech', icon: '⚡', label: 'Tech Expert' },
    { value: 'helper', icon: '🙋‍♀️', label: 'Helper' },
    { value: 'mascot', icon: '🦄', label: 'Mascot' }
  ];

  const commonTraits = [
    'Helpful', 'Patient', 'Knowledgeable', 'Friendly', 'Professional',
    'Empathetic', 'Efficient', 'Resourceful', 'Reliable', 'Enthusiastic',
    'Clear Communicator', 'Problem Solver', 'Detail-oriented', 'Supportive'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">👤 Personality Settings</h2>
        <p className="text-gray-600">Give your bot a unique personality and character that represents your brand.</p>
      </div>

      <div className="space-y-8">
        {/* Bot Identity */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Bot Identity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Bot Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Alex, ChatBot Helper, TechSupport Bot"
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-blue-600 mt-1">This name will appear in conversations</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Avatar/Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {avatarOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('avatar', option.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.avatar === option.value
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs text-gray-600">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar Preview */}
          {formData.avatar && (
            <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {avatarOptions.find(a => a.value === formData.avatar)?.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formData.name || 'Bot Name'}</div>
                  <div className="text-sm text-gray-500">Preview how your bot will appear</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personality Traits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Personality Traits</h3>
          <p className="text-green-700 mb-4 text-sm">
            Add traits that describe your bot's personality. These will influence how it communicates.
          </p>

          {/* Quick Add Common Traits */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-green-800 mb-2">
              Quick Add Common Traits:
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => {
                    if (!formData.traits.includes(trait)) {
                      const updatedTraits = [...formData.traits, trait];
                      const updatedData = { ...formData, traits: updatedTraits };
                      setFormData(updatedData);
                      onUpdate(updatedData);
                    }
                  }}
                  disabled={formData.traits.includes(trait)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.traits.includes(trait)
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-green-700 border-green-300 hover:bg-green-100'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Trait Input */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              placeholder="Add custom personality trait..."
              className="flex-1 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyPress={(e) => e.key === 'Enter' && addTrait()}
            />
            <button
              onClick={addTrait}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Current Traits */}
          {formData.traits.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-800">
                Current Traits ({formData.traits.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.traits.map((trait, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white border border-green-300 rounded-full px-3 py-1"
                  >
                    <span className="text-sm text-gray-800">{trait}</span>
                    <button
                      onClick={() => removeTrait(index)}
                      className="text-green-600 hover:text-green-800 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages Configuration */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Message Configuration</h3>
          
          <div className="space-y-6">
            {/* Greeting Message */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                Greeting Message *
              </label>
              <textarea
                value={formData.greetingMessage}
                onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                placeholder="e.g., Hi there! I'm Alex, your friendly customer support assistant. How can I help you today?"
                className="w-full h-24 p-3 border border-purple-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-purple-600 mt-1">This message will be shown when users first interact with your bot</p>
            </div>

            {/* Fallback Message */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                Fallback Message *
              </label>
              <textarea
                value={formData.fallbackMessage}
                onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
                placeholder="e.g., I'm sorry, I didn't quite understand that. Could you please rephrase your question or try asking something else?"
                className="w-full h-24 p-3 border border-purple-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-purple-600 mt-1">This message will be shown when the bot doesn't understand a user's input</p>
            </div>
          </div>
        </div>

        {/* Personality Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personality Preview</h3>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="text-2xl">
                {formData.avatar ? avatarOptions.find(a => a.value === formData.avatar)?.icon : '🤖'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{formData.name || 'Bot Name'}</div>
                <div className="text-sm text-gray-500 mb-2">
                  Traits: {formData.traits.length > 0 ? formData.traits.join(', ') : 'None defined'}
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-sm">
                  {formData.greetingMessage || 'Greeting message not set...'}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="text-xs text-gray-500 mb-1">Example fallback response:</div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                {formData.fallbackMessage || 'Fallback message not set...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalitySettings;