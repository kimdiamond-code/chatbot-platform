import React, { useState } from 'react';

const CustomOptions = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data);
  const [newKeyword, setNewKeyword] = useState('');

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleNestedInputChange = (section, field, value) => {
    const updatedData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const addEscalationKeyword = () => {
    if (newKeyword.trim()) {
      const updatedKeywords = [...formData.escalationKeywords, newKeyword.trim().toLowerCase()];
      const updatedData = { ...formData, escalationKeywords: updatedKeywords };
      setFormData(updatedData);
      onUpdate(updatedData);
      setNewKeyword('');
    }
  };

  const removeEscalationKeyword = (index) => {
    const updatedKeywords = formData.escalationKeywords.filter((_, i) => i !== index);
    const updatedData = { ...formData, escalationKeywords: updatedKeywords };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const commonEscalationKeywords = [
    'human', 'agent', 'supervisor', 'manager', 'help', 'support',
    'speak to someone', 'real person', 'representative', 'escalate',
    'complaint', 'frustrated', 'angry', 'refund', 'cancel'
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Custom Options</h2>
        <p className="text-gray-600">Configure advanced settings for your bot's behavior and responses.</p>
      </div>

      <div className="space-y-8">
        {/* Response Configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Response Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Response Delay (milliseconds)
              </label>
              <input
                type="number"
                value={formData.responseDelay}
                onChange={(e) => handleInputChange('responseDelay', parseInt(e.target.value))}
                min="0"
                max="10000"
                step="100"
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-blue-600 mt-1">
                Delay before bot responds (0-10000ms). Simulates typing time. Current: {formData.responseDelay}ms
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Retry Limit
              </label>
              <select
                value={formData.retryLimit}
                onChange={(e) => handleInputChange('retryLimit', parseInt(e.target.value))}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 attempt</option>
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts</option>
                <option value={4}>4 attempts</option>
                <option value={5}>5 attempts</option>
              </select>
              <p className="text-xs text-blue-600 mt-1">
                How many times the bot will try to understand unclear inputs before escalating
              </p>
            </div>
          </div>

          {/* Response Preview */}
          <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Response Timing Preview:</div>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse text-gray-400">●●●</div>
              <div className="text-sm">
                Bot will show typing indicator for {formData.responseDelay}ms before responding
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Operating Hours</h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.operatingHours.enabled}
                onChange={(e) => handleNestedInputChange('operatingHours', 'enabled', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-green-800">
                Enable Operating Hours (bot will show offline message outside these hours)
              </span>
            </label>

            {formData.operatingHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHours.start}
                    onChange={(e) => handleNestedInputChange('operatingHours', 'start', e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHours.end}
                    onChange={(e) => handleNestedInputChange('operatingHours', 'end', e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.operatingHours.timezone}
                    onChange={(e) => handleNestedInputChange('operatingHours', 'timezone', e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.operatingHours.enabled && (
              <div className="mt-4 p-4 bg-white border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">
                  Bot will be available from {formData.operatingHours.start} to {formData.operatingHours.end} ({formData.operatingHours.timezone})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Escalation Keywords */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">Escalation Keywords</h3>
          <p className="text-orange-700 mb-4 text-sm">
            When users type these words or phrases, the bot will offer to connect them with a human agent.
          </p>

          {/* Quick Add Common Keywords */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-orange-800 mb-2">
              Quick Add Common Keywords:
            </label>
            <div className="flex flex-wrap gap-2">
              {commonEscalationKeywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => {
                    if (!formData.escalationKeywords.includes(keyword)) {
                      const updatedKeywords = [...formData.escalationKeywords, keyword];
                      const updatedData = { ...formData, escalationKeywords: updatedKeywords };
                      setFormData(updatedData);
                      onUpdate(updatedData);
                    }
                  }}
                  disabled={formData.escalationKeywords.includes(keyword)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.escalationKeywords.includes(keyword)
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-100'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Keyword Input */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add custom escalation keyword or phrase..."
              className="flex-1 p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onKeyPress={(e) => e.key === 'Enter' && addEscalationKeyword()}
            />
            <button
              onClick={addEscalationKeyword}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Current Keywords */}
          {formData.escalationKeywords.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-orange-800">
                Current Escalation Keywords ({formData.escalationKeywords.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.escalationKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white border border-orange-300 rounded-full px-3 py-1"
                  >
                    <span className="text-sm text-gray-800">{keyword}</span>
                    <button
                      onClick={() => removeEscalationKeyword(index)}
                      className="text-orange-600 hover:text-orange-800 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Delay:</span>
                <span className="text-sm font-medium">{formData.responseDelay}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retry Limit:</span>
                <span className="text-sm font-medium">{formData.retryLimit} attempts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operating Hours:</span>
                <span className="text-sm font-medium">
                  {formData.operatingHours.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Escalation Keywords:</span>
                <span className="text-sm font-medium">{formData.escalationKeywords.length} configured</span>
              </div>
              {formData.operatingHours.enabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span className="text-sm font-medium">
                    {formData.operatingHours.start} - {formData.operatingHours.end}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOptions;