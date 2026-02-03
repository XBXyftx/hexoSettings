param(
    [string]$basePath = "$PSScriptRoot\..\source",
    [string]$themePath = "$PSScriptRoot\..\themes\butterfly\source"
)

$imageExtensions = @('.png','.jpg','.jpeg','.gif')
$directories = @('img', 'imgs', '_posts', 'about', 'swiper', 'coffer')
$themeDirectories = @('img')

$cwebpPath = (Get-Command cwebp -ErrorAction SilentlyContinue).Source
if (-not $cwebpPath) {
    $possiblePaths = @("$HOME\scoop\shims\cwebp.exe", "C:\Users\$env:USERNAME\scoop\shims\cwebp.exe")
    foreach ($p in $possiblePaths) { if (Test-Path $p) { $cwebpPath = $p; break } }
}

if (-not $cwebpPath) {
    Write-Host "Error: cwebp not found!" -ForegroundColor Red
    exit 1
}

$gif2webpPath = (Get-Command gif2webp -ErrorAction SilentlyContinue).Source

foreach ($dir in $directories) {
    $fullPath = Join-Path $basePath $dir
    if (Test-Path $fullPath) {
        Write-Host "--- Scanning Directory: ${dir} ---" -ForegroundColor Cyan
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        
        $imgCount = 0
        foreach ($file in $files) {
            $ext = $file.Extension.ToLower()
            if ($imageExtensions -contains $ext) {
                $imgCount++
                $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, 'webp')
                
                if (-not (Test-Path $webpPath) -or ($file.LastWriteTime -gt (Get-Item $webpPath).LastWriteTime)) {
                    try {
                        if ($ext -eq '.gif') {
                            if ($gif2webpPath) { & "$gif2webpPath" -q 75 -mixed "$($file.FullName)" -o "$webpPath" }
                        } else {
                            & "$cwebpPath" -q 75 "$($file.FullName)" -o "$webpPath"
                        }
                        Write-Host "  [OK] $($file.Name) -> WebP" -ForegroundColor Green
                    } catch {
                        Write-Host "  [Failed] $($file.Name)" -ForegroundColor Red
                    }
                }
            }
        }
        Write-Host "Finished ${dir}. Processed ${imgCount} images." -ForegroundColor Gray
    }
}

# Process theme directories
foreach ($dir in $themeDirectories) {
    $fullPath = Join-Path $themePath $dir
    if (Test-Path $fullPath) {
        Write-Host "--- Scanning Theme Directory: ${dir} ---" -ForegroundColor Cyan
        $files = Get-ChildItem -Path $fullPath -Recurse -File
        
        $imgCount = 0
        foreach ($file in $files) {
            $ext = $file.Extension.ToLower()
            if ($imageExtensions -contains $ext) {
                $imgCount++
                $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, 'webp')
                
                if (-not (Test-Path $webpPath) -or ($file.LastWriteTime -gt (Get-Item $webpPath).LastWriteTime)) {
                    try {
                        if ($ext -eq '.gif') {
                            if ($gif2webpPath) { & "$gif2webpPath" -q 75 -mixed "$($file.FullName)" -o "$webpPath" }
                        } else {
                            & "$cwebpPath" -q 75 "$($file.FullName)" -o "$webpPath"
                        }
                        Write-Host "  [OK] $($file.Name) -> WebP" -ForegroundColor Green
                    } catch {
                        Write-Host "  [Failed] $($file.Name)" -ForegroundColor Red
                    }
                }
            }
        }
        Write-Host "Finished theme/${dir}. Processed ${imgCount} images." -ForegroundColor Gray
    }
}
Write-Host "Success: All assets optimized!" -ForegroundColor Yellow
