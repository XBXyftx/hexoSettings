param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

# 扫描目录列表
$directories = @('_posts', 'about', 'coffer', 'categories', 'tags', 'link')
$imageExtensions = @('.png','.jpg','.jpeg','.gif')

# 排除的路径模式（这些路径的图片不会被转换）
$excludePatterns = @(
    'https://bu\.dusays\.com',  # 不转换 bu.dusays.com 图床图片
    'https?://[^/]+\.github\.io',  # 不转换 GitHub Pages 图片
    'https?://[^/]+\.githubusercontent\.com'  # 不转换 GitHub 用户内容
)

Write-Host "Scanning ALL Markdown files for image references..." -ForegroundColor Cyan
Write-Host "Excluded patterns: $($excludePatterns -join ', ')" -ForegroundColor Gray

# 获取所有 .md 文件
$markdownFiles = Get-ChildItem -Path $basePath -Recurse -Include "*.md"

# 检查路径是否应该被排除
function ShouldExcludePath($path) {
    foreach ($pattern in $excludePatterns) {
        if ($path -match $pattern) {
            return $true
        }
    }
    return $false
}

foreach ($file in $markdownFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        
        foreach ($ext in $imageExtensions) {
            $escExt = [regex]::Escape($ext)
            
            # 1. 替换 Front-matter 配置 (cover, top_img, index_img, bg_img, load_image)
            # 使用更安全的字符串拼接方式返回，避开 $key: 歧义
            $yamlPattern = "(?m)^(cover|top_img|index_img|bg_img|load_image):\s*(.+)$escExt"
            $content = [regex]::Replace($content, $yamlPattern, { 
                param($m) 
                $k = $m.Groups[1].Value
                $v = $m.Groups[2].Value
                # 检查是否需要排除
                if (ShouldExcludePath $v) {
                    return $m.Value
                }
                return "${k}: ${v}.webp" 
            })

            # 2. 替换 Markdown 语法 ![alt](path.ext)
            $mdPattern = "(?<=\()([^)]+)$escExt(?=\))"
            $content = [regex]::Replace($content, $mdPattern, { 
                param($m) 
                $path = $m.Value
                # 检查是否需要排除
                if (ShouldExcludePath $path) {
                    return $path
                }
                return $path -replace $escExt, ".webp" 
            }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            
            # 3. 替换 HTML src="path.ext"
            $htmlPattern = "(?<=src=[""'])([^""']+)$escExt(?=[""'])"
            $content = [regex]::Replace($content, $htmlPattern, { 
                param($m) 
                $path = $m.Value
                # 检查是否需要排除
                if (ShouldExcludePath $path) {
                    return $path
                }
                return $path -replace $escExt, ".webp" 
            }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        }

        if ($content -ne $originalContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            
            # 显示相对路径，输出更清爽
            $relPath = $file.FullName.Replace($basePath, "")
            Write-Host "Updated: $relPath" -ForegroundColor Green
        }
    } catch {
        $fName = $file.Name
        Write-Host "Error processing $fName : $_" -ForegroundColor Red
    }
}
Write-Host "Success: All Markdown files updated to WebP!" -ForegroundColor Yellow
