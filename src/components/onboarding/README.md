# Onboarding System

Complete user onboarding flow for AgenStack.ai

## Components

### 1. **WelcomeModal**
- First-time greeting for new users
- Shows 4 key platform features
- Options: Start Tour or Skip

### 2. **ProductTour**
- 5-step guided walkthrough
- Progress indicators
- Covers: Dashboard, Bot Builder, Analytics, Proactive, Integrations

### 3. **SetupChecklist**
- 5 actionable tasks
- Tracks completion in localStorage
- Collapsible panel in bottom-right
- Auto-dismissible

### 4. **QuickActionsPanel**
- 6 quick action buttons
- Fast access to key features
- Dismissible
- Top-right position

### 5. **TooltipProvider**
- Context-based help system
- Reusable Tooltip component
- Pre-built tooltips for common features

## Flow

```
First Visit:
  → Welcome Modal
  → [Start Tour] → Product Tour → Checklist + Quick Actions
  → [Skip] → Checklist + Quick Actions

Returning Visit:
  → Checklist (if not dismissed)
```

## Usage in Components

```jsx
import { Tooltip, tooltips } from './components/onboarding';

// Add tooltip to any element
<div className="flex items-center gap-2">
  <h3>Bot Personality</h3>
  <Tooltip {...tooltips.botPersonality} />
</div>
```

## LocalStorage Keys

- `onboarding-welcome-seen` - Welcome modal shown
- `onboarding-tour-completed` - Tour finished
- `onboarding-checklist` - Completed checklist items
- `onboarding-checklist-dismissed` - Checklist hidden
- `quick-actions-dismissed` - Quick actions hidden

## Testing

Reset onboarding:
```javascript
// In browser console
localStorage.clear();
window.location.reload();
```

Or use the helper:
```javascript
import { resetOnboarding } from './components/onboarding';
resetOnboarding();
```

## Customization

Edit checklist items in `SetupChecklist.jsx`:
```javascript
const checklistItems = [
  {
    id: 'unique-id',
    title: 'Task Name',
    description: 'Short description',
    link: '/route'
  }
];
```

## Features

✅ Responsive design
✅ Smooth animations
✅ Persistent state
✅ Easy dismissal
✅ Navigation integration
✅ Mobile-friendly
