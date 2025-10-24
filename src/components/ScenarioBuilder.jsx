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
const Sparkles = () => <span className="text-xl">✨</span>;

// Pre-built Scenario Templates
const SCENARIO_TEMPLATES = [
  {
    id: 'order-tracking',
    name: 'Order Tracking',
    icon: '📦',
    description: 'Help customers track their orders step by step',
    category: 'E-commerce',
    trigger: 'keyword',
    triggerValue: 'track, order, status, where is my order, tracking',
    steps: [
      {
        type: 'message',
        content: 'I\'ll help you track your order! 📦',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Could you please provide your order number? You can find it in your confirmation email.',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Great! And what\'s the email address you used for the order?',
        expectedInput: 'email',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Perfect! Let me look that up for you... Your order is currently [STATUS] and expected to arrive on [DATE]. 🎉',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'return-process',
    name: 'Return Process',
    icon: '↩️',
    description: 'Guide customers through returning items',
    category: 'E-commerce',
    trigger: 'keyword',
    triggerValue: 'return, refund, send back, exchange',
    steps: [
      {
        type: 'message',
        content: 'I\'m sorry the item didn\'t work out! I\'ll help you with the return process. ↩️',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s your order number?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Which item(s) would you like to return?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s the reason for the return?',
        expectedInput: 'text',
        nextStepConditions: [
          { value: 'defective', action: 'continue', message: 'We\'ll send a replacement right away!' },
          { value: 'wrong size', action: 'continue', message: 'We can exchange it for you!' }
        ]
      },
      {
        type: 'message',
        content: 'Thank you! I\'ve initiated your return. You\'ll receive a return label at your email within 24 hours. Your refund will be processed within 5-7 business days after we receive the item. 💙',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'product-recommendation',
    name: 'Product Recommendations',
    icon: '🛍️',
    description: 'Recommend products based on customer needs',
    category: 'Sales',
    trigger: 'keyword',
    triggerValue: 'recommend, suggest, looking for, need help finding',
    steps: [
      {
        type: 'message',
        content: 'I\'d love to help you find the perfect product! 🛍️',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What are you shopping for today?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s your budget range?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Any specific features or preferences?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Based on what you\'re looking for, I recommend [PRODUCT NAME]. It\'s [PRICE] and has [FEATURES]. Would you like to see it?',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'shipping-info',
    name: 'Shipping Information',
    icon: '🚚',
    description: 'Provide shipping details and options',
    category: 'E-commerce',
    trigger: 'keyword',
    triggerValue: 'shipping, delivery, how long, when will it arrive',
    steps: [
      {
        type: 'message',
        content: 'I can help you with shipping information! 🚚',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s your ZIP code or delivery location?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Great! We offer these shipping options to your area:\n\n📦 Standard (5-7 days) - FREE\n⚡ Express (2-3 days) - $9.99\n🚀 Overnight - $24.99\n\nAll orders over $50 get free standard shipping!',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'store-hours',
    name: 'Store Hours & Location',
    icon: '🏪',
    description: 'Provide store information and hours',
    category: 'Customer Service',
    trigger: 'keyword',
    triggerValue: 'hours, open, close, location, address, store',
    steps: [
      {
        type: 'message',
        content: 'Happy to help with store information! 🏪',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Are you looking for hours or location information?',
        expectedInput: 'text',
        nextStepConditions: [
          { value: 'hours', action: 'continue', message: 'Our hours are Monday-Saturday 9AM-9PM, Sunday 11AM-6PM' },
          { value: 'location', action: 'continue', message: 'We\'re located at 123 Main Street' }
        ]
      }
    ]
  },
  {
    id: 'discount-code',
    name: 'Discount Code Help',
    icon: '🎟️',
    description: 'Help customers apply discount codes',
    category: 'Sales',
    trigger: 'keyword',
    triggerValue: 'discount, coupon, promo code, code not working',
    steps: [
      {
        type: 'message',
        content: 'I can help you with discount codes! 🎟️',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What discount code are you trying to use?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Let me check that code for you... The code [CODE] gives you [DISCOUNT]% off and is valid until [DATE]. Make sure your cart meets the minimum purchase requirement of $[AMOUNT].',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'To apply: Add items to cart → Go to checkout → Enter code in "Discount Code" field → Click Apply',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'size-guide',
    name: 'Size Guide',
    icon: '📏',
    description: 'Help customers find the right size',
    category: 'E-commerce',
    trigger: 'keyword',
    triggerValue: 'size, sizing, fit, measurements, what size',
    steps: [
      {
        type: 'message',
        content: 'I\'ll help you find the perfect size! 📏',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Which product are you interested in?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What size do you typically wear?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Based on our size chart, I recommend size [SIZE]. This product runs [true to size/small/large]. Need detailed measurements? Check our full size guide here: [LINK]',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'cart-abandonment',
    name: 'Cart Recovery',
    icon: '🛒',
    description: 'Re-engage customers who abandoned their cart',
    category: 'Sales',
    trigger: 'time',
    triggerValue: '180',
    steps: [
      {
        type: 'message',
        content: 'I noticed you left some items in your cart! 🛒 Still interested?',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Was there something keeping you from completing your purchase?',
        expectedInput: 'text',
        nextStepConditions: [
          { value: 'price', action: 'continue', message: 'I can offer you a 10% discount!' },
          { value: 'shipping', action: 'continue', message: 'Good news - shipping is FREE over $50!' }
        ]
      },
      {
        type: 'message',
        content: 'Great news! I can help with that. Here\'s a special 10% discount code just for you: SAVE10. Ready to complete your order?',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'contact-sales',
    name: 'Contact Sales Team',
    icon: '💼',
    description: 'Collect info and route to sales',
    category: 'Lead Generation',
    trigger: 'keyword',
    triggerValue: 'sales, quote, business, bulk order, enterprise',
    steps: [
      {
        type: 'message',
        content: 'I\'ll connect you with our sales team! 💼',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s your name?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What\'s your company name?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'Best email to reach you?',
        expectedInput: 'email',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What can our sales team help you with?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Perfect! I\'ve notified our sales team. Someone will reach out to you within 2 business hours. Thank you! 🎉',
        expectedInput: '',
        nextStepConditions: []
      }
    ]
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    icon: '🔧',
    description: 'Troubleshoot technical issues',
    category: 'Customer Support',
    trigger: 'keyword',
    triggerValue: 'not working, broken, error, problem, issue, help',
    steps: [
      {
        type: 'message',
        content: 'I\'m here to help fix that! 🔧',
        expectedInput: '',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'What issue are you experiencing?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'question',
        content: 'When did this issue start?',
        expectedInput: 'text',
        nextStepConditions: []
      },
      {
        type: 'message',
        content: 'Let\'s try these troubleshooting steps:\n1. [STEP 1]\n2. [STEP 2]\n3. [STEP 3]\n\nDid this resolve your issue?',
        expectedInput: '',
        nextStepConditions: [
          { value: 'yes', action: 'continue', message: 'Great! Glad I could help!' },
          { value: 'no', action: 'continue', message: 'I\'ll connect you with a specialist' }
        ]
      }
    ]
  }
];

const ScenarioBuilder = () => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeView, setActiveView] = useState('scenarios');
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    description: '',
    trigger: 'keyword',
    triggerValue: '',
    steps: []
  });

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
    setActiveView('scenarios');
    setScenarioForm({
      name: '',
      description: '',
      trigger: 'keyword',
      triggerValue: '',
      steps: []
    });
    setActiveScenario(null);
  };

  const useTemplate = (template) => {
    setIsCreating(true);
    setActiveView('scenarios');
    setScenarioForm({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      triggerValue: template.triggerValue,
      steps: template.steps.map((step, index) => ({
        id: Date.now() + index,
        ...step
      }))
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
      setScenarios(scenarios.map(s => 
        s.id === activeScenario.id ? newScenario : s
      ));
    } else {
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
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setActiveView('scenarios')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'scenarios'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GitBranch /> Scenarios ({scenarios.length})
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
            </div>

            {activeView === 'scenarios' && !isCreating && (
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
                    💡 Tip: Start with 2-3 simple scenarios and expand as you learn what customers ask most. Use our templates for instant setup!
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
              <h2 className="text-2xl font-bold text-gray-900">Scenario Templates</h2>
            </div>
            <p className="text-gray-700">
              Start with a proven scenario template and customize it for your business. Click "Use Template" to get started instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENARIO_TEMPLATES.map((template) => (
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
                    <span className="font-medium text-gray-700">Trigger:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {template.trigger}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Steps:</span>
                    <span className="text-gray-600">{template.steps.length}</span>
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

      {/* Creation/Edit Form */}
      {activeView === 'scenarios' && isCreating && (
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

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={scenarioForm.name}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Order Tracking, Return Process, Product Questions"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={scenarioForm.description}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What does this scenario handle?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={scenarioForm.trigger}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, trigger: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="keyword">Keyword</option>
                    <option value="url">URL</option>
                    <option value="time">Time on Page</option>
                    <option value="exit">Exit Intent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Trigger Value
                  </label>
                  <input
                    type="text"
                    value={scenarioForm.triggerValue}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, triggerValue: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      scenarioForm.trigger === 'keyword' ? 'order, track, status' :
                      scenarioForm.trigger === 'url' ? '/checkout' :
                      scenarioForm.trigger === 'time' ? '30' : 'true'
                    }
                  />
                </div>
              </div>
            </div>

            {scenarioForm.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Steps ({scenarioForm.steps.length})</h3>
                <div className="space-y-3">
                  {scenarioForm.steps.map((step, index) => (
                    <div key={step.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              Step {index + 1}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium capitalize">
                              {step.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{step.content}</p>
                          {step.expectedInput && (
                            <p className="text-xs text-gray-600 mt-1">
                              Expected: <span className="font-medium">{step.expectedInput}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === scenarioForm.steps.length - 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                          >
                            ▼
                          </button>
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
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus /> Add Step
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Step Type
                  </label>
                  <select
                    value={currentStep.type}
                    onChange={(e) => setCurrentStep({ ...currentStep, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="message">Message (Bot says something)</option>
                    <option value="question">Question (Bot asks for input)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {currentStep.type === 'message' ? 'What should the bot say?' : 'What question should the bot ask?'}
                  </label>
                  <textarea
                    value={currentStep.content}
                    onChange={(e) => setCurrentStep({ ...currentStep, content: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      currentStep.type === 'message' 
                        ? "I'll help you track your order!" 
                        : "What's your order number?"
                    }
                  />
                </div>

                {currentStep.type === 'question' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Expected Input Type
                    </label>
                    <select
                      value={currentStep.expectedInput}
                      onChange={(e) => setCurrentStep({ ...currentStep, expectedInput: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={addStep}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus /> Add This Step
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
              <button
                onClick={saveScenario}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-bold text-lg flex items-center justify-center gap-2"
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
        </div>
      )}

      {activeView === 'scenarios' && !isCreating && (
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
                    <span className="text-gray-600 text-xs">"{scenario.triggerValue}"</span>
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
              <div className="flex gap-4 justify-center">
                <button
                  onClick={createNewScenario}
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
    </div>
  );
};

export default ScenarioBuilder;