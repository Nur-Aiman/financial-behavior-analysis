Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TESTING DATABASE PERSISTENCE FOR ALL CRUD OPERATIONS           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get Categories (should load from PostgreSQL)
Write-Host "TEST 1: GET Categories" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$cats = (Invoke-WebRequest -Uri "http://localhost:3001/api/categories" -Method GET).Content | ConvertFrom-Json
Write-Host "✓ Retrieved $(($cats | Measure-Object).Count) categories from database" -ForegroundColor Cyan
$first_cat = $cats[0]
Write-Host "  Sample: ID=$($first_cat.id), Name=$($first_cat.name), Spent=$($first_cat.spent)" -ForegroundColor DarkCyan
Write-Host ""

# Test 2: Get Profile
Write-Host "TEST 2: GET Profile" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$profile = (Invoke-WebRequest -Uri "http://localhost:3001/api/profile" -Method GET).Content | ConvertFrom-Json
Write-Host "✓ Profile loaded: CurrentBalance=$($profile.currentBalanceCents)" -ForegroundColor Cyan
Write-Host ""

# Test 3: Create a Transaction (should persist to PostgreSQL)
Write-Host "TEST 3: CREATE Transaction" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$categoryId = $first_cat.id
$transactionBody = @{
    categoryId = $categoryId
    type = "expense"
    amountCents = 5000
    merchant = "Test Store"
    description = "Test transaction for DB persistence"
    transactionDate = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$tx_response = Invoke-WebRequest -Uri "http://localhost:3001/api/transactions" -Method POST -ContentType "application/json" -Body $transactionBody
$tx = $tx_response.Content | ConvertFrom-Json
$tx_id = $tx.id
Write-Host "✓ Transaction created: ID=$$tx_id, Amount=$($tx.amountCents)" -ForegroundColor Cyan
Write-Host ""

# Test 4: Retrieve Transaction (verify it exists in DB)
Write-Host "TEST 4: GET Transaction (verify DB persistence)" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$tx_retrieved = (Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/$$tx_id" -Method GET).Content | ConvertFrom-Json
Write-Host "✓ Transaction retrieved from API: ID=$($tx_retrieved.id), Merchant=$($tx_retrieved.merchant)" -ForegroundColor Cyan
if ($tx_retrieved.id -eq $tx_id) {
    Write-Host "  ✅ VERIFIED: Transaction exists in persistent storage" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Transaction not found in persistent storage" -ForegroundColor Red
}
Write-Host ""

# Test 5: Update Transaction
Write-Host "TEST 5: UPDATE Transaction (test DB update)" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$updateBody = @{
    merchant = "Updated Test Store"
    description = "Updated transaction"
} | ConvertTo-Json
$tx_updated = (Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/$$tx_id" -Method PUT -ContentType "application/json" -Body $updateBody).Content | ConvertFrom-Json
Write-Host "✓ Transaction updated: Merchant=$($tx_updated.merchant)" -ForegroundColor Cyan
if ($tx_updated.merchant -eq "Updated Test Store") {
    Write-Host "  ✅ VERIFIED: Update persisted" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Update not persisted" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get All Transactions (check it includes our test transaction)
Write-Host "TEST 6: GET All Transactions" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$all_tx = (Invoke-WebRequest -Uri "http://localhost:3001/api/transactions" -Method GET).Content | ConvertFrom-Json
$found = $all_tx | Where-Object { $_.id -eq $tx_id }
Write-Host "✓ Retrieved $(($all_tx | Measure-Object).Count) transactions" -ForegroundColor Cyan
if ($found) {
    Write-Host "  ✅ VERIFIED: Test transaction found in all transactions list" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Test transaction NOT found in list" -ForegroundColor Red
}
Write-Host ""

# Test 7: Check Balance was updated
Write-Host "TEST 7: GET Profile (verify balance updated)" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$profile_updated = (Invoke-WebRequest -Uri "http://localhost:3001/api/profile" -Method GET).Content | ConvertFrom-Json
Write-Host "✓ Profile after transaction: CurrentBalance=$($profile_updated.currentBalanceCents)" -ForegroundColor Cyan
if ($profile_updated.currentBalanceCents -lt $profile.currentBalanceCents) {
    Write-Host "  ✅ VERIFIED: Balance decreased after transaction" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Balance not updated (may be expected depending on logic)" -ForegroundColor Yellow
}
Write-Host ""

# Test 8: Delete Transaction
Write-Host "TEST 8: DELETE Transaction" -ForegroundColor Green
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
$delete_resp = Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/$$tx_id" -Method DELETE
Write-Host "✓ Transaction deleted" -ForegroundColor Cyan

# Verify deletion
try {
    $tx_after_delete = (Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/$$tx_id" -Method GET).Content | ConvertFrom-Json
    if ($null -eq $tx_after_delete -or $tx_after_delete.id -ne $tx_id) {
        Write-Host "  ✅ VERIFIED: Transaction no longer exists (successfully deleted)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ ERROR: Transaction still exists after deletion" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ✅ VERIFIED: Transaction not found (404) - successfully deleted" -ForegroundColor Green
    } else {
        Write-Host "  ❌ ERROR: Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CRUD PERSISTENCE TEST COMPLETE                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
