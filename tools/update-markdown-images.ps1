param(
    [string]$basePath = "$PSScriptRoot\..\source"
)

$directories = @('_posts', 'about', 'coffer')
$imageExtensions = @('.png','.jpg','.jpeg','.gif')

$markdownFiles = Get-ChildItem -Path $basePath -Recurse -Include "*.md" | 
    Where-Object { 
        $_.DirectoryName -match "($($directories -join '|'))" -and
        $_.LastWriteTime -gt (Get-Date).AddDays(-7) 
    }

foreach ($file in $markdownFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    foreach ($ext in $imageExtensions) {
        $escExt = [regex]::Escape($ext)
        # Regex for Markdown ![alt](path.ext)
        $pattern = "(?<=\()([^)]+)$escExt(?=\))"
        $content = [regex]::Replace($content, $pattern, { param($m) $m.Value -replace $escExt, ".webp" }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        # Regex for HTML src="path.ext"
        $htmlPattern = "(?<=src=[""'])([^""']+)$escExt(?=[""'])"
        $content = [regex]::Replace($content, $htmlPattern, { param($m) $m.Value -replace $escExt, ".webp" }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    }

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated Markdown reference: $($file.Name)" -ForegroundColor Green
    }
}
Write-Host "Markdown image references updated!" -ForegroundColor Yellow
