# Auto Due Date Feature - Generate Payments

## Overview
Fitur untuk otomatis menghitung dan mengisi tanggal jatuh tempo berdasarkan periode tagihan yang diinput. Tanggal jatuh tempo akan otomatis diset ke tanggal 10 bulan berikutnya.

## Features

### 1. Auto-Calculate Due Date
- Ketika periode tagihan diisi, tanggal jatuh tempo otomatis dihitung
- Default: Tanggal 10 bulan berikutnya
- Contoh: Periode "Januari 2026" → Jatuh tempo "10 Februari 2026"

### 2. Editable Due Date
- User dapat mengedit tanggal jatuh tempo manual
- Input type date untuk kemudahan pemilihan
- Preview format tanggal Indonesia

### 3. Format Support
Mendukung 2 format input periode:
- **Format Indonesia**: "Januari 2026", "Februari 2026", dll
- **Format ISO**: "2026-01", "2026-02", dll

## How It Works

### Calculation Logic
```typescript
calculateDueDate(periode: string) {
  // Parse periode
  // If "Januari 2026" → month = 0 (Jan), year = 2026
  // If "2026-01" → month = 0 (Jan), year = 2026
  
  // Calculate next month
  // month + 1 = 1 (Feb)
  
  // Set to 10th of next month
  // Due date = 2026-02-10
}
```

### Auto-Update Flow
```
User types periode
    ↓
onChange event triggered
    ↓
calculateDueDate() called
    ↓
dueDateInput state updated
    ↓
Date input field updated
    ↓
Preview text updated
```

## UI Components

### Periode Input
```tsx
<input
  type="text"
  value={periode}
  onChange={(e) => {
    const newPeriode = e.target.value;
    setPeriode(newPeriode);
    // Auto-calculate due date
    const newDueDate = calculateDueDate(newPeriode);
    if (newDueDate) {
      setDueDateInput(newDueDate);
    }
  }}
/>
```

### Due Date Input
```tsx
<input
  type="date"
  value={dueDateInput}
  onChange={(e) => setDueDateInput(e.target.value)}
/>
<p className="text-xs">
  {dueDateInput && `Jatuh tempo: ${formatDate(dueDateInput)}`}
</p>
```

## Examples

### Example 1: Indonesian Format
```
Input: "Januari 2026"
Output: "2026-02-10" (10 Februari 2026)
```

### Example 2: ISO Format
```
Input: "2026-01"
Output: "2026-02-10" (10 Februari 2026)
```

### Example 3: Year Rollover
```
Input: "Desember 2026"
Output: "2027-01-10" (10 Januari 2027)
```

### Example 4: Manual Edit
```
Auto-calculated: "2026-02-10"
User edits to: "2026-02-15"
Final: "2026-02-15" (15 Februari 2026)
```

## Validation

### Frontend Validation
- Periode tidak boleh kosong
- Due date tidak boleh kosong
- Due date harus valid date format

### Error Handling
- Invalid periode format → Due date tidak berubah
- Parse error → Console log error, due date tetap kosong
- Empty periode → Due date tidak dihitung

## API Integration

### Preview Request
```json
{
  "periode": "Januari 2026",
  "due_date": "2026-02-10"
}
```

### Generate Request
```json
{
  "periode": "Januari 2026",
  "due_date": "2026-02-10"
}
```

## User Experience

### Default Behavior
1. Page loads
2. Periode auto-filled with next month
3. Due date auto-calculated to 10th of month after next
4. User can preview immediately

### Custom Periode
1. User changes periode
2. Due date auto-updates
3. User can manually adjust if needed
4. Preview shows updated due date

### Visual Feedback
- Input fields with clear labels
- Helper text showing format
- Preview text showing formatted date
- Validation messages if needed

## Benefits

### For Admin
- Faster billing generation
- Less manual input
- Consistent due dates
- Reduced errors

### For System
- Standardized due dates
- Predictable billing cycle
- Better data consistency

## Edge Cases Handled

### 1. Year Rollover
```
Periode: "Desember 2026"
Due Date: "2027-01-10" ✓
```

### 2. Invalid Format
```
Periode: "Invalid"
Due Date: "" (empty, no error)
```

### 3. Partial Input
```
Periode: "Jan" (incomplete)
Due Date: "" (empty, waits for complete input)
```

### 4. Manual Override
```
Auto: "2026-02-10"
User changes to: "2026-02-20"
System uses: "2026-02-20" ✓
```

## Testing Checklist

### Functional Testing
- [ ] Auto-calculate works for Indonesian format
- [ ] Auto-calculate works for ISO format
- [ ] Year rollover works correctly
- [ ] Manual edit persists
- [ ] Preview shows correct date
- [ ] API receives correct due_date
- [ ] Validation prevents empty submission

### UI Testing
- [ ] Date input displays correctly
- [ ] Preview text formats correctly
- [ ] Helper text is clear
- [ ] Labels are descriptive
- [ ] Responsive on mobile

### Edge Case Testing
- [ ] December → January next year
- [ ] Invalid periode format
- [ ] Empty periode
- [ ] Future dates
- [ ] Past dates (if allowed)

## Future Enhancements

### Phase 2
1. **Configurable Due Date**
   - Admin can set default due date (e.g., 5th, 10th, 15th)
   - Save preference in settings

2. **Smart Suggestions**
   - Suggest next billing periode
   - Show last generated periode
   - Prevent duplicate generation

3. **Bulk Operations**
   - Generate multiple months at once
   - Schedule auto-generation

4. **Reminders**
   - Remind admin to generate bills
   - Notify before due date

## Implementation Notes

### Month Names Array
```typescript
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 
  'Mei', 'Juni', 'Juli', 'Agustus', 
  'September', 'Oktober', 'November', 'Desember'
];
```

### Date Formatting
- Input: `YYYY-MM-DD` (ISO format for date input)
- Display: `DD MMMM YYYY` (Indonesian format)
- API: `YYYY-MM-DD` (ISO format)

### State Management
```typescript
const [periode, setPeriode] = useState('');
const [dueDateInput, setDueDateInput] = useState('');
const [dueDate, setDueDate] = useState(''); // For preview display
```

## Files Modified

1. `app/(admin)/admin/payments/generate/page.tsx`
   - Added `calculateDueDate()` function
   - Added `dueDateInput` state
   - Added due date input field
   - Updated onChange handler for periode
   - Updated preview and generate handlers

## Backend Considerations

### Expected Behavior
Backend should:
1. Accept `due_date` in request body
2. Validate date format
3. Store in payments table
4. Return in response

### Database Schema
```sql
payments table:
- tanggal_jatuh_tempo (DATE) - Due date field
```

## Troubleshooting

### Issue: Due date not updating
**Solution:** Check periode format matches expected patterns

### Issue: Wrong month calculated
**Solution:** Verify month index (0-11 for JavaScript Date)

### Issue: Year not rolling over
**Solution:** Check year calculation logic for December

### Issue: Date input not showing
**Solution:** Ensure dueDateInput is in YYYY-MM-DD format

## Summary

Fitur ini meningkatkan efisiensi admin dalam generate tagihan dengan:
- Auto-calculate tanggal jatuh tempo
- Mengurangi input manual
- Konsistensi tanggal jatuh tempo
- Fleksibilitas untuk edit manual
- User experience yang lebih baik
