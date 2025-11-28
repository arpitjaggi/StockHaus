# Quick Start Testing Guide - StockHaus

## Pre-Test Checklist
- [x] Server running on port 4000
- [x] Client running on port 3000
- [x] .env file configured with test credentials
- [x] Supabase connection configured
- [x] No compilation errors

## Quick Test Flow (5 minutes)

### 1. Login Test (30 seconds)
```
1. Go to http://localhost:3000
2. Login with: admin / admin
3. Verify: Dashboard loads without errors
```

### 2. Project Creation Test (1 minute)
```
1. Click "Create First Project" or "New Project"
2. Enter: "Test Project"
3. Click "Create Project"
4. Verify: Redirected to dashboard
5. Verify: Project appears in list
```

### 3. Item Upload Test (2 minutes)
```
1. Click "Add New Inventory" button
2. Upload an image (any test image)
3. Fill in form:
   - Serial Number: TEST-001
   - Item Name: Test Painting
   - Width: 50
   - Height: 100
   - Unit: cm
   - Quantity: 5
   - Rate: 1000
4. Click "Save Item"
5. Verify: Success message appears
6. Verify: Form resets
```

### 4. Dashboard Test (1 minute)
```
1. Click "View Dashboard"
2. Verify: Item appears in table
3. Verify: Total stats updated
4. Verify: No "Total" column visible
5. Verify: No "Date Added" column visible
6. Click image thumbnail - verify preview modal
7. Close modal with X button
```

### 5. Search Test (30 seconds)
```
1. Type "TEST" in search box
2. Verify: Item is filtered
3. Clear search
4. Verify: Item reappears
```

### 6. Export Test (1 minute)
```
1. Click "Export Excel"
2. Verify: File downloads
3. Open file in Excel/Sheets
4. Verify:
   - Column 1: Item Image (with image embedded)
   - Column 2: Serial Number (TEST-001)
   - Column 3: Item Name (Test Painting)
   - Column 4: Width (50)
   - Column 5: Height (100)
   - Column 6: Unit (cm)
   - Column 7: Quantity (5)
   - Column 8: Rate (1000)
```

### 7. Delete Test (30 seconds)
```
1. Click trash icon on item row
2. Confirm deletion
3. Verify: Item removed from table
4. Verify: Stats updated
```

---

## Full Scenario Tests

### Scenario A: Multiple Projects
1. Create "Project A" with 3 items
2. Create "Project B" with 2 items
3. Switch between projects
4. Verify: Each shows correct items
5. Export each separately
6. Delete one project
7. Verify: Only one remains

### Scenario B: Edge Cases
1. Add item with rate = 0
   - Verify: Shows "-" in UI
2. Add item without rate
   - Verify: Shows "-" in UI  
3. Add item with very long name
   - Verify: Wraps or truncates properly
4. Add item with decimal dimensions (0.5)
   - Verify: Saves and displays correctly
5. Search with special characters
   - Verify: Doesn't break

### Scenario C: Sorting
1. Add multiple items
2. Sort by Serial Number (asc)
3. Sort by Serial Number (desc)
4. Sort by Quantity
5. Sort by Rate
6. Verify: Order changes correctly

### Scenario D: Mobile Responsive
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test on iPhone SE (375px)
4. Test on iPad (768px)
5. Verify:
   - No horizontal scroll (except table)
   - Buttons are clickable
   - Forms are usable
   - Text is readable

### Scenario E: Session Management
1. Login with admin
2. Create project
3. Add 2 items
4. Refresh page (F5)
5. Verify: Still logged in
6. Verify: Project still active
7. Verify: Items still visible
8. Close browser tab
9. Reopen and go to localhost:3000
10. Verify: Still logged in

### Scenario F: Image Handling
1. Upload small image (< 100KB)
   - Verify: Works instantly
2. Upload large image (> 5MB)
   - Verify: Compressed before upload
3. Upload non-JPEG image (PNG/WebP)
   - Verify: Converted to JPEG
4. Try uploading without image
   - Verify: Error shows
5. Change image before submit
   - Verify: Latest image is used

---

## Expected Results Summary

| Test | Expected | Status |
|------|----------|--------|
| Login | Success with token | ✅ |
| Project Create | Project appears in list | ✅ |
| Item Add | Item in table, success msg | ✅ |
| Dashboard Display | All items visible | ✅ |
| Search | Filters items | ✅ |
| Sort | Order changes | ✅ |
| Delete | Item removed | ✅ |
| Export | Excel file with images | ✅ |
| Mobile | Responsive layout | 🔄 |
| Session | Persists on refresh | 🔄 |

---

## Common Issues & Solutions

### Issue: "Unable to create session"
**Solution:** Check .env is loaded on server startup. Look for "✓ Loaded .env from:" in server logs

### Issue: Export fails silently
**Solution:** Open DevTools console (F12) and check error. May be CORS issue with Supabase images

### Issue: Images not showing in table
**Solution:** Check Supabase storage is configured and public bucket exists

### Issue: Form won't submit
**Solution:** Check all required fields are filled. Use DevTools to inspect validation errors

### Issue: Search doesn't work
**Solution:** Check search term case sensitivity (should work anyway)

### Issue: Mobile layout broken
**Solution:** Disable zoom in browser or check CSS media queries

---

## Test Report Template

```markdown
## Test Report - [DATE]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Tablet/Mobile]
- Server: [Running/Error]
- Client: [Running/Error]

### Tests Passed: X/X

### Issues Found:
1. [Issue description]
   - Steps to reproduce: 
   - Expected: 
   - Actual: 
   - Severity: [Low/Medium/High/Critical]

### Recommendations:
- 

### Sign-off: [Name] - [Date]
```

---

## Next Steps After Testing

1. Document all issues found
2. Prioritize by severity
3. Create GitHub issues
4. Plan fixes for next sprint
5. Re-test after fixes
6. Deploy to staging
7. User acceptance testing

---

**Good luck with testing! 🚀**

