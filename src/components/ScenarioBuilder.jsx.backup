import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const GitBranch = () => <span className="text-xl">🎯</span>;
const Plus = () => <span className="text-xl">➕</span>;
const Trash = () => <span className="text-xl">🗑️</span>;
const Save = () => <span className="text-xl">💾</span>;
const Play = () => <span className="text-xl">▶️</span>;
const Edit = () => <span className="text-xl">✏️</span>;
const Copy = () => <span className="text-xl">📋</span>;
const MessageSquare = () => <span className="text-xl">💬</span>;
const ArrowRight = () => <span className="text-xl">→</span>;
const Info = () => <span className="text-xl">ℹ️</span>;
const Lightbulb = () => <span className="text-xl">💡</span>;
const CheckCircle = () => <span className="text-xl">✅</span>;

const ScenarioBuilder = () => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GitBranch /> Scenarios
            </h1>
            <p className="text-lg text-gray-700 mt-2 font-medium">Teach your bot how to handle specific situations</p>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Scenarios are step-by-step instructions that tell your bot exactly what to do when customers ask about specific topics or trigger certain conditions. Think of them as training scripts for common situations.
            </p>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <Info /> {showHelp ? 'Hide' : 'Show'} Examples & Tips
            </button>
          </div>
          
          <div className="flex gap-3 ml-4">
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
                    <span><strong>Order Tracking:</strong> Guide customers through checking their order status step by step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Product Questions:</strong> Answer specific questions about features, sizing, or availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Returns & Refunds:</strong> Walk customers through your return policy and process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle />
                    <span><strong>Store Hours:</strong> Provide location and operating hours information</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-green-900 flex items-center gap-2 mb-3">
                  <MessageSquare /> How It Works
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li><strong>Name your scenario:</strong> Give it a clear name like "Check Order Status"</li>
                  <li><strong>Set the trigger:</strong> Choose when this scenario should activate (keywords, URLs, etc.)</li>
                  <li><strong>Add steps:</strong> Write what the bot should say or ask in sequence</li>
                  <li><strong>Save & activate:</strong> Your bot will now handle that situation automatically</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-xs text-green-800 italic">
                    💡 Tip: Start with 2-3 simple scenarios and expand as you learn what customers ask most.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creation/Edit Form */}
      {isCreating ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeScenario ? 'Edit Scenario' : 'Create New Scenario'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setActiveScenario(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          
          {/* Instructional Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>🎯 Quick Start:</strong> Give your scenario a clear name, set when it should trigger, then add the conversation steps. Each step is what your bot will say or ask.
            </p>
          </div>
          
          {/* Basic Info */}
          <div className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                1. What is this scenario for? *
              </label>
              <input
                type="text"
                value={scenarioForm.name}
                onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="e.g., Check Order Status, Return an Item, Find Store Hours"
              />
              <p className="text-xs text-gray-500 mt-1">Keep it simple and action-oriented</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                2. Brief description (optional)
              </label>
              <textarea
                value={scenarioForm.description}
                onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Helps customers track their order by collecting order number and email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                3. When should this scenario activate?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={scenarioForm.trigger}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, trigger: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="keyword">When customer says specific words</option>
                    <option value="intent">When customer has specific intent</option>
                    <option value="url">When visiting specific page</option>
                    <option value="time">After time on page</option>
                    <option value="manual">Manual/Agent-triggered only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {scenarioForm.trigger === 'keyword' ? 'Keywords (comma-separated)' :
                     scenarioForm.trigger === 'intent' ? 'Intent Name' :
                     scenarioForm.trigger === 'url' ? 'Page URL' :
                     scenarioForm.trigger === 'time' ? 'Seconds' :
                     'Leave Empty'}
                  </label>
                  <input
                    type="text"
                    value={scenarioForm.triggerValue}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, triggerValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      scenarioForm.trigger === 'keyword' ? 'order, track, status, where is my' :
                      scenarioForm.trigger === 'intent' ? 'product_inquiry' :
                      scenarioForm.trigger === 'url' ? '/checkout' :
                      scenarioForm.trigger === 'time' ? '30' :
                      'No trigger needed'
                    }
                  />
                  {scenarioForm.trigger === 'keyword' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Bot will activate when customer message contains any of these words
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">4. Build the Conversation</h3>
                <p className="text-sm text-gray-600 mt-1">Add what the bot should say or ask, step by step</p>
              </div>
              {scenarioForm.steps.length === 0 && (
                <span className="text-sm text-gray-500 italic">No steps yet - add your first one below</span>
              )}
            </div>
            
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-300">
              <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Plus /> Add Step #{scenarioForm.steps.length + 1}
              </h4>
              <p className="text-xs text-gray-600 mb-4">What should the bot say or ask at this point in the conversation?</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    What type of step is this?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep({ ...currentStep, type: 'message' })}
                      className={`px-4 py-3 rounded-lg border-2 text-left ${
                        currentStep.type === 'message'
                          ? 'border-blue-500 bg-blue-100 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">💬 Bot Says</div>
                      <div className="text-xs">Bot sends a message</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep({ ...currentStep, type: 'question' })}
                      className={`px-4 py-3 rounded-lg border-2 text-left ${
                        currentStep.type === 'question'
                          ? 'border-blue-500 bg-blue-100 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold">❓ Bot Asks</div>
                      <div className="text-xs">Wait for customer input</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {currentStep.type === 'question' ? 'What question should the bot ask?' : 'What should the bot say?'} *
                  </label>
                  <textarea
                    value={currentStep.content}
                    onChange={(e) => setCurrentStep({ ...currentStep, content: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      currentStep.type === 'question'
                        ? 'e.g., "Can you provide your order number?" or "What is your email address?"'
                        : 'e.g., "I\'ll help you track your order!" or "Let me look that up for you."'
                    }
                  />
                </div>

                {currentStep.type === 'question' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      What type of answer are you expecting? (optional)
                    </label>
                    <select
                      value={currentStep.expectedInput}
                      onChange={(e) => setCurrentStep({ ...currentStep, expectedInput: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Any text response</option>
                      <option value="email">Email address</option>
                      <option value="phone">Phone number</option>
                      <option value="number">Number only</option>
                      <option value="date">Date</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      This helps validate the customer's response
                    </p>
                  </div>
                )}

                <button
                  onClick={addStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus /> Add This Step to Scenario
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-300">
            <button
              onClick={saveScenario}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save /> {activeScenario ? 'Save Changes' : 'Create Scenario'}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setActiveScenario(null);
              }}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
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
            <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Train Your Bot?
              </h3>
              <p className="text-gray-600 mb-3 max-w-md mx-auto">
                Scenarios teach your bot how to handle specific customer questions and situations automatically.
              </p>
              <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
                For example: "When a customer asks about order tracking, collect their order number and email, then show the tracking info."
              </p>
              <button
                onClick={createNewScenario}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 inline-flex items-center gap-2 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Plus /> Create Your First Scenario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioBuilder;
