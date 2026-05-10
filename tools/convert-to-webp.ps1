param(
    [string]$basePath = "$PSScriptRoot\..\source",
    [string]$themePath = "$PSScriptRoot\..\themes\butterfly\source"
)

$imageExtensions = @('.png','.jpg','.jpeg','.gif')
$directories = @('img', 'imgs', '_posts', 'about', 'swiper', 'coffer', 'birthday-gift')
$themeDirectories = @('img')

# Find cwebp tool
$cwebpPath = (Get-Command cwebp -ErrorAction SilentlyContinue).Source
if (-not $cwebpPath) {
    $possiblePaths = @("$HOME\scoop\shims\cwebp.exe", "C:\Users\$env:USERNAME\scoop\shims\cwebp.exe")
    foreach ($p in $possiblePaths) { if (Test-Path $p) { $cwebpPath = $p; break } }
}

if (-not $cwebpPath) {
    Write-Host 'Error: cwebp not found!' -ForegroundColor Red
    exit 1
}

$gif2webpPath = (Get-Command gif2webp -ErrorAction SilentlyContinue).Source

# Validate WebP file
function Test-WebPValid {
    param([string]$webpFile)
    if (-not (Test-Path $webpFile)) { return $false }
    $fileInfo = Get-Item $webpFile
    return $fileInfo.Length -gt 0
}

# Delete source file
function Remove-SourceImage {
    param([string]$sourceFile)
    try {
        Remove-Item $sourceFile -Force
        Write-Host '  [Deleted] Source deleted' -ForegroundColor Yellow
        return $true
    } catch {
        Write-Host "  [Error] Delete failed: $_" -ForegroundColor Red
        return $false
    }
}

# Process single image
function Process-Image {
    param(
        [System.IO.FileInfo]$file,
        [string]$cwebpPath,
        [string]$gif2webpPath
    )
    
    $ext = $file.Extension.ToLower()
    $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, 'webp')
    $webpExists = Test-Path $webpPath
    $webpValid = Test-WebPValid $webpPath
    
    # Case 1: WebP not exist or need update
    if (-not $webpExists -or ($file.LastWriteTime -gt (Get-Item $webpPath).LastWriteTime)) {
        $convertSuccess = $false
        
        try {
            if ($ext -eq '.gif') {
                if ($gif2webpPath) {
                    & "$gif2webpPath" -q 75 -mixed "$($file.FullName)" -o "$webpPath"
                    $convertSuccess = ($LASTEXITCODE -eq 0) -and (Test-WebPValid $webpPath)
                } else {
                    Write-Host "  [Skip] gif2webp not found: $($file.Name)" -ForegroundColor Yellow
                    return
                }
            } else {
                & "$cwebpPath" -q 75 "$($file.FullName)" -o "$webpPath"
                $convertSuccess = ($LASTEXITCODE -eq 0) -and (Test-WebPValid $webpPath)
            }
            
            if ($convertSuccess) {
                Write-Host "  [OK] $($file.Name) -> WebP" -ForegroundColor Green
                Remove-SourceImage $file.FullName | Out-Null
            } else {
                Write-Host "  [Failed] Convert failed: $($file.Name)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  [Failed] Convert exception: $($file.Name) - $_" -ForegroundColor Red
        }
    }
    # Case 2: WebP exists and valid, delete source
    elseif ($webpValid) {
        Write-Host "  [Exists] WebP exists: $($file.Name)" -ForegroundColor Blue
        Remove-SourceImage $file.FullName | Out-Null
    }
    # Case 3: WebP invalid, reconvert
    else {
        Write-Host "  [Invalid] WebP corrupted, reconverting: $($file.Name)" -ForegroundColor Magenta
        Remove-Item $webpPath -Force -ErrorAction SilentlyContinue
        
        try {
            $convertSuccess = $false
            if ($ext -eq '.gif') {
                if ($gif2webpPath) {
                    & "$gif2webpPath" -q 75 -mixed "$($file.FullName)" -o "$webpPath"
                    $convertSuccess = ($LASTEXITCODE -eq 0) -and (Test-WebPValid $webpPath)
                }
            } else {
                & "$cwebpPath" -q 75 "$($file.FullName)" -o "$webpPath"
                $convertSuccess = ($LASTEXITCODE -eq 0) -and (Test-WebPValid $webpPath)
            }
            
            if ($convertSuccess) {
                Write-Host "  [OK] $($file.Name) -> WebP" -ForegroundColor Green
                Remove-SourceImage $file.FullName | Out-Null
            } else {
                Write-Host "  [Failed] Reconvert failed: $($file.Name)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  [Failed] Reconvert exception: $($file.Name) - $_" -ForegroundColor Red
        }
    }
}

# Process content directories
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
                Process-Image -file $file -cwebpPath $cwebpPath -gif2webpPath $gif2webpPath
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
                Process-Image -file $file -cwebpPath $cwebpPath -gif2webpPath $gif2webpPath
            }
        }
        Write-Host "Finished theme/${dir}. Processed ${imgCount} images." -ForegroundColor Gray
    }
}

Write-Host 'Success: All assets optimized and source images cleaned!' -ForegroundColor Yellow
