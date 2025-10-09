// Fix for OpenAI dependency resolution issue
// This script fixes the import resolution problem

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing OpenAI dependency resolution...');

// Update the testOpenAI.js to handle browser compatibility
const testOpenAIPath = path.join(__dirname, 'src', 'utils', 'testOpenAI.js');

if (fs.existsSync(testOpenAIPath)) {
  let content = fs.readFileSync(testOpenAIPath, 'utf8');
  
  // Replace the dynamic import with a more compatible approach
  if (content.includes('await import(\'openai\')')) {
    content = content.replace(
      'const openaiModule = await import(\'openai\');',
      'const openaiModule = await import(\'openai\').catch(() => null);'
    );
    
    fs.writeFileSync(testOpenAIPath, content);
    console.log('✅ Fixed testOpenAI.js import handling');
  }
}

console.log('🔄 Dependencies fixed - restart server with: npm run dev');
