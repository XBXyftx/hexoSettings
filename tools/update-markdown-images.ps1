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
    try {
        # 使用 UTF8 编码读取
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        
        foreach ($ext in $imageExtensions) {
            $escExt = [regex]::Escape($ext)
            $pattern = "(?<=\()([^)]+)$escExt(?=\))"
            $content = [regex]::Replace($content, $pattern, { param($m) $m.Value -replace $escExt, ".webp" }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            
            $htmlPattern = "(?<=src=[""'])([^""']+)$escExt(?=[""'])"
            $content = [regex]::Replace($content, $htmlPattern, { param($m) $m.Value -replace $escExt, ".webp" }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        }

        if ($content -ne $originalContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Fixed & Updated: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}
Write-Host "Markdown encoding fix & update completed!" -ForegroundColor Yellow
