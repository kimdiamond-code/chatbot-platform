// ✅ ENHANCED: Advanced Chart Components with Professional Visualizations
// These charts provide interactive, business-grade analytics visualizations

import React, { useState, useEffect } from 'react';

// Enhanced Metric Card with Trends and Sparklines
export const EnhancedMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon, 
  color = 'blue',
  subtitle,
  trend = [],
  prefix = '',
  suffix = '',
  onClick = null,
  alert = null
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500'
  };

  const changeColor = changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600';
  const changeIcon = changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→';

  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-102' : ''
      } ${alert ? 'ring-2 ring-red-200' : ''}`}
      onClick={onClick}
    >
      {alert && (
        <div className="flex items-center mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 text-sm font-medium">⚠️ {alert}</span>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900">
              {prefix}{value}{suffix}
            </span>
          </div>
          
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          
          {change && (
            <div className="flex items-center mt-2 space-x-2">
              <span className={`text-sm font-medium ${changeColor} flex items-center`}>
                <span className="mr-1">{changeIcon}</span>
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}
          
          {/* Mini Sparkline */}
          {trend && trend.length > 0 && (
            <div className="mt-3">
              <MiniSparkline data={trend} color={colorClasses[color].replace('bg-', '')} />
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-xl shadow-sm`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Mini Sparkline Component
const MiniSparkline = ({ data, color, height = 40 }) => {
  if (!data || data.length < 2) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const pathData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - minValue) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="w-full h-10">
      <svg width="100%" height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: `var(--${color}-500)`, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: `var(--${color}-500)`, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={`${pathData} L 100 ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${color})`}
          className="opacity-20"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={`rgb(var(--${color}-500))`}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Last point */}
        <circle
          cx={100}
          cy={height - ((data[data.length - 1] - minValue) / range) * height}
          r="2"
          fill={`rgb(var(--${color}-500))`}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
};

// Advanced Line Chart with Interactive Features
export const AdvancedLineChart = ({ 
  data, 
  dataKeys, 
  title, 
  colors = ['#3B82F6', '#10B981', '#F59E0B'], 
  height = 200,
  showPoints = true,
  showGrid = true,
  onPointClick = null
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(new Set(dataKeys || []));

  if (!data || data.length === 0) return null;

  const keys = dataKeys || Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
  const maxValues = keys.map(key => Math.max(...data.map(d => d[key] || 0)));
  const globalMax = Math.max(...maxValues);
  const globalMin = Math.min(...data.flatMap(d => keys.map(key => d[key] || 0)));
  const range = globalMax - globalMin || 1;

  return (
    <div className="w-full">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {keys.map((key, index) => (
          <button
            key={key}
            onClick={() => {
              const newSelected = new Set(selectedSeries);
              if (newSelected.has(key)) {
                newSelected.delete(key);
              } else {
                newSelected.add(key);
              }
              setSelectedSeries(newSelected);
            }}
            className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-lg transition-all ${
              selectedSeries.has(key) 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedSeries.has(key) ? colors[index % colors.length] : '#D1D5DB' }}
            />
            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4">
        <svg className="w-full" height={height} viewBox={`0 0 400 ${height}`}>
          {/* Grid lines */}
          {showGrid && (
            <defs>
              <pattern id="grid" width="40" height={height/5} patternUnits="userSpaceOnUse">
                <path d={`M 40 0 L 0 0 0 ${height/5}`} fill="none" stroke="#E5E7EB" strokeWidth="1"/>
              </pattern>
            </defs>
          )}
          {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}
          
          {/* Lines */}
          {keys.map((key, keyIndex) => {
            if (!selectedSeries.has(key)) return null;
            
            const pathData = data.map((point, index) => {
              const x = (index / (data.length - 1)) * 360 + 20;
              const y = height - 20 - ((point[key] - globalMin) / range) * (height - 40);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');

            return (
              <g key={key}>
                {/* Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={colors[keyIndex % colors.length]}
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                
                {/* Points */}
                {showPoints && data.map((point, pointIndex) => {
                  const x = (pointIndex / (data.length - 1)) * 360 + 20;
                  const y = height - 20 - ((point[key] - globalMin) / range) * (height - 40);
                  return (
                    <circle
                      key={`${key}-${pointIndex}`}
                      cx={x}
                      cy={y}
                      r={hoveredPoint === `${key}-${pointIndex}` ? 6 : 4}
                      fill={colors[keyIndex % colors.length]}
                      className="drop-shadow-sm cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() => setHoveredPoint(`${key}-${pointIndex}`)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => onPointClick && onPointClick(point, key, pointIndex)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-sm">
            <div className="font-medium">Point Details</div>
            <div className="text-gray-600">{hoveredPoint}</div>
          </div>
        )}
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{globalMax.toFixed(0)}</span>
          <span>{((globalMax + globalMin) / 2).toFixed(0)}</span>
          <span>{globalMin.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

// Conversion Funnel Chart
export const ConversionFunnelChart = ({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      
      <div className="space-y-2">
        {data.map((stage, index) => {
          const width = (stage.conversion / 100) * 100; // Percentage width
          const prevStage = data[index - 1];
          const dropOff = prevStage ? prevStage.count - stage.count : 0;
          
          return (
            <div key={stage.stage} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{stage.count.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">({stage.conversion.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="relative">
                {/* Background bar */}
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Fill bar */}
                  <div 
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-between px-3"
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {stage.stage}
                    </span>
                    <span className="text-xs text-white">
                      {stage.conversion.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Drop-off indicator */}
                {dropOff > 0 && (
                  <div className="absolute -right-16 top-0 h-full flex items-center">
                    <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
                      -{dropOff.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Geographic Distribution Chart
export const GeographicChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.conversations, 0);

  return (
    <div className="w-full">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      
      <div className="space-y-3">
        {data.map((region, index) => {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
          const textColors = ['text-blue-700', 'text-green-700', 'text-purple-700', 'text-orange-700', 'text-pink-700'];
          
          return (
            <div key={region.region} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-4 h-4 ${colors[index % colors.length]} rounded-full flex-shrink-0`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{region.region}</span>
                  <span className={`text-sm font-medium ${textColors[index % textColors.length]}`}>
                    {region.percentage}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">
                    {region.conversations.toLocaleString()} conversations
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Satisfaction:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {region.satisfaction.toFixed(1)} ⭐
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Real-time Metrics Display
export const RealTimeMetrics = ({ metrics, onRefresh }) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Real-time Metrics</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-100">Live</span>
          <button 
            onClick={onRefresh}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
          >
            🔄
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{metrics?.activeChats || 0}</div>
          <div className="text-sm text-blue-200">Active Chats</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">
            {metrics?.avgResponseTime ? Math.floor(metrics.avgResponseTime / 60) : 0}m
          </div>
          <div className="text-sm text-blue-200">Avg Response</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">
            {metrics?.satisfaction?.toFixed(1) || '0.0'}
          </div>
          <div className="text-sm text-blue-200">Satisfaction</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{metrics?.queueLength || 0}</div>
          <div className="text-sm text-blue-200">In Queue</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-400 text-xs text-blue-200 text-center">
        Updated {formatTime(lastUpdate)}
      </div>
    </div>
  );
};

// Enhanced Activity Feed with Impact Levels
export const EnhancedActivityFeed = ({ activities, title = "Recent Activity" }) => {
  const getActivityIcon = (type) => {
    const icons = {
      conversation: '💬',
      resolution: '✅',
      escalation: '⚠️',
      positive: '⭐',
      system: '🔧',
      success: '🎉',
      conversion: '💰',
      retention: '🔄',
      improvement: '📈'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-orange-500', 
      low: 'bg-gray-500'
    };
    return colors[impact] || 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">Last 24 hours</span>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="group hover:bg-gray-50 p-3 rounded-lg -m-3 transition-colors relative">
            <div className="flex items-start space-x-3">
              {/* Activity Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${getActivityColor(activity.impact)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  {activity.impact && (
                    <div className={`w-2 h-2 ${getImpactBadge(activity.impact)} rounded-full`} />
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  {activity.impact && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.impact)}`}>
                      {activity.impact} impact
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Alert Panel Component
export const AlertPanel = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
      {alerts.map((alert, index) => (
        <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div>
                <h4 className="font-medium">{alert.title}</h4>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.action && (
                  <button className="text-sm font-medium underline mt-2 hover:no-underline">
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => onDismiss && onDismiss(index)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  EnhancedMetricCard,
  AdvancedLineChart,
  ConversionFunnelChart,
  GeographicChart,
  RealTimeMetrics,
  EnhancedActivityFeed,
  AlertPanel
};
