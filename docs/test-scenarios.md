# StockHaus Comprehensive Test Scenarios

## Test Plan - All Scenarios

### 1. Authentication & Login
- [ ] Login with valid credentials (admin/admin)
- [ ] Login with valid credentials (arpit/arpit)
- [ ] Login with valid credentials (user/user@123)
- [ ] Login with invalid username - should show "Invalid credentials"
- [ ] Login with invalid password - should show "Invalid credentials"
- [ ] Login with empty fields - should show validation error
- [ ] Session persistence - refresh page, should stay logged in
- [ ] Logout - clear session and redirect to login

### 2. Project Management
- [ ] Create new project with name only
- [ ] Create new project with name and description
- [ ] View all projects
- [ ] Select project - should become active
- [ ] Active project should be persisted in localStorage
- [ ] Delete project - should confirm before deletion
- [ ] After delete, active project should be cleared if it was the deleted one
- [ ] Add item when no project selected - should show error

### 3. Adding Items (Upload Form)
- [ ] Upload image - should show preview
- [ ] Change image - should replace preview
- [ ] Enter Serial Number
- [ ] Enter Item Name
- [ ] Enter Width and Height with proper validation
- [ ] Select Unit (cm or in)
- [ ] Enter Quantity (must be > 0)
- [ ] Enter Rate (optional, should handle decimals)
- [ ] Submit form - should show success message
- [ ] Form should reset after successful submission
- [ ] Submit without image - should show error
- [ ] Submit with incomplete fields - should show validation error
- [ ] Image compression - large images should be compressed to max 800x800

### 4. Dashboard Display
- [ ] Load and display all items in table
- [ ] Show total inventory value
- [ ] Show total quantity
- [ ] Show unique titles count
- [ ] Display image thumbnails
- [ ] Display correct columns: Serial #, Item Name, Dimensions, Qty, Rate
- [ ] No "Total" column displayed
- [ ] No "Date Added" column displayed

### 5. Search & Filter
- [ ] Search by serial number
- [ ] Search by item name
- [ ] Case-insensitive search
- [ ] Clear search - show all items

### 6. Sorting
- [ ] Sort by Serial Number (ascending/descending)
- [ ] Sort by Item Name (ascending/descending)
- [ ] Sort by Quantity (ascending/descending)
- [ ] Sort by Rate (ascending/descending)
- [ ] Sort by Date Created (ascending/descending)

### 7. Item Actions
- [ ] Click image thumbnail - show modal preview
- [ ] Close preview modal - should clear
- [ ] Delete item - should confirm before deletion
- [ ] After delete, list should refresh
- [ ] Edit item (if available) - should update correctly

### 8. Excel Export
- [ ] Export generates Excel file
- [ ] Excel file downloads with correct name: "StockHaus_Inventory.xlsx"
- [ ] Column 1: Item Image (with embedded image, maintaining aspect ratio)
- [ ] Column 2: Serial Number
- [ ] Column 3: Item Name
- [ ] Column 4: Width
- [ ] Column 5: Height
- [ ] Column 6: Unit
- [ ] Column 7: Quantity
- [ ] Column 8: Rate (INR)
- [ ] Images embedded in cells (not just URLs)
- [ ] Images maintain aspect ratio
- [ ] No "Total Value" column in export
- [ ] No "Date Added" column in export
- [ ] Export with 0 items - should create empty sheet with headers
- [ ] Export with items missing images - should handle gracefully
- [ ] Export with items having rate = 0 or undefined - should handle correctly

### 9. UI/UX
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Loading states show spinner
- [ ] Error messages display clearly
- [ ] Success messages auto-dismiss after 3 seconds
- [ ] All buttons are clickable and responsive

### 10. Data Validation
- [ ] Serial Number - cannot be empty
- [ ] Item Name - cannot be empty
- [ ] Width - must be > 0
- [ ] Height - must be > 0
- [ ] Quantity - must be integer > 0
- [ ] Rate - must be >= 0 if provided
- [ ] Image - required for adding items
- [ ] Unit - must be 'cm' or 'in'

### 11. API Integration
- [ ] Server is running on port 4000
- [ ] Server loads .env correctly from /server/.env
- [ ] Auth users are loaded from .env AUTH_USERS
- [ ] Login endpoint responds correctly
- [ ] Projects endpoints work (GET, POST, DELETE)
- [ ] Paintings endpoints work (GET, POST, PUT, DELETE)
- [ ] Supabase connection works
- [ ] Image storage works (images uploaded to Supabase)
- [ ] CORS headers are correct

### 12. Edge Cases
- [ ] Very long item names - should display correctly
- [ ] Very long serial numbers - should display correctly
- [ ] Very large quantities (999,999)
- [ ] Very large rates (999,999.99)
- [ ] Decimal dimensions (0.5 cm, etc.)
- [ ] Items with rate = 0 - should display "-" in UI
- [ ] Items without rate - should display "-" in UI
- [ ] Empty project (no items) - should show helpful message
- [ ] Network error - should show error message
- [ ] Session timeout - should redirect to login

## Test Execution Notes

### Manual Testing Checklist:
1. Start dev server: `npm run dev:full`
2. Navigate to http://localhost:3000
3. Execute tests in order
4. Document any failures with:
   - Test number and name
   - Expected result
   - Actual result
   - Steps to reproduce

### Browser Testing:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Testing:
- Export with 50+ items - should complete in < 5 seconds
- Search with 50+ items - should be instant
- Sort with 50+ items - should be instant
- Large image upload - should compress and upload successfully

---

## Issues Found During Testing:
(Document any bugs or issues here)

