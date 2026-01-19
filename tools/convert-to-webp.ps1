param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

$imageExtensions = @('.png','.jpg','.jpeg','.gif')
$directories = @('imgs', '_posts', 'about', 'swiper', 'coffer')

# 1. 查找 cwebp 路径
$cwebpPath = (Get-Command cwebp -ErrorAction SilentlyContinue).Source
if (-not $cwebpPath) {
    # 尝试所有可能的 Scoop 路径
    $possiblePaths = @(
        "$HOME\scoop\shims\cwebp.exe",
        "C:\Users\$env:USERNAME\scoop\shims\cwebp.exe",
        "C:\ProgramData\scoop\shims\cwebp.exe"
    )
    foreach ($p in $possiblePaths) {
        if (Test-Path $p) { $cwebpPath = $p; break }
    }
}

if (-not $cwebpPath) {
    Write-Host "Error: cwebp not found! Please check if libwebp is installed." -ForegroundColor Red
    exit 1 # 强制报错中止，让 npm run pub 停止执行后续步骤
}

# 2. 查找 gif2webp 路径
$gif2webpPath = (Get-Command gif2webp -ErrorAction SilentlyContinue).Source
if (-not $gif2webpPath) {
    $gifPath = "$HOME\scoop\shims\gif2webp.exe"
    if (Test-Path $gifPath) { $gif2webpPath = $gifPath }
}

Write-Host "Using cwebp: $cwebpPath" -ForegroundColor Gray

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    if (Test-Path $fullPath) {
        Write-Host "Processing directory: $fullPath" -ForegroundColor Cyan
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        
        foreach ($file in $files) {
            $ext = $file.Extension.ToLower()
            if ($imageExtensions -contains $ext) {
                $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, 'webp')
                
                # 逻辑：WebP 不存在或原图更新了就转换
                if (-not (Test-Path $webpPath) -or ($file.LastWriteTime -gt (Get-Item $webpPath).LastWriteTime)) {
                    if ($ext -eq '.gif') {
                        if ($gif2webpPath) {
                            & $gif2webpPath -q 75 -mixed "$($file.FullName)" -o "$webpPath"
                        }
                    } else {
                        & $cwebpPath -q 75 "$($file.FullName)" -o "$webpPath"
                    }
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Converted: $($file.Name) -> WebP" -ForegroundColor Green
                    }
                }
            }
        }
    }
}
Write-Host "Optimization Task Finished!" -ForegroundColor Gold
