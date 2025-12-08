# Quick Lighthouse Performance & Security Check
# Run this after deployments to verify site health

param(
    [string]$url = "https://cyberguardng.ca"
)

Write-Host "=== LIGHTHOUSE AUDIT ===" -ForegroundColor Cyan
Write-Host "Testing: $url" -ForegroundColor Gray
Write-Host ""

# Create reports directory
$reportsDir = "lighthouse-reports"
if (!(Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$htmlReport = "$reportsDir/lighthouse-$timestamp.html"

Write-Host "Running Lighthouse audit (this may take 30-60 seconds)..." -ForegroundColor Yellow

# Run Lighthouse with HTML output
lighthouse $url `
    --output html `
    --output-path $htmlReport `
    --chrome-flags="--headless" `
    --quiet 2>&1 | Out-Null

if (Test-Path $htmlReport) {
    Write-Host ""
    Write-Host "✓ Audit complete!" -ForegroundColor Green
    Write-Host "Report saved: $htmlReport" -ForegroundColor Cyan
    Write-Host ""
    
    # Open report in browser
    Write-Host "Opening report in browser..." -ForegroundColor Gray
    Start-Process $htmlReport
} else {
    Write-Host ""
    Write-Host "✗ Audit failed. Try running manually:" -ForegroundColor Red
    Write-Host "  lighthouse $url --view" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Key metrics to check:" -ForegroundColor Cyan
Write-Host "  - Performance: Should be 90+" -ForegroundColor Gray
Write-Host "  - Best Practices: Should be 100" -ForegroundColor Gray
Write-Host "  - Security headers: Check for CSP, HSTS, etc." -ForegroundColor Gray
Write-Host ""
