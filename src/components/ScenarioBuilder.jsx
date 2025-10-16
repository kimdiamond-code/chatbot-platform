import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const GitBranch = () => <span className="text-xl">🔀</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Save = () => <span className="text-xl">💾</span>;
const Play = () => <span className="text-xl">▶️</span>;
const Edit = () => <span className="text-xl">✏️</span>;
const Copy = () => <span className="text-xl">📋</span>;
const MessageSquare = () => <span className="text-xl">💬</span>;
const ArrowRight = () => <span className="text-xl">→</span>;

const ScenarioBuilder = () => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Form state for creating/editing scenarios
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    description: '',
    trigger: 'keyword',
    triggerValue: '',
    steps: []
  });

  // Step form state
  const [currentStep, setCurrentStep] = useState({
    type: 'message',
    content: '',
    expectedInput: '',
    nextStepConditions: []
  });

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        setScenarios(settings.scenarios || []);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  };

  const saveScenarios = async () => {
    setSaveStatus('saving');
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        settings.scenarios = scenarios;
        
        await dbService.saveBotConfig({
          ...dbConfig,
          settings: JSON.stringify(settings)
        });
        
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error saving scenarios:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const createNewScenario = () => {
    setIsCreating(true);
    setScenarioForm({
      name: '',
      description: '',
      trigger: 'keyword',
      triggerValue: '',
      steps: []
    });
    setActiveScenario(null);
  };

  const saveScenario = () => {
    if (!scenarioForm.name.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    const newScenario = {
      id: Date.now(),
      ...scenarioForm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (activeScenario) {
      // Update existing
      setScenarios(scenarios.map(s => 
        s.id === activeScenario.id ? newScenario : s
      ));
    } else {
      // Add new
      setScenarios([...scenarios, newScenario]);
    }

    setIsCreating(false);
    setActiveScenario(null);
    saveScenarios();
  };

  const editScenario = (scenario) => {
    setScenarioForm(scenario);
    setActiveScenario(scenario);
    setIsCreating(true);
  };

  const deleteScenario = (id) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      setScenarios(scenarios.filter(s => s.id !== id));
      saveScenarios();
    }
  };

  const duplicateScenario = (scenario) => {
    const duplicate = {
      ...scenario,
      id: Date.now(),
      name: `${scenario.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setScenarios([...scenarios, duplicate]);
    saveScenarios();
  };

  const addStep = () => {
    if (!currentStep.content.trim()) {
      alert('Please enter step content');
      return;
    }

    const newStep = {
      id: Date.now(),
      ...currentStep
    };

    setScenarioForm({
      ...scenarioForm,
      steps: [...scenarioForm.steps, newStep]
    });

    // Reset step form
    setCurrentStep({
      type: 'message',
      content: '',
      expectedInput: '',
      nextStepConditions: []
    });
  };

  const removeStep = (stepId) => {
    setScenarioForm({
      ...scenarioForm,
      steps: scenarioForm.steps.filter(s => s.id !== stepId)
    });
  };

  const moveStep = (stepId, direction) => {
    const index = scenarioForm.steps.findIndex(s => s.id === stepId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === scenarioForm.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...scenarioForm.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    
    setScenarioForm({
      ...scenarioForm,
      steps: newSteps
    });
  };

  const addCondition = () => {
    setCurrentStep({
      ...currentStep,
      nextStepConditions: [
        ...currentStep.nextStepConditions,
        { value: '', action: 'continue', message: '' }
      ]
    });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...currentStep.nextStepConditions];
    newConditions[index][field] = value;
    setCurrentStep({
      ...currentStep,
      nextStepConditions: newConditions
    });
  };

  const removeCondition = (index) => {
    setCurrentStep({
      ...currentStep,
      nextStepConditions: currentStep.nextStepConditions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GitBranch /> Scenario Builder
          </h1>
          <p className="text-gray-600 mt-1">Create conversation flows and automated scenarios</p>
        </div>
        
        <div className="flex gap-3">
          {!isCreating && (
            <button
              onClick={createNewScenario}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus /> New Scenario
            </button>
          )}
          
          {scenarios.length > 0 && (
            <button
              onClick={saveScenarios}
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

      {/* Creation/Edit Form */}
      {isCreating ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {activeScenario ? 'Edit Scenario' : 'Create New Scenario'}
          </h2>
          
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scenario Name *
              </label>
              <input
                type="text"
                value={scenarioForm.name}
                onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Order Tracking, Product Inquiry, Refund Request"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={scenarioForm.description}
                onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this scenario does..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type
                </label>
                <select
                  value={scenarioForm.trigger}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, trigger: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="keyword">Keyword Match</option>
                  <option value="intent">Intent Detection</option>
                  <option value="url">URL Visit</option>
                  <option value="time">Time on Page</option>
                  <option value="manual">Manual Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Value
                </label>
                <input
                  type="text"
                  value={scenarioForm.triggerValue}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, triggerValue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    scenarioForm.trigger === 'keyword' ? 'e.g., order, track, help' :
                    scenarioForm.trigger === 'intent' ? 'e.g., product_inquiry' :
                    scenarioForm.trigger === 'url' ? 'e.g., /checkout' :
                    scenarioForm.trigger === 'time' ? 'e.g., 30 (seconds)' :
                    'Leave empty for manual'
                  }
                />
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Conversation Steps</h3>
            
            {/* Existing Steps */}
            {scenarioForm.steps.length > 0 && (
              <div className="space-y-3 mb-6">
                {scenarioForm.steps.map((step, index) => (
                  <div key={step.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                            Step {index + 1}
                          </span>
                          <span className="text-xs text-gray-600 capitalize">
                            {step.type}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{step.content}</p>
                        {step.expectedInput && (
                          <p className="text-sm text-gray-600 mt-1">
                            Expects: {step.expectedInput}
                          </p>
                        )}
                        {step.nextStepConditions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step.nextStepConditions.map((cond, i) => (
                              <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                                <ArrowRight />
                                If "{cond.value}" → {cond.action}
                                {cond.message && ` (${cond.message})`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {index > 0 && (
                          <button
                            onClick={() => moveStep(step.id, 'up')}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {index < scenarioForm.steps.length - 1 && (
                          <button
                            onClick={() => moveStep(step.id, 'down')}
                            className="p-1 text-gray-600 hover:text-blue-600"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Step Form */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Step</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step Type
                  </label>
                  <select
                    value={currentStep.type}
                    onChange={(e) => setCurrentStep({ ...currentStep, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="message">Bot Message</option>
                    <option value="question">Question (Wait for input)</option>
                    <option value="action">Trigger Action</option>
                    <option value="condition">Conditional Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={currentStep.content}
                    onChange={(e) => setCurrentStep({ ...currentStep, content: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="What should the bot say or do in this step?"
                  />
                </div>

                {(currentStep.type === 'question' || currentStep.type === 'condition') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Input Type
                    </label>
                    <select
                      value={currentStep.expectedInput}
                      onChange={(e) => setCurrentStep({ ...currentStep, expectedInput: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="choice">Multiple Choice</option>
                    </select>
                  </div>
                )}

                {/* Conditional Logic */}
                {currentStep.type === 'condition' && (
                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Response Conditions
                      </label>
                      <button
                        onClick={addCondition}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Plus /> Add Condition
                      </button>
                    </div>
                    
                    {currentStep.nextStepConditions.map((cond, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={cond.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="User says..."
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select
                          value={cond.action}
                          onChange={(e) => updateCondition(index, 'action', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="continue">Continue</option>
                          <option value="jump">Jump to step</option>
                          <option value="end">End scenario</option>
                          <option value="escalate">Escalate to human</option>
                        </select>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={cond.message}
                            onChange={(e) => updateCondition(index, 'message', e.target.value)}
                            placeholder="Response..."
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => removeCondition(index)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={addStep}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus /> Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={saveScenario}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              {activeScenario ? 'Update Scenario' : 'Create Scenario'}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setActiveScenario(null);
              }}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Scenarios List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{scenario.name}</h3>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Trigger:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {scenario.trigger}
                  </span>
                  {scenario.triggerValue && (
                    <span className="text-gray-600">"{scenario.triggerValue}"</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Steps:</span>
                  <span className="text-gray-600">{scenario.steps.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editScenario(scenario)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                >
                  <Edit /> Edit
                </button>
                <button
                  onClick={() => duplicateScenario(scenario)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  title="Duplicate"
                >
                  <Copy />
                </button>
                <button
                  onClick={() => deleteScenario(scenario.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  title="Delete"
                >
                  <Trash />
                </button>
              </div>
            </div>
          ))}

          {scenarios.length === 0 && !isCreating && (
            <div className="col-span-full text-center py-12">
              <GitBranch />
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                No Scenarios Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first conversation scenario to automate customer interactions
              </p>
              <button
                onClick={createNewScenario}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus /> Create First Scenario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioBuilder;
