# 恢复 raw.githubusercontent.com 图片的正确路径
# 从 git 历史恢复

param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

Write-Host "Restoring raw.githubusercontent.com image paths from git..." -ForegroundColor Cyan
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
    $relPath = $file.FullName.Replace($PSScriptRoot + "\..\", "").Replace("\", "/")
    Write-Host "Processing: $relPath" -ForegroundColor Cyan
    
    # 从 git 历史获取原始内容
    try {
        # 找到转换前的版本 (2d8183f 是 webp 转换 commit)
        $originalContent = git show "2d8183f^:$relPath" 2>$null
        
        if ($originalContent) {
            # 检查是否包含 raw.githubusercontent.com
            if ($originalContent -match 'raw\.githubusercontent\.com') {
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file.FullName, $originalContent, $utf8NoBom)
                
                # 统计恢复的图片数
                $count = ([regex]::Matches($originalContent, 'raw\.githubusercontent\.com')).Count
                Write-Host "  ✓ Restored $count images" -ForegroundColor Green
                $totalFixed++
                $totalImages += $count
            } else {
                Write-Host "  No raw.githubusercontent.com images found in history" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Cannot retrieve from git history" -ForegroundColor Red
        }
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Restoration complete!" -ForegroundColor Yellow
Write-Host "Files fixed: $totalFixed" -ForegroundColor Yellow
Write-Host "Images restored: $totalImages" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
