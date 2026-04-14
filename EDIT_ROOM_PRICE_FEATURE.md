# Edit Room Price Feature

## Overview
Fitur untuk mengedit harga kamar (tarif_dasar) langsung dari halaman Room Details.

## Features

### 1. Edit Button
- Tombol edit icon di sebelah harga kamar
- Hover effect untuk visual feedback
- Tooltip "Edit harga kamar"

### 2. Edit Price Modal
- Modal dengan form input harga baru
- Menampilkan harga saat ini untuk referensi
- Input dengan format Rupiah
- Preview harga yang diformat
- Validasi input (harus angka positif)
- Loading state saat update
- Konfirmasi sebelum update

### 3. Update Process
1. User klik tombol edit di sebelah Monthly Rate
2. Modal muncul dengan harga saat ini
3. User input harga baru
4. Konfirmasi perubahan dengan SweetAlert
5. API call untuk update
6. Success message
7. Refresh data kamar otomatis

## UI Components

### Edit Button
```tsx
<button
  onClick={handleEditPrice}
  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group"
  title="Edit harga kamar"
>
  <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">
    edit
  </span>
</button>
```

### Modal Features
- **Header**: Icon + Title + Room number
- **Current Price**: Display only, untuk referensi
- **New Price Input**: 
  - Number input dengan prefix "Rp"
  - Auto-format preview
  - Validation
- **Actions**: Cancel & Update buttons
- **Loading State**: Spinner + disabled state

## API Integration

### Frontend Method
```typescript
ApiClient.updateRoom(roomId, { tarif_dasar: newPrice })
```

### Backend Endpoint
```
PUT /api/rooms/{id}
```

**Request Body:**
```json
{
  "tarif_dasar": 1500000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Room updated successfully",
  "room": {
    "id": 13,
    "nomor_kamar": "01",
    "tarif_dasar": 1500000,
    "status": "Terisi"
  }
}
```

## Validation

### Frontend Validation
- Input harus berupa angka
- Harga harus lebih besar dari 0
- Button disabled jika input tidak valid

### Backend Validation (Required)
- Validate tarif_dasar is numeric
- Validate tarif_dasar > 0
- Check room exists
- Check user has admin role

## User Flow

```
1. Admin opens Room Details page
   ↓
2. Sees current price with edit icon
   ↓
3. Clicks edit icon
   ↓
4. Modal opens with current price
   ↓
5. Enters new price
   ↓
6. Clicks "Update Harga"
   ↓
7. Confirmation dialog appears
   ↓
8. Confirms update
   ↓
9. API call to update room
   ↓
10. Success message
    ↓
11. Room data refreshes
    ↓
12. New price displayed
```

## Error Handling

### Validation Errors
- Empty input: Button disabled
- Non-numeric input: Button disabled
- Zero or negative: Button disabled

### API Errors
- Network error: Show error message
- 401 Unauthorized: Redirect to login
- 404 Not Found: Show "Room not found"
- 500 Server Error: Show error message

## Backend Implementation

### Laravel Controller Method

```php
public function update(Request $request, $id)
{
    $request->validate([
        'tarif_dasar' => 'sometimes|numeric|min:0',
        'nomor_kamar' => 'sometimes|string|max:10',
        'status' => 'sometimes|in:Tersedia,Terisi',
    ]);

    $room = Room::findOrFail($id);
    
    // Only allow admin to update
    if ($request->user()->role !== 'Admin') {
        return response()->json([
            'success' => false,
            'error' => 'Unauthorized'
        ], 403);
    }

    $room->update($request->only(['tarif_dasar', 'nomor_kamar', 'status']));

    return response()->json([
        'success' => true,
        'message' => 'Room updated successfully',
        'room' => $room
    ]);
}
```

### Route
```php
Route::put('/rooms/{id}', [RoomController::class, 'update'])
    ->middleware(['auth:api', 'admin']);
```

## Testing Checklist

### Frontend Testing
- [ ] Edit button appears next to price
- [ ] Edit button has hover effect
- [ ] Modal opens when clicking edit
- [ ] Current price displays correctly
- [ ] New price input accepts numbers
- [ ] Preview shows formatted price
- [ ] Validation works (empty, zero, negative)
- [ ] Cancel button closes modal
- [ ] Update button shows loading state
- [ ] Confirmation dialog appears
- [ ] Success message shows after update
- [ ] Room data refreshes automatically
- [ ] New price displays correctly

### Backend Testing
- [ ] PUT /api/rooms/{id} endpoint exists
- [ ] Accepts tarif_dasar in request body
- [ ] Validates input (numeric, positive)
- [ ] Checks admin authorization
- [ ] Updates room in database
- [ ] Returns updated room data
- [ ] Handles errors properly

### Integration Testing
- [ ] End-to-end update flow works
- [ ] Price updates in database
- [ ] Price displays correctly after update
- [ ] Error handling works
- [ ] Authorization works

## Security Considerations

1. **Authorization**: Only admin can update room price
2. **Validation**: Server-side validation required
3. **Input Sanitization**: Prevent SQL injection
4. **Rate Limiting**: Prevent abuse
5. **Audit Log**: Consider logging price changes

## Future Enhancements

### Phase 2
1. **Price History**
   - Track all price changes
   - Show price change history
   - Display who changed and when

2. **Bulk Update**
   - Update multiple rooms at once
   - Percentage increase/decrease
   - Apply to all rooms

3. **Price Rules**
   - Set minimum/maximum price
   - Price templates
   - Seasonal pricing

4. **Notifications**
   - Notify residents of price changes
   - Email notification
   - In-app notification

## Files Modified

### Frontend
1. `app/lib/api.ts` - Added `updateRoom()` method
2. `app/(admin)/admin/rooms/[id]/page.tsx` - Added edit price feature

### Backend (Required)
1. `app/Http/Controllers/Api/RoomController.php` - Add/update `update()` method
2. `routes/api.php` - Ensure PUT route exists

## Usage Example

```typescript
// Open edit modal
const handleEditPrice = () => {
  setNewPrice(room?.tarif_dasar.toString() || '');
  setShowEditPriceModal(true);
};

// Update price
const handleUpdatePrice = async () => {
  await ApiClient.updateRoom(roomId, {
    tarif_dasar: Number(newPrice)
  });
  fetchRoomDetail(); // Refresh
};
```

## Styling

- Material Design 3 principles
- Consistent with existing UI
- Smooth transitions and animations
- Responsive design
- Accessible (keyboard navigation, ARIA labels)

## Notes

- Price format: Indonesian Rupiah (Rp)
- Input type: number (no decimal)
- Minimum price: 1 (validated)
- Maximum price: No limit (can be added if needed)
- Auto-refresh after update
- Confirmation required before update
