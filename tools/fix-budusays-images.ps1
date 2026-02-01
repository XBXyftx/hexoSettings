# 恢复 bu.dusays.com 图床图片的正确路径
# 将 .webp 恢复为原始格式 (.png/.jpg)

param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

$directories = @('_posts', 'coffer')

Write-Host "Scanning Markdown files for bu.dusays.com WebP images..." -ForegroundColor Cyan

# 获取所有 .md 文件
$markdownFiles = Get-ChildItem -Path $basePath -Recurse -Include "*.md"

$fixedCount = 0

foreach ($file in $markdownFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        $fileFixed = $false
        
        # 匹配 bu.dusays.com 的 webp 图片
        # 匹配模式: https://bu.dusays.com/.../xxx.webp
        $pattern = 'https://bu\.dusays\.com/(\d{4}/\d{2}/\d{2}/[a-f0-9]+)\.webp'
        
        $matches = [regex]::Matches($content, $pattern)
        
        foreach ($match in $matches) {
            $webpUrl = $match.Value
            $basePath = $match.Groups[1].Value
            
            # 尝试获取原始格式
            # 1. 首先尝试 .png
            $pngUrl = "https://bu.dusays.com/$basePath.png"
            $jpgUrl = "https://bu.dusays.com/$basePath.jpg"
            $jpegUrl = "https://bu.dusays.com/$basePath.jpeg"
            
            # 检查文件内容中是否有线索（alt文本中的原始扩展名）
            $altPattern = '!\[([^\]]*\.)(png|jpg|jpeg)\]\(' + [regex]::Escape($webpUrl) + '\)'
            $altMatch = [regex]::Match($content, $altPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            
            if ($altMatch.Success) {
                # 从alt文本中提取原始扩展名
                $originalExt = $altMatch.Groups[2].Value
                $originalUrl = "https://bu.dusays.com/$basePath.$originalExt"
                $content = $content.Replace($webpUrl, $originalUrl)
                $fileFixed = $true
                Write-Host "  Fixed (from alt): $webpUrl -> $originalUrl" -ForegroundColor Yellow
            } else {
                # 尝试从git历史中获取原始格式
                $relPath = $file.FullName.Replace($PSScriptRoot + "\..\source\", "").Replace("\", "/")
                $gitContent = $null
                
                try {
                    # 获取转换前的git版本内容
                    $gitLog = git log --oneline --all -- "$($file.FullName)" 2>$null | Select-String -Pattern "convert|webp" | Select-Object -First 1
                    if ($gitLog) {
                        $commitHash = ($gitLog -split " ")[0]
                        $gitContent = git show "$commitHash^:$relPath" 2>$null | Select-String -SimpleMatch $webpUrl
                    }
                } catch {
                    # git命令失败，忽略
                }
                
                # 如果没有找到，默认恢复为 .png（根据观察大部分原始格式是png）
                $originalUrl = $pngUrl
                $content = $content.Replace($webpUrl, $originalUrl)
                $fileFixed = $true
                Write-Host "  Fixed (default png): $webpUrl -> $originalUrl" -ForegroundColor Yellow
            }
        }

        if ($fileFixed) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            
            $relPath = $file.FullName.Replace($basePath, "")
            Write-Host "Updated: $relPath" -ForegroundColor Green
            $fixedCount++
        }
    } catch {
        $fName = $file.Name
        Write-Host "Error processing $fName : $_" -ForegroundColor Red
    }
}

Write-Host "Done! Fixed $fixedCount files." -ForegroundColor Yellow
