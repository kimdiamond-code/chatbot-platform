// Simple Chart Components - No External Dependencies
import React from 'react';

// Simple Line Chart Component
export const SimpleLineChart = ({ data, dataKey, title, color = '#3B82F6' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d[dataKey]));
  const minValue = Math.min(...data.map(d => d[dataKey]));
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 240">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Line path */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 360 + 20;
              const y = 220 - ((point[dataKey] - minValue) / range) * 200;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 360 + 20;
            const y = 220 - ((point[dataKey] - minValue) / range) * 200;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
          {data.map((point, index) => (
            <span key={index} className={index % 2 === 0 ? '' : 'opacity-50'}>
              {point.hour || point.date || index}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component  
export const SimpleBarChart = ({ data, dataKey, title, color = '#10B981' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d[dataKey]));

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="relative h-72 bg-gray-50 rounded-lg p-6 pb-12">
        <div className="h-full flex items-end justify-between">
          {data.map((point, index) => {
            const height = (point[dataKey] / maxValue) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div 
                  className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ 
                    height: `${height}%`, 
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                  title={`${point.hour || point.date}: ${point[dataKey]}`}
                />
              </div>
            );
          })}
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around px-4 pb-2">
          {data.map((point, index) => (
            <span 
              key={index} 
              className="text-[10px] text-gray-500 whitespace-nowrap"
              style={{ 
                transform: 'rotate(-45deg) translateY(4px)',
                transformOrigin: 'center',
                display: 'inline-block',
                width: '60px',
                textAlign: 'left'
              }}
            >
              {point.hour || point.date || index}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Donut Chart Component
export const SimpleDonutChart = ({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="flex items-center space-x-4">
        {/* Chart */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            {data.map((segment, index) => {
              const percentage = (segment.value / total) * 100;
              if (!percentage || !total || isNaN(percentage)) {
                return null; // Skip invalid segments
              }
              
              const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-1">
          {data.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-600">{segment.label}</span>
              <span className="font-medium text-gray-900">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon, 
  color = 'blue',
  subtitle 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  const changeIcon = changeType === 'increase' ? '↗' : '↘';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <p className={`text-sm ${changeColor} mt-2 flex items-center`}>
              <span className="mr-1">{changeIcon}</span>
              {change} from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Feed Component
export const ActivityFeed = ({ activities, title = "Recent Activity" }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'conversation': return '💬';
      case 'resolution': return '✅';
      case 'escalation': return '⚠️';
      case 'rating': return '⭐';
      case 'system': return '🔧';
      default: return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'conversation': return 'bg-blue-100 text-blue-800';
      case 'resolution': return 'bg-green-100 text-green-800';
      case 'escalation': return 'bg-orange-100 text-orange-800';
      case 'rating': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg -m-2 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.event}</p>
              <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
