# Security Testing Automation Scripts
# Run these commands regularly to keep your site secure

## 1. Weekly Security Scan (Run Every Monday)

Write-Host "=== CYBERGUARDNG SECURITY SCAN ===" -ForegroundColor Cyan
Write-Host ""

# 1. npm audit
Write-Host "1. Running npm audit..." -ForegroundColor Yellow
cd react-site
npm audit
Write-Host ""

# 2. Check for outdated packages
Write-Host "2. Checking for outdated packages..." -ForegroundColor Yellow
npm outdated
Write-Host ""

# 3. Snyk test (if authenticated)
Write-Host "3. Running Snyk security scan..." -ForegroundColor Yellow
$snykResult = snyk test 2>&1
if ($snykResult -like "*Use ``snyk auth``*") {
    Write-Host "   Snyk not authenticated. Run: snyk auth" -ForegroundColor Red
} else {
    $snykResult
}
Write-Host ""

# 4. Check React version
Write-Host "4. Checking React version..." -ForegroundColor Yellow
$reactVersion = npm list react --depth=0 | Select-String "react@"
Write-Host "   Current: $reactVersion"
Write-Host "   Latest stable: Check https://react.dev/blog" -ForegroundColor Gray
Write-Host ""

# 5. Summary
Write-Host "=== SCAN COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Review any vulnerabilities above"
Write-Host "  - Run 'npm audit fix' to auto-fix issues"
Write-Host "  - Update outdated packages carefully"
Write-Host "  - Check SECURITY_TESTING_PLAN.md for details"
Write-Host ""
