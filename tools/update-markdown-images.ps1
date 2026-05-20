param(
    [string]$basePath = "$PSScriptRoot\..\source",
    [string]$configPath = "$PSScriptRoot\.."
)

# 需要处理的图片扩展名
$imageExtensions = @('.png','.jpg','.jpeg','.gif')

# 排除的路径模式（这些路径的图片不会被转换）
$excludePatterns = @(
    'https://bu\.dusays\.com',  # 不转换 bu.dusays.com 图床图片
    'https://raw\.githubusercontent\.com',  # 不转换 GitHub Raw 内容
    'https?://[^/]+\.github\.io',  # 不转换 GitHub Pages 图片
    'https?://[^/]+\.githubusercontent\.com'  # 不转换 GitHub 用户内容
)

# 需要处理的配置文件
$configFiles = @('_config.butterfly.yml', '_config.yml')

Write-Host "Scanning ALL Markdown files for image references..." -ForegroundColor Cyan
Write-Host "Excluded patterns: $($excludePatterns -join ', ')" -ForegroundColor Gray

# 检查路径是否应该被排除
function ShouldExcludePath($path) {
    foreach ($pattern in $excludePatterns) {
        if ($path -match $pattern) {
            return $true
        }
    }
    return $false
}

# 处理文件中的图片引用
function Update-FileContent($filePath, $isConfig = $false) {
    try {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        foreach ($ext in $imageExtensions) {
            $escExt = [regex]::Escape($ext)
            
            if ($isConfig) {
                # 配置文件中的图片路径模式 (img: /path/to/image.png)
                $configPattern = "(?m)^(\s*(?:img|favicon|default_top_img|index_img|archive_img|tag_img|category_img|footer_img|background|logo|load_image|error_img\.flink|error_img\.post_page)):\s*(.+)$escExt"
                $content = [regex]::Replace($content, $configPattern, { 
                    param($m) 
                    $key = $m.Groups[1].Value
                    $val = $m.Groups[2].Value
                    # 检查是否需要排除
                    if (ShouldExcludePath $val) {
                        return $m.Value
                    }
                    return "${key}: ${val}.webp" 
                })
            } else {
                # 1. 替换 Front-matter 配置 (cover, top_img, index_img, bg_img, load_image, background)
                $yamlPattern = "(?m)^(cover|top_img|index_img|bg_img|load_image|background):\s*(.+)$escExt"
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
        }

        if ($content -ne $originalContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
            
            # 显示相对路径
            $relPath = $filePath.Replace((Resolve-Path $configPath).Path, "").TrimStart('\', '/')
            Write-Host "Updated: $relPath" -ForegroundColor Green
            return $true
        }
    } catch {
        $fName = [System.IO.Path]::GetFileName($filePath)
        Write-Host "Error processing $fName : $_" -ForegroundColor Red
    }
    return $false
}

# ===== 处理 Markdown 文件 =====
Write-Host "" 
Write-Host "=== Processing Markdown files ===" -ForegroundColor Cyan

$markdownFiles = Get-ChildItem -Path $basePath -Recurse -Include "*.md"
$mdUpdatedCount = 0

foreach ($file in $markdownFiles) {
    if (Update-FileContent $file.FullName -isConfig $false) {
        $mdUpdatedCount++
    }
}

Write-Host "Markdown files updated: $mdUpdatedCount" -ForegroundColor Gray

# ===== 处理配置文件 =====
Write-Host ""
Write-Host "=== Processing Config files ===" -ForegroundColor Cyan

$configUpdatedCount = 0
foreach ($configFile in $configFiles) {
    $fullConfigPath = Join-Path $configPath $configFile
    if (Test-Path $fullConfigPath) {
        Write-Host "Checking: $configFile" -ForegroundColor Gray
        if (Update-FileContent $fullConfigPath -isConfig $true) {
            $configUpdatedCount++
        }
    } else {
        Write-Host "Not found: $configFile" -ForegroundColor DarkGray
    }
}

Write-Host "Config files updated: $configUpdatedCount" -ForegroundColor Gray

# ===== 完成 =====
Write-Host ""
Write-Host "Success: All files updated to WebP!" -ForegroundColor Yellow
Write-Host "  - Markdown files: $mdUpdatedCount" -ForegroundColor White
Write-Host "  - Config files: $configUpdatedCount" -ForegroundColor White
