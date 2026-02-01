# 恢复 bu.dusays.com 图床图片的正确路径
# 根据 alt 文本中的原始扩展名恢复

param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

Write-Host "Restoring bu.dusays.com image paths..." -ForegroundColor Cyan
Write-Host ""

$totalFixed = 0
$totalImages = 0

# 获取所有markdown文件
$mdFiles = Get-ChildItem -Path $basePath -Recurse -Filter "*.md" | 
    Where-Object { $_.FullName -match "(_posts|coffer)" }

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileFixed = $false
    $fileImages = 0
    
    # 匹配 Markdown 图片语法: ![alt](url)
    $pattern = '!\[([^\]]+)\]\(([^)]+)\)'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $alt = $match.Groups[1].Value
        $url = $match.Groups[2].Value
        
        # 检查是否是 bu.dusays.com 的 webp 图片
        if ($url -match 'https://bu\.dusays\.com/(.+)\.webp') {
            $basePathUrl = $matches[1]
            
            # 从 alt 文本中提取原始扩展名
            $originalExt = $null
            if ($alt -match '\.(png|jpg|jpeg|gif)$') {
                $originalExt = $matches[1]
            }
            
            if ($originalExt) {
                $originalUrl = "https://bu.dusays.com/$basePathUrl.$originalExt"
                $content = $content.Replace($url, $originalUrl)
                $fileFixed = $true
                $fileImages++
                $totalImages++
            }
        }
    }
    
    # 匹配 Front-matter 中的 cover 等字段
    $yamlPattern = '^(cover|top_img|index_img|bg_img|load_image):\s*(https://bu\.dusays\.com/(.+)\.webp)'
    $yamlMatches = [regex]::Matches($content, $yamlPattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
    
    foreach ($match in $yamlMatches) {
        $key = $match.Groups[1].Value
        $url = $match.Groups[2].Value
        $basePathUrl = $match.Groups[3].Value
        
        # Front-matter 中的图片，默认恢复为 png（大部分情况）
        # 尝试从文件名推断格式
        $originalExt = "png"  # 默认
        
        # 检查文件名中是否包含格式线索
        if ($basePathUrl -match '\.(png|jpg|jpeg|gif)') {
            $originalExt = $matches[1]
        }
        
        $originalUrl = "https://bu.dusays.com/$basePathUrl.$originalExt"
        $content = $content.Replace($url, $originalUrl)
        $fileFixed = $true
        $fileImages++
        $totalImages++
    }
    
    # 匹配 HTML img 标签
    $htmlPattern = 'src="(https://bu\.dusays\.com/(.+)\.webp)"'
    $htmlMatches = [regex]::Matches($content, $htmlPattern)
    
    foreach ($match in $htmlMatches) {
        $url = $match.Groups[1].Value
        $basePathUrl = $match.Groups[2].Value
        
        # 默认恢复为 png
        $originalExt = "png"
        
        # 检查文件名中是否包含格式线索
        if ($basePathUrl -match '\.(png|jpg|jpeg|gif)') {
            $originalExt = $matches[1]
        }
        
        $originalUrl = "https://bu.dusays.com/$basePathUrl.$originalExt"
        $content = $content.Replace($url, $originalUrl)
        $fileFixed = $true
        $fileImages++
        $totalImages++
    }
    
    if ($fileFixed) {
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
