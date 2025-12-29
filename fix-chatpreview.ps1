$file = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\components\ChatPreview.jsx"

$content = Get-Content $file -Raw

# Replace the import
$content = $content -replace "import \{ chatBotService \} from '\.\./services/openaiService\.js';", "import { enhancedBotService } from '../services/enhancedBotService.js';"

# Replace the function call
$content = $content -replace "const botResult = await chatBotService\.generateResponse\(", "const botResult = await enhancedBotService.processMessage("

# Fix the parameters (processMessage expects: content, conversationId, email, orgId)
$content = $content -replace "userInput,\s*'bot-builder-preview',\s*\{\s*organizationId: DEFAULT_ORG_ID,\s*// Let OpenAI service load config from database - don't pass manually\s*\}", "userInput, 'bot-builder-preview', null, DEFAULT_ORG_ID"

$content | Set-Content $file

Write-Host "✅ Fixed ChatPreview to use enhancedBotService" -ForegroundColor Green
