# 从git历史恢复 bu.dusays.com 图床图片的正确路径
# 使用方法: .\tools\restore-budusays-from-git.ps1

param(
    [string]$basePath = "$PSScriptRoot\.."
)

$sourcePath = Join-Path $basePath "source"
$targetDirs = @("_posts", "coffer")

Write-Host "Restoring bu.dusays.com image paths from git history..." -ForegroundColor Cyan
Write-Host ""

$totalFixed = 0

foreach ($dir in $targetDirs) {
    $fullDir = Join-Path $sourcePath $dir
    if (-not (Test-Path $fullDir)) {
        Write-Host "Directory not found: $fullDir" -ForegroundColor Yellow
        continue
    }
    
    # 获取所有markdown文件
    $mdFiles = Get-ChildItem -Path $fullDir -Recurse -Filter "*.md"
    
    foreach ($file in $mdFiles) {
        $relPath = $file.FullName.Replace($basePath + "\", "").Replace("\", "/")
        
        # 检查文件是否包含 bu.dusays.com 的 webp 链接
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        if ($content -notmatch 'bu\.dusays\.com.*\.webp') {
            continue
        }
        
        Write-Host "Processing: $relPath" -ForegroundColor Cyan
        
        # 找到包含 webp 转换的 commit
        $commits = git log --oneline --all -- "$($file.FullName)" 2>$null
        $webpCommit = $null
        $beforeWebpCommit = $null
        
        foreach ($commitLine in $commits) {
            $hash = ($commitLine -split " ")[0]
            $msg = $commitLine.Substring($hash.Length).Trim()
            
            # 查找 webp 转换相关的 commit
            if ($msg -match "webp|WebP|convert" -and -not $webpCommit) {
                $webpCommit = $hash
                Write-Host "  Found WebP conversion commit: $hash" -ForegroundColor Gray
            }
        }
        
        if (-not $webpCommit) {
            Write-Host "  No WebP conversion commit found, skipping..." -ForegroundColor Yellow
            continue
        }
        
        # 获取转换前的版本
        try {
            $parentCommit = "$webpCommit^"
            $oldContent = git show "$parentCommit`:$relPath" 2>$null
            
            if (-not $oldContent) {
                Write-Host "  Cannot find previous version, trying alternative..." -ForegroundColor Yellow
                # 尝试更早的commit
                $olderCommits = git log --oneline --reverse -- "$($file.FullName)" 2>$null | Select-Object -First 1
                if ($olderCommits) {
                    $firstCommit = ($olderCommits -split " ")[0]
                    $oldContent = git show "$firstCommit`:$relPath" 2>$null
                }
            }
            
            if ($oldContent) {
                # 检查旧版本是否包含 bu.dusays.com 的 webp
                if ($oldContent -match 'bu\.dusays\.com.*\.webp') {
                    Write-Host "  Previous version also has webp, need to go further back..." -ForegroundColor Yellow
                    # 需要继续往前找
                    $allCommits = git log --oneline --reverse -- "$($file.FullName)" 2>$null
                    foreach ($line in $allCommits) {
                        $h = ($line -split " ")[0]
                        $c = git show "$h`:$relPath" 2>$null
                        if ($c -and $c -notmatch 'bu\.dusays\.com.*\.webp') {
                            $oldContent = $c
                            Write-Host "  Found clean version at: $h" -ForegroundColor Gray
                            break
                        }
                    }
                }
                
                # 保存恢复的内容
                if ($oldContent -and ($oldContent -ne $content)) {
                    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                    [System.IO.File]::WriteAllText($file.FullName, $oldContent, $utf8NoBom)
                    Write-Host "  ✓ Restored from git history" -ForegroundColor Green
                    $totalFixed++
                } else {
                    Write-Host "  No changes needed" -ForegroundColor Gray
                }
            } else {
                Write-Host "  Cannot retrieve previous version from git" -ForegroundColor Red
            }
        } catch {
            Write-Host "  Error: $_" -ForegroundColor Red
        }
        
        Write-Host ""
    }
}

Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Restoration complete! Fixed $totalFixed files." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
