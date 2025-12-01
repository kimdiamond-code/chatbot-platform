# Fix organizationId Naming Inconsistency

## Problem
- localStorage stores: `organizationId` (camelCase)  
- Code looks for: `organization_id` (snake_case)

## Files to Update

Search for `user?.organization_id` and replace with `user?.organizationId` in these files:

1. **src/components/integrations/ShopifyIntegration.jsx** - Line ~79
2. Any other integration files
3. Any component that uses user.organization_id

## Find All Instances

PowerShell command:
```powershell
Get-ChildItem -Path "src" -Recurse -Include *.jsx,*.js | Select-String "user\?.organization_id" | Select-Object Path, LineNumber
```

## Fix Command

PowerShell find & replace:
```powershell
$files = Get-ChildItem -Path "src" -Recurse -Include *.jsx,*.js
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "user\?.organization_id") {
        $content = $content -replace "user\?.organization_id", "user?.organizationId"
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}
```

## Manual Fix for ShopifyIntegration.jsx

Line 79, change:
```javascript
organizationId: user?.organization_id || '00000000-0000-0000-0000-000000000001',
```

To:
```javascript
organizationId: user?.organizationId || '00000000-0000-0000-0000-000000000001',
```
