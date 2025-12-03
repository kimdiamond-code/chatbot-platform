# ========================================
# PRODUCTION CLEANUP SCRIPT
# Removes testing code, moves backups, prepares for launch
# ========================================

Write-Host "🧹 Starting Production Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Track changes
$changes = @()

# ========================================
# 1. REMOVE TESTING COMPONENT IMPORT
# ========================================
Write-Host "1️⃣ Removing BotBuilderSaveTest from App.jsx..." -ForegroundColor Yellow

$appJsxPath = "src\App.jsx"
if (Test-Path $appJsxPath) {
    $content = Get-Content $appJsxPath -Raw
    
    # Remove import
    $content = $content -replace "import BotBuilderSaveTest from.*?\.jsx';?\r?\n", ""
    
    # Save
    Set-Content -Path $appJsxPath -Value $content -NoNewline
    $changes += "✅ Removed BotBuilderSaveTest import from App.jsx"
    Write-Host "   ✓ Import removed" -ForegroundColor Green
} else {
    Write-Host "   ⚠ App.jsx not found" -ForegroundColor Red
}

# ========================================
# 2. MOVE BACKUP FILES TO BACKUP DIRECTORY
# ========================================
Write-Host ""
Write-Host "2️⃣ Moving backup files to /backups directory..." -ForegroundColor Yellow

# Ensure backups directory exists
if (-not (Test-Path "backups\src-backups")) {
    New-Item -ItemType Directory -Path "backups\src-backups" -Force | Out-Null
}

# List of backup files to move
$backupFiles = @(
    "src\App-Basic.jsx",
    "src\App-Complex.jsx.backup",
    "src\App-Enhanced.jsx",
    "src\App-Simple-Test.jsx",
    "src\App.jsx.adminpanel",
    "src\App.jsx.backup",
    "src\App.jsx.rbac",
    "src\App.tsx.backup",
    "src\main.js.backup",
    "src\main.jsx.backup"
)

foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        $destination = "backups\src-backups\$fileName"
        
        # Move file
        Move-Item -Path $file -Destination $destination -Force
        $changes += "✅ Moved $fileName to backups/"
        Write-Host "   ✓ Moved $fileName" -ForegroundColor Green
    }
}

# ========================================
# 3. UPDATE .gitignore
# ========================================
Write-Host ""
Write-Host "3️⃣ Updating .gitignore..." -ForegroundColor Yellow

$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    
    # Add backup patterns if not present
    $patternsToAdd = @"

# Backup files
*.backup
*.old
*.OLD
*-backup.*
*-old.*
backups/

# Environment files with secrets
.env

"@

    if ($gitignoreContent -notmatch "# Backup files") {
        Add-Content -Path $gitignorePath -Value $patternsToAdd
        $changes += "✅ Updated .gitignore with backup patterns"
        Write-Host "   ✓ Added backup patterns to .gitignore" -ForegroundColor Green
    } else {
        Write-Host "   ℹ .gitignore already configured" -ForegroundColor Gray
    }
}

# ========================================
# 4. CREATE PRODUCTION LOGGER
# ========================================
Write-Host ""
Write-Host "4️⃣ Creating production-safe logger..." -ForegroundColor Yellow

# Ensure utils directory exists
if (-not (Test-Path "src\utils")) {
    New-Item -ItemType Directory -Path "src\utils" -Force | Out-Null
}

$loggerContent = @"
/**
 * Production-Safe Logger
 * 
 * Usage:
 *   import { logger } from './utils/logger';
 *   logger.log('Debug info');      // Only in development
 *   logger.error('Error message'); // Always logged
 *   logger.warn('Warning');        // Only in development
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors
    console.error(...args);
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// Convenience function for development-only code blocks
export const ifDev = (callback) => {
  if (isDevelopment && typeof callback === 'function') {
    callback();
  }
};

export default logger;
"@

Set-Content -Path "src\utils\logger.js" -Value $loggerContent
$changes += "✅ Created production-safe logger at src/utils/logger.js"
Write-Host "   ✓ Logger created at src/utils/logger.js" -ForegroundColor Green

# ========================================
# 5. CREATE ERROR BOUNDARY COMPONENT
# ========================================
Write-Host ""
Write-Host "5️⃣ Creating Error Boundary component..." -ForegroundColor Yellow

# Ensure components directory exists
if (-not (Test-Path "src\components\common")) {
    New-Item -ItemType Directory -Path "src\components\common" -Force | Out-Null
}

$errorBoundaryContent = @"
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });

    // In production, send to error tracking service
    if (!import.meta.env.DEV) {
      // TODO: Send to Sentry or other error tracking
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We've encountered an unexpected error. Please try refreshing the page.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-red-50 p-4 rounded-lg mb-4">
                  <summary className="font-semibold text-red-800 cursor-pointer mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
"@

Set-Content -Path "src\components\common\ErrorBoundary.jsx" -Value $errorBoundaryContent
$changes += "✅ Created ErrorBoundary component"
Write-Host "   ✓ ErrorBoundary created" -ForegroundColor Green

# ========================================
# 6. CREATE ENV VALIDATION SCRIPT
# ========================================
Write-Host ""
Write-Host "6️⃣ Creating environment validation script..." -ForegroundColor Yellow

$envCheckContent = @"
/**
 * Environment Variables Validation
 * Checks that all required environment variables are set
 * Run this during build or startup
 */

const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'DATABASE_URL'
];

const optionalEnvVars = [
  'VITE_SHOPIFY_API_KEY',
  'VITE_MESSENGER_APP_ID',
  'VITE_KLAVIYO_PRIVATE_API_KEY',
  'TOKEN_ENCRYPTION_KEY'
];

export function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      errors.push(\`Missing or invalid required variable: \${varName}\`);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      warnings.push(\`Optional variable not configured: \${varName}\`);
    }
  });

  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(err => console.error('  -', err));
    
    if (!import.meta.env.PROD) {
      console.error('\n⚠️ Some features may not work without these variables.');
    } else {
      throw new Error('Required environment variables are missing');
    }
  }

  if (warnings.length > 0 && !import.meta.env.PROD) {
    console.warn('⚠️ Environment warnings:');
    warnings.forEach(warn => console.warn('  -', warn));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables validated');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Run validation on import in development
if (import.meta.env.DEV) {
  validateEnvironment();
}

export default validateEnvironment;
"@

Set-Content -Path "src\utils\validateEnv.js" -Value $envCheckContent
$changes += "✅ Created environment validation script"
Write-Host "   ✓ Environment validator created" -ForegroundColor Green

# ========================================
# 7. CREATE DEPLOYMENT SUMMARY
# ========================================
Write-Host ""
Write-Host "7️⃣ Creating deployment summary..." -ForegroundColor Yellow

$summaryContent = @"
# 🚀 PRODUCTION CLEANUP COMPLETED

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Changes Applied

$($changes | ForEach-Object { "- $_" } | Out-String)

## Next Steps

### 1. Review Changes
\`\`\`powershell
git status
git diff
\`\`\`

### 2. Update Imports (Manual Step Required)
Some files may still have console.log statements. Search for them:
\`\`\`powershell
# In PowerShell, search for console.log usage
Get-ChildItem -Recurse -Include *.jsx,*.js -Path src | Select-String -Pattern "console\.log" -SimpleMatch
\`\`\`

Replace with the new logger:
\`\`\`javascript
// Old
console.log('Debug message');

// New
import { logger } from './utils/logger';
logger.log('Debug message');  // Only shows in development
\`\`\`

### 3. Wrap Components with Error Boundary
Update your App.jsx to use the ErrorBoundary:
\`\`\`javascript
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Your app content */}
    </ErrorBoundary>
  );
}
\`\`\`

### 4. Verify Environment Variables in Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables

Ensure these are set:
- ✅ DATABASE_URL
- ✅ VITE_OPENAI_API_KEY
- ✅ VITE_SHOPIFY_API_KEY
- ✅ VITE_SHOPIFY_API_SECRET
- ✅ VITE_MESSENGER_APP_ID
- ✅ VITE_MESSENGER_APP_SECRET
- ⚠️ VITE_KLAVIYO_PRIVATE_API_KEY (update if needed)
- ✅ TOKEN_ENCRYPTION_KEY

### 5. Test Build Locally
\`\`\`powershell
npm run build
\`\`\`

Fix any errors that appear.

### 6. Deploy to Production
\`\`\`powershell
git add .
git commit -m "Production cleanup: remove test code, add error boundaries"
git push
vercel --prod
\`\`\`

### 7. Post-Deployment Testing
- [ ] Test login/signup flow
- [ ] Verify OAuth integrations work
- [ ] Check bot builder saves correctly
- [ ] Test conversations create and display
- [ ] Verify analytics data loads
- [ ] Check all integrations page

## Files Created

1. **src/utils/logger.js** - Production-safe logging
2. **src/components/common/ErrorBoundary.jsx** - Error handling component
3. **src/utils/validateEnv.js** - Environment validation

## Files Moved

All backup files moved to: **backups/src-backups/**

## Important Notes

⚠️ **Manual Steps Required:**
- Replace console.log with logger throughout codebase
- Add ErrorBoundary wrapper in App.jsx
- Verify all environment variables in Vercel
- Test OAuth flows in production

📝 **Documentation:**
- See PRODUCTION_AUDIT_FINAL.md for full audit report
- See deployment checklist for comprehensive testing

✅ **Ready for Launch:** After completing manual steps above
"@

Set-Content -Path "CLEANUP_SUMMARY.md" -Value $summaryContent
Write-Host "   ✓ Deployment summary created" -ForegroundColor Green

# ========================================
# SUMMARY
# ========================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETED!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Changes Applied:" -ForegroundColor Yellow
foreach ($change in $changes) {
    Write-Host "  $change" -ForegroundColor White
}
Write-Host ""
Write-Host "📄 Review the changes:" -ForegroundColor Yellow
Write-Host "  CLEANUP_SUMMARY.md - Detailed next steps" -ForegroundColor White
Write-Host "  PRODUCTION_AUDIT_FINAL.md - Full audit report" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ IMPORTANT: Manual steps still required!" -ForegroundColor Red
Write-Host "  1. Replace console.log statements with logger" -ForegroundColor White
Write-Host "  2. Add ErrorBoundary wrapper in App.jsx" -ForegroundColor White
Write-Host "  3. Verify Vercel environment variables" -ForegroundColor White
Write-Host "  4. Test build locally with 'npm run build'" -ForegroundColor White
Write-Host ""
Write-Host "🚀 After completing manual steps, deploy with:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""
