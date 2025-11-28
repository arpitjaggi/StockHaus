# Issue #1: Serial Number Uniqueness - Implementation Guide

## Problem Statement
Currently, the system allows multiple items with the same serial number within a project, which violates inventory tracking best practices.

**Example:**
- Project: "Summer Collection"
- Item 1: Serial "PAINT-001", Name: "Sunset"
- Item 2: Serial "PAINT-001", Name: "Sunrise" ← Should be rejected

---

## Impact Analysis

### User Impact
- Inventory confusion
- Inaccurate stock counts
- Reporting errors

### System Impact  
- Excel exports may be ambiguous
- Search results could be confusing
- Audit trails compromised

### Severity
**🔴 HIGH** - Core inventory integrity issue

---

## Current Code Examination

### Frontend Validation (Missing)
**File:** `/pages/UploadForm.tsx`
```typescript
// Currently: No check for duplicate serial numbers
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation ...
  await db.addPainting({
    serialNumber: formData.serialNumber,  // ← No uniqueness check
    // ... other fields
  });
}
```

### Backend Validation (Missing)
**File:** `/server/src/index.ts` - POST `/api/projects/:projectId/paintings`
```typescript
// Currently: No constraint on serial number uniqueness
app.post('/api/projects/:projectId/paintings', authenticate, async (req, res) => {
  // Validates schema but not uniqueness
  const parsed = paintingSchema.safeParse(req.body);
  
  // Direct insert without uniqueness check
  const { data, error } = await supabase
    .from('paintings')
    .insert({...}) // ← No serial number check
    .select()
    .single();
});
```

### Database Schema (Not Checked)
The Supabase database may not have a unique constraint on `(project_id, serial_number)`.

---

## Solution Approach

### Option A: Backend Validation (Recommended)
**Pros:** Enforced at data layer, prevents duplicates from any source
**Cons:** Requires backend change and Supabase migration

**Implementation:**

1. **Add Supabase constraint:**
   ```sql
   ALTER TABLE paintings 
   ADD CONSTRAINT unique_serial_per_project 
   UNIQUE(project_id, serial_number);
   ```

2. **Update backend to check:**
   ```typescript
   app.post('/api/projects/:projectId/paintings', authenticate, async (req, res) => {
     const parsed = paintingSchema.safeParse(req.body);
     if (!parsed.success) {
       return res.status(400).json({ errors: parsed.error.flatten() });
     }

     // Check for duplicate serial number
     const { data: existing } = await supabase
       .from('paintings')
       .select('id')
       .eq('project_id', projectId)
       .eq('serial_number', parsed.data.serialNumber)
       .maybeSingle();

     if (existing) {
       return res.status(409).json({ 
         message: `Serial number "${parsed.data.serialNumber}" already exists in this project.` 
       });
     }

     // Proceed with insert
     const { data, error } = await supabase
       .from('paintings')
       .insert({...})
       .select()
       .single();
   });
   ```

### Option B: Frontend Validation (Quick Fix)
**Pros:** Can be implemented immediately, instant user feedback
**Cons:** Not enforced at data layer, can be bypassed

**Implementation:**

```typescript
// In UploadForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.image) {
    alert("Please upload an image of the painting.");
    return;
  }

  // NEW: Check for duplicate serial number
  const existingPaintings = await db.getAllPaintings();
  const isDuplicate = existingPaintings.some(
    p => p.serialNumber === formData.serialNumber
  );
  
  if (isDuplicate) {
    alert(`Serial number "${formData.serialNumber}" already exists in this project.`);
    return;
  }

  setIsSubmitting(true);
  try {
    await db.addPainting({...});
    // ... rest of code
  }
};
```

### Option C: Both (Recommended Complete Solution)
**Implement both frontend AND backend validation:**
- Frontend: Immediate user feedback
- Backend: Data integrity enforcement

---

## Recommended Implementation

### Step 1: Backend Enhancement (Do First)

**File:** `/server/src/index.ts` - Update POST `/api/projects/:projectId/paintings`

```typescript
app.post('/api/projects/:projectId/paintings', authenticate, async (req: AuthenticatedRequest, res) => {
  const parsed = paintingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const project = await verifyProjectOwnership(req.params.projectId, req.user!.supabaseUserId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  try {
    // NEW: Check for duplicate serial number within this project
    const { data: existing, error: checkError } = await supabase
      .from('paintings')
      .select('serial_number')
      .eq('project_id', project.id)
      .eq('serial_number', parsed.data.serialNumber)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      return res.status(409).json({ 
        message: `Serial number "${parsed.data.serialNumber}" already exists in this project.` 
      });
    }

    // Proceed with existing image upload and insert logic
    const imageUrl = await uploadImage(req.user!.supabaseUserId, project.id, parsed.data.imageBase64);
    const timestamp = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('paintings')
      .insert({...})
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    await refreshProjectMetadata(project.id);
    return res.status(201).json(mapPainting(data));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Unable to save painting.' });
  }
});
```

### Step 2: Frontend Enhancement (Optional for better UX)

**File:** `/pages/UploadForm.tsx` - Add pre-submission check

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.image) {
    alert("Please upload an image of the painting.");
    return;
  }

  // NEW: Pre-check for duplicate (better UX)
  try {
    const existingPaintings = await db.getAllPaintings();
    const isDuplicate = existingPaintings.some(
      p => p.serialNumber.toLowerCase() === formData.serialNumber.toLowerCase()
    );
    
    if (isDuplicate) {
      alert(`⚠️ Serial number "${formData.serialNumber}" already exists in this project. Please use a different serial number.`);
      return;
    }
  } catch (err) {
    // If pre-check fails, let the server validation catch it
    console.warn('Could not pre-check duplicates:', err);
  }

  setIsSubmitting(true);

  try {
    await db.addPainting({...});
    setShowSuccess(true);
    setFormData(INITIAL_STATE);
    setTimeout(() => setShowSuccess(false), 3000);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error saving painting data.";
    alert(message); // Will show server response like "Serial number already exists"
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 3: Database Constraint (Optional but Recommended)

In Supabase dashboard, run migration:

```sql
-- Add unique constraint on (project_id, serial_number)
ALTER TABLE paintings 
ADD CONSTRAINT unique_serial_per_project 
UNIQUE(project_id, serial_number);

-- Add index for performance
CREATE INDEX idx_paintings_project_serial 
ON paintings(project_id, serial_number);
```

---

## Testing Checklist

### Unit Tests
- [ ] Test duplicate serial in same project → Should fail
- [ ] Test same serial in different project → Should succeed
- [ ] Test case sensitivity (PAINT-001 vs paint-001) → Define behavior
- [ ] Test update operation with duplicate serial → Prevent

### Integration Tests
- [ ] Add item with serial "TEST"
- [ ] Try adding another item with serial "TEST" → Should fail with 409
- [ ] Verify error message is clear
- [ ] Verify form state after error

### Manual Tests
- [ ] Add item "PAINT-001"
- [ ] Try adding "PAINT-001" again → Should show error
- [ ] Verify error is shown both in UI and console
- [ ] Verify project still works after error
- [ ] Export should still work

---

## Error Message Improvements

### Current (Generic)
```
Unable to save painting data.
```

### Improved
```
Serial number "PAINT-001" already exists in this project. Please choose a different serial number.
```

---

## Migration Strategy

### Phase 1: Backend Enhancement
- Add serial number duplicate check in server
- Deploy to staging
- Test thoroughly

### Phase 2: Frontend Enhancement  
- Add pre-check in form
- Better error messages
- Deploy to production

### Phase 3: Database Constraint (Optional)
- Add unique constraint in Supabase
- Prevents any duplicates going forward
- Run during maintenance window

---

## Implementation Effort

| Component | Effort | Priority |
|-----------|--------|----------|
| Backend check | 30 min | 🔴 High |
| Frontend check | 20 min | 🟡 Medium |
| DB constraint | 10 min | 🟢 Low |
| Testing | 30 min | 🔴 High |
| Documentation | 10 min | 🟢 Low |
| **Total** | **1.5 hours** | |

---

## Acceptance Criteria

- [ ] Backend prevents duplicate serial numbers per project
- [ ] Frontend shows helpful error message
- [ ] User can retry with different serial number
- [ ] Error doesn't crash the app
- [ ] Existing data is unaffected
- [ ] Exports work correctly
- [ ] All tests pass
- [ ] Documentation updated

---

## Status Tracking

- [ ] **Step 1:** Backend Implementation - Start here!
- [ ] **Step 2:** Frontend Enhancement  
- [ ] **Step 3:** Testing & QA
- [ ] **Step 4:** Deployment
- [ ] **Step 5:** Monitoring

---

## Related Issues
- Issue #5: Generic Error Messages - Will be improved by this fix
- Issue #4: Data Integrity - This fix strengthens it

---

**Ready to implement? Use the code snippets above to get started! 🚀**

