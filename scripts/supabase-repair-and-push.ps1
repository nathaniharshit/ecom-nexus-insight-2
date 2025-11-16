# Supabase Migration Repair and Push Script
# This script fixes migration history mismatch and pushes orders table creation

Write-Host "Starting Supabase migration repair process..." -ForegroundColor Cyan

# Step 1: Create backup directory
Write-Host "Creating backup of existing migrations..." -ForegroundColor Yellow
if (!(Test-Path "supabase\migrations_backup")) {
    New-Item -ItemType Directory -Path "supabase\migrations_backup" -Force | Out-Null
}

# Backup existing migration files
Copy-Item "supabase\migrations\*.sql" "supabase\migrations_backup\" -Force
Write-Host "Backup created in supabase\migrations_backup\" -ForegroundColor Green

# Step 2: Repair migration history for remote-only versions
Write-Host "Repairing migration history for remote versions..." -ForegroundColor Yellow
try {
    $repairResult = supabase migration repair --status reverted 20250715024201 20250716074114 20250722051231 20250802112753 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration history repaired successfully" -ForegroundColor Green
    } else {
        Write-Host "Repair had issues, but continuing..." -ForegroundColor Yellow
        Write-Host $repairResult -ForegroundColor Gray
    }
} catch {
    Write-Host "Repair command failed, but continuing..." -ForegroundColor Yellow
}

# Step 3: Pull current remote schema
Write-Host "Pulling current remote schema..." -ForegroundColor Yellow
try {
    $pullResult = supabase db pull 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Remote schema pulled successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to pull remote schema:" -ForegroundColor Red
        Write-Host $pullResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Pull command failed" -ForegroundColor Red
    exit 1
}

# Step 4: Remove problematic migration files
Write-Host "Removing malformed migration files..." -ForegroundColor Yellow
$filesToRemove = @(
    "supabase\migrations\20250715144212-940660bd-ed1b-4bd4-8142-63697c576b5d.sql",
    "supabase\migrations\20250716074125-d41b55a2-8750-4b6d-8716-3933ad12ac08.sql",
    "supabase\migrations\20250722051238-96b3f66e-058b-4fa5-8362-5b74032fa95e.sql",
    "supabase\migrations\20250802112758_df983a82-5335-4bac-a770-47fa5fe743bc.sql"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Removed: $file" -ForegroundColor Gray
    }
}
Write-Host "Malformed migration files removed" -ForegroundColor Green

# Step 5: List remaining migrations
Write-Host "Current migrations:" -ForegroundColor Yellow
Get-ChildItem "supabase\migrations\*.sql" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

# Step 6: Push migrations
Write-Host "Pushing migrations to remote database..." -ForegroundColor Yellow
try {
    $pushResult = supabase db push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations pushed successfully!" -ForegroundColor Green
        Write-Host "Orders and order_items tables should now be created!" -ForegroundColor Green
        Write-Host "" 
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Reload your Analytics page" -ForegroundColor White
        Write-Host "  2. The 'relation does not exist' error should be gone" -ForegroundColor White
        Write-Host "  3. Create test orders to see real analytics data" -ForegroundColor White
    } else {
        Write-Host "Failed to push migrations:" -ForegroundColor Red
        Write-Host $pushResult -ForegroundColor Red
        Write-Host ""
        Write-Host "You may need to:" -ForegroundColor Yellow
        Write-Host "  1. Check if you have sufficient permissions" -ForegroundColor White
        Write-Host "  2. Or apply the SQL manually in Supabase Dashboard" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "Push command failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Migration repair process completed!" -ForegroundColor Green