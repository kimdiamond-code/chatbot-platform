import fs from 'fs';
import path from 'path';

console.log('🔍 ChatBot Platform - Pre-Deployment Verification\n');

let errors = 0;
let warnings = 0;

// Check .env file
console.log('📋 Checking environment configuration...');
if (!fs.existsSync('.env')) {
  console.log('  ❌ .env file not found!');
  console.log('     → Copy .env.example to .env and fill in your credentials');
  errors++;
} else {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Check required variables
  const required = ['DATABASE_URL', 'VITE_OPENAI_API_KEY'];
  required.forEach(key => {
    if (!envContent.includes(key) || envContent.includes(`${key}=your-`) || envContent.includes(`${key}=postgresql://your-`)) {
      console.log(`  ⚠️  ${key} not configured`);
      warnings++;
    } else {
      console.log(`  ✅ ${key} configured`);
    }
  });
}

// Check database schema files
console.log('\n📊 Checking database schema files...');
const schemaFiles = [
  'sql/database_complete_schema.sql',
  'sql/add_proactive_triggers.sql'
];

schemaFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
    errors++;
  }
});

// Check critical component files
console.log('\n🎨 Checking component files...');
const components = [
  'src/components/ProactiveEngagement.jsx',
  'src/components/ProactiveTemplates.jsx',
  'src/components/Analytics.jsx',
  'src/components/BotBuilder.jsx',
  'src/App.jsx'
];

components.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
    errors++;
  }
});

// Check API files
console.log('\n🔌 Checking API endpoints...');
const apiFiles = [
  'api/index.js',
  'api/database.js'
];

apiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
    errors++;
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'preview'];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ "${script}" script configured`);
  } else {
    console.log(`  ❌ "${script}" script missing`);
    errors++;
  }
});

// Check dependencies
console.log('\n📚 Checking critical dependencies...');
const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  '@neondatabase/serverless',
  'lucide-react',
  'recharts'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep} installed`);
  } else {
    console.log(`  ❌ ${dep} missing`);
    errors++;
  }
});

// Check vercel.json
console.log('\n⚙️  Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  console.log('  ✅ vercel.json exists');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercelConfig.rewrites) {
    console.log('  ✅ Rewrites configured');
  }
  if (vercelConfig.headers) {
    console.log('  ✅ Headers configured');
  }
} else {
  console.log('  ❌ vercel.json missing');
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✨ Perfect! Everything is ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Run: vercel --prod');
  console.log('\nOr use: QUICK_DEPLOY_PRODUCTION.bat');
} else {
  if (errors > 0) {
    console.log(`❌ Found ${errors} error(s) that must be fixed before deployment`);
  }
  if (warnings > 0) {
    console.log(`⚠️  Found ${warnings} warning(s) - recommended to fix but not critical`);
  }
  console.log('\nPlease address the issues above before deploying.');
}

console.log('='.repeat(50) + '\n');

process.exit(errors > 0 ? 1 : 0);
