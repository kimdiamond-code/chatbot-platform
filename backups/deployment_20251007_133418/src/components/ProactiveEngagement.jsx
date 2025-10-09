import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, Clock, MousePointer, Link2, ShoppingCart, TrendingUp, Save, Trash2, Plus, X, Sparkles } from 'lucide-react';
import dbService from '../services/databaseService';
import ProactiveTemplates from './ProactiveTemplates';

const ProactiveEngagement = () => {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreview, setActivePreview] = useState(null);
  const [stats, setStats] = useState({
    totalTriggers: 0,
    conversions: 0,
    conversionRate: 0,
    topTrigger: '-'
  });
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const triggerIcons = {
    exit_intent: <MousePointer className="w-5 h-5" />,
    scroll_percentage: <Eye className="w-5 h-5" />,
    time_on_page: <Clock className="w-5 h-5" />,
    cart_abandonment: <ShoppingCart className="w-5 h-5" />,
    utm_parameter: <Link2 className="w-5 h-5" />,
    url_match: <Link2 className="w-5 h-5" />
  };

  const triggerTypes = [
    { value: 'exit_intent', label: 'Exit Intent' },
    { value: 'scroll_percentage', label: 'Scroll Percentage' },
    { value: 'time_on_page', label: 'Time on Page' },
    { value: 'cart_abandonment', label: 'Cart Abandonment' },
    { value: 'utm_parameter', label: 'UTM Parameter' },
    { value: 'url_match', label: 'URL Match' }
  ];

  useEffect(() => {
    loadTriggers();
    loadStats();
  }, []);

  const loadTriggers = async () => {
    try {
      const orgId = '00000000-0000-0000-0000-000000000001';
      const data = await dbService.getProactiveTriggers(orgId);
      setTriggers(data || []);
      console.log('✅ Loaded proactive triggers:', data?.length || 0);
    } catch (error) {
      console.error('Error loading triggers:', error);
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const orgId = '00000000-0000-0000-0000-000000000001';
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const statsData = await dbService.getProactiveTriggerStats(
        orgId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (statsData && statsData.length > 0) {
        const totalTriggers = statsData.reduce((sum, s) => sum + parseInt(s.total_triggers || 0), 0);
        const totalConversions = statsData.reduce((sum, s) => sum + parseInt(s.conversions || 0), 0);
        const avgConversionRate = totalTriggers > 0 ? (totalConversions / totalTriggers * 100).toFixed(1) : 0;
        const topTrigger = statsData.sort((a, b) => b.total_triggers - a.total_triggers)[0]?.name || '-';

        setStats({
          totalTriggers,
          conversions: totalConversions,
          conversionRate: avgConversionRate,
          topTrigger
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalTriggers: 0,
        conversions: 0,
        conversionRate: 0,
        topTrigger: '-'
      });
    }
  };

  const toggleTrigger = async (id, currentStatus) => {
    try {
      await dbService.toggleProactiveTrigger(id, !currentStatus);
      setTriggers(prev => prev.map(t => 
        t.id === id ? { ...t, enabled: !t.enabled } : t
      ));
      console.log('✅ Trigger toggled:', id, !currentStatus);
    } catch (error) {
      console.error('Error toggling trigger:', error);
    }
  };

  const saveTrigger = async (trigger) => {
    try {
      const orgId = '00000000-0000-0000-0000-000000000001';

      if (trigger.id && !trigger.id.startsWith('template-')) {
        // Update existing trigger
        await dbService.updateProactiveTrigger(trigger.id, {
          name: trigger.name,
          message: trigger.message,
          delay_seconds: trigger.delay_seconds,
          priority: trigger.priority,
          conditions: trigger.conditions
        });
        console.log('✅ Trigger updated:', trigger.id);
      } else {
        // Create new trigger
        const newTrigger = await dbService.saveProactiveTrigger({
          organization_id: orgId,
          name: trigger.name,
          trigger_type: trigger.trigger_type,
          message: trigger.message,
          delay_seconds: trigger.delay_seconds || 0,
          priority: trigger.priority || 5,
          conditions: trigger.conditions || {},
          action_config: trigger.action_config || {}
        });
        console.log('✅ Trigger created:', newTrigger.id);
      }

      await loadTriggers();
      await loadStats();
      setEditingTrigger(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving trigger:', error);
      alert('Failed to save trigger. Please try again.');
    }
  };

  const handleSelectTemplate = async (template) => {
    try {
      const orgId = '00000000-0000-0000-0000-000000000001';
      const newTrigger = await dbService.saveProactiveTrigger({
        organization_id: orgId,
        name: template.name,
        trigger_type: template.trigger.trigger_type,
        message: template.message,
        delay_seconds: template.trigger.delay_seconds,
        priority: template.trigger.priority,
        conditions: template.trigger.conditions || {},
        action_config: {}
      });
      
      await loadTriggers();
      setShowTemplates(false);
      alert(`✅ ${template.name} template added! You can now customize and enable it.`);
      console.log('✅ Template added:', newTrigger.id);
    } catch (error) {
      console.error('Error adding template:', error);
      alert('Failed to add template. Please try again.');
    }
  };

  const deleteTrigger = async (id) => {
    if (!confirm('Are you sure you want to delete this trigger?')) return;

    try {
      await dbService.deleteProactiveTrigger(id);
      setTriggers(prev => prev.filter(t => t.id !== id));
      await loadStats();
      console.log('✅ Trigger deleted:', id);
    } catch (error) {
      console.error('Error deleting trigger:', error);
      alert('Failed to delete trigger. Please try again.');
    }
  };

  const TriggerEditModal = ({ trigger, onSave, onClose }) => {
    const [formData, setFormData] = useState(trigger || {
      name: '',
      trigger_type: 'exit_intent',
      message: '',
      delay_seconds: 0,
      priority: 5,
      conditions: {},
      action_config: {}
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{trigger?.id ? 'Edit' : 'New'} Trigger</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Exit Intent Popup"
              />
            </div>

            {!trigger?.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {triggerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the message to display..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delay (seconds)</label>
                <input
                  type="number"
                  value={formData.delay_seconds}
                  onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conditions based on trigger type */}
            {formData.trigger_type === 'scroll_percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scroll Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.conditions?.scrollPercentage || 50}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    conditions: { ...formData.conditions, scrollPercentage: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.trigger_type === 'url_match' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page URL Pattern</label>
                <input
                  type="text"
                  value={formData.conditions?.pageUrl || '*'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    conditions: { ...formData.conditions, pageUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., /products/* or *"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Trigger
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Proactive Engagement</h1>
            <p className="text-gray-600">Trigger messages based on visitor behavior to increase conversions</p>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            {showTemplates ? 'Hide Templates' : 'Browse Templates'}
          </button>
        </div>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="mb-8 glass-premium p-6 rounded-xl animate-fade-in">
          <ProactiveTemplates onSelectTemplate={handleSelectTemplate} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTriggers.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Triggers (30d)</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.conversions}</div>
          <div className="text-sm text-gray-600">Conversions</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.topTrigger}</div>
          <div className="text-sm text-gray-600">Top Performer</div>
        </div>
      </div>

      {/* Triggers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Triggers</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Trigger
            </button>
          </div>
          
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="glass-dynamic p-4 rounded-xl hover-3d-tilt">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${trigger.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {triggerIcons[trigger.trigger_type]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trigger.name}</h3>
                      <p className="text-sm text-gray-600">
                        Priority: {trigger.priority} | Delay: {trigger.delay_seconds}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePreview(trigger)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingTrigger(trigger)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrigger(trigger.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={trigger.enabled}
                        onChange={() => toggleTrigger(trigger.id, trigger.enabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {trigger.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="glass-premium p-6 rounded-xl min-h-[600px] relative">
            {activePreview ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Previewing: <span className="font-semibold">{activePreview.name}</span>
                </div>
                
                {/* Chat Widget Preview */}
                <div className="absolute bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div>
                        <div className="font-semibold">Support Assistant</div>
                        <div className="text-xs opacity-90">Online now</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{activePreview.message}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Start Chat
                      </button>
                      <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Maybe Later
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Trigger Conditions */}
                <div className="absolute top-4 left-4 glass-dynamic p-4 rounded-lg max-w-xs">
                  <h4 className="font-semibold text-sm mb-2">Trigger Conditions:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Type: {activePreview.trigger_type.replace(/_/g, ' ')}</li>
                    <li>• Delay: {activePreview.delay_seconds}s</li>
                    <li>• Priority: {activePreview.priority}/10</li>
                    {activePreview.conditions?.scrollPercentage && 
                      <li>• Scroll: {activePreview.conditions.scrollPercentage}%</li>}
                    {activePreview.conditions?.pageUrl && 
                      <li>• URL: {activePreview.conditions.pageUrl}</li>}
                    {activePreview.conditions?.utm_source && 
                      <li>• UTM: {activePreview.conditions.utm_source}</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a trigger to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingTrigger && (
        <TriggerEditModal
          trigger={editingTrigger}
          onSave={saveTrigger}
          onClose={() => setEditingTrigger(null)}
        />
      )}

      {showAddModal && (
        <TriggerEditModal
          trigger={null}
          onSave={saveTrigger}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default ProactiveEngagement;
