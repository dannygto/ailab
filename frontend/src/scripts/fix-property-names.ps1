#!/usr/bin/env powershell
# Fix LabelIcon property issues - replace with correct property names

Write-Host "Fixing LabelIcon property issues..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix property access patterns
    $patterns = @{
        # Fix object property access
        "\.LabelIcon" = ".label"
        "LabelIcon:" = "label:"
        "LabelIcon," = "label,"
        "LabelIcon}" = "label}"
        "LabelIcon " = "label "
        # Fix CategoryIcon property
        "\.CategoryIcon" = ".category"
        "CategoryIcon:" = "category:"
        "CategoryIcon," = "category,"
        "CategoryIcon}" = "category}"
        "CategoryIcon " = "category "
        # Fix DescriptionIcon property
        "\.DescriptionIcon" = ".description"
        "DescriptionIcon:" = "description:"
        "DescriptionIcon," = "description,"
        "DescriptionIcon}" = "description}"
        "DescriptionIcon " = "description "
        # Fix PaletteIcon property
        "\.PaletteIcon" = ".palette"
        "PaletteIcon:" = "palette:"
        "PaletteIcon," = "palette,"
        "PaletteIcon}" = "palette}"
        "PaletteIcon " = "palette "
        # Fix StopIcon/PauseIcon as methods
        "\.StopIcon\(\)" = ".stop()"
        "\.PauseIcon\(\)" = ".pause()"
        "\.onStopIcon" = ".onstop"
        # Fix component references
        "component=`"LabelIcon`"" = "component=`"label`""
        "component='LabelIcon'" = "component='label'"
        # Fix theme property
        "theme\.PaletteIcon" = "theme.palette"
        # Fix JSX element types
        "<LabelIcon" = "<label"
        "</LabelIcon>" = "</label>"
        # Fix variable names in loops
        "LabelIcon\s*}" = "label }"
        "LabelIcon\s*\)" = "label )"
        # Fix action types
        "'PauseIcon'" = "'pause'"
        "'StopIcon'" = "'stop'"
        "'RefreshIcon'" = "'refresh'"
        "'ShareIcon'" = "'share'"
        # Fix form config
        "label:" = "label:"
        # Fix step labels
        "Step key=\{LabelIcon\}" = "Step key=\{label\}"
        "StepLabel>\{LabelIcon\}" = "StepLabel>\{label\}"
        # Fix cannot find name errors
        "Cannot find name 'LabelIcon'" = "Use 'label' instead"
        "\{LabelIcon\}" = "\{label\}"
        "LabelIcon\[" = "label["
        "LabelIcon\." = "label."
        "\$\{LabelIcon\}" = "\$\{label\}"
    }
    
    foreach ($pattern in $patterns.Keys) {
        $replacement = $patterns[$pattern]
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "LabelIcon property issues fixed!" -ForegroundColor Green
