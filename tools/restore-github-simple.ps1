# 恢复 raw.githubusercontent.com 图片的正确路径
# 直接替换 .webp 为 .png

param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

Write-Host "Restoring raw.githubusercontent.com image paths..." -ForegroundColor Cyan
Write-Host ""

$totalFixed = 0
$totalImages = 0

# 获取包含 raw.githubusercontent.com webp 图片的文件
$mdFiles = Get-ChildItem -Path $basePath -Recurse -Filter "*.md" | 
    Where-Object { 
        $content = Get-Content -Path $_.FullName -Raw
        $content -match 'raw\.githubusercontent\.com.*\.webp'
    }

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileImages = 0
    
    # 匹配 raw.githubusercontent.com 的 webp 图片
    $pattern = '(https://raw\.githubusercontent\.com/[^)"''\s]+)\.webp'
    
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $webpUrl = $match.Value
        $baseUrl = $match.Groups[1].Value
        
        # 恢复为 .png (根据git历史确认原始格式是png)
        $originalUrl = "$baseUrl.png"
        $content = $content.Replace($webpUrl, $originalUrl)
        $fileImages++
        $totalImages++
    }
    
    if ($content -ne $originalContent) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        
        $relPath = $file.FullName.Replace($basePath, "").Replace("\", "/")
        Write-Host "Fixed $fileImages images in $relPath" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Restoration complete!" -ForegroundColor Yellow
Write-Host "Files fixed: $totalFixed" -ForegroundColor Yellow
Write-Host "Images restored: $totalImages" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
