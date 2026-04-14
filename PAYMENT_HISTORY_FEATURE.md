# Payment History Feature - Room & User Separation

## Overview
Fitur ini memisahkan payment history berdasarkan:
1. **Room Payment History** - Semua pembayaran untuk kamar tertentu (dari semua penghuni yang pernah menempati)
2. **User Payment History** - Semua pembayaran dari user tertentu (di semua kamar yang pernah ditempati)

## Features Implemented

### 1. Room Payment History (`/admin/rooms/[id]`)
Menampilkan:
- Informasi kamar dan penghuni saat ini
- Summary statistik pembayaran kamar
- Tabel payment history dengan informasi penghuni
- Filter otomatis untuk pembayaran kamar tersebut

**Screenshot Location:** Room Details page dengan Payment History section

### 2. User Payment History (`/admin/residents/[id]`)
Menampilkan:
- Profil lengkap resident
- Summary statistik pembayaran user
- Tabel payment history dengan informasi kamar
- Filter otomatis untuk pembayaran user tersebut

**Screenshot Location:** Resident Profile page dengan Payment History section

## Components Created

### 1. PaymentHistoryTable Component
**Location:** `app/components/PaymentHistoryTable.tsx`

**Props:**
```typescript
interface PaymentHistoryTableProps {
  payments: Payment[];
  loading?: boolean;
  emptyMessage?: string;
  showUserInfo?: boolean;  // Show user column for room history
  showRoomInfo?: boolean;  // Show room column for user history
  onViewDetails?: (payment: Payment) => void;
}
```

**Features:**
- Responsive table layout
- Status badges (Paid, Pending, Unpaid)
- Conditional columns based on context
- Loading state
- Empty state with custom message
- Hover effects and transitions

### 2. PaymentSummary Component
**Location:** `app/components/PaymentSummary.tsx`

**Props:**
```typescript
interface PaymentSummaryProps {
  payments: Payment[];
  title?: string;
}
```

**Features:**
- 5 key metrics:
  - Total payments count
  - Paid count & amount
  - Pending count & amount
  - Unpaid count
  - Payment rate percentage
- Responsive grid layout
- Material Design 3 styling
- Icon indicators for each metric

## API Integration

### Frontend API Methods (app/lib/api.ts)

#### 1. getRoomPayments(roomId: number)
```typescript
static async getRoomPayments(roomId: number) {
  const response = await fetchWithAuth(`${API_URL}/rooms/${roomId}/payments`, {
    headers: this.getHeaders(),
  });
  // ...
}
```

#### 2. getUserPayments(userId: number)
```typescript
static async getUserPayments(userId: number) {
  const response = await fetchWithAuth(`${API_URL}/users/${userId}/payments`, {
    headers: this.getHeaders(),
  });
  // ...
}
```

### Fallback Strategy
Jika endpoint baru belum tersedia di backend:
1. Frontend akan mencoba endpoint spesifik terlebih dahulu
2. Jika gagal (404), akan fallback ke `/api/payments` dan filter di frontend
3. Tidak ada breaking changes - aplikasi tetap berfungsi

## Backend Requirements

### Required Endpoints

#### 1. GET /api/rooms/{roomId}/payments
**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00Z",
      "user": {
        "id": 5,
        "nama": "John Doe",
        "nomor_telepon": "08123456789"
      }
    }
  ]
}
```

#### 2. GET /api/users/{userId}/payments
**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "user_id": 5,
      "room_id": 13,
      "bulan_dibayar": "Januari 2024",
      "jumlah_tagihan": 1300000,
      "status_bayar": "Lunas",
      "tanggal_upload": "2024-01-15T10:30:00Z",
      "room": {
        "id": 13,
        "nomor_kamar": "01",
        "tarif_dasar": 1300000
      }
    }
  ]
}
```

**See:** `PAYMENT_HISTORY_API.md` for detailed backend implementation guide

## UI/UX Features

### Design System
- Material Design 3 principles
- Consistent color scheme:
  - Primary: Room/User info
  - Secondary: Paid status (green)
  - Tertiary: Pending status (yellow)
  - Error: Unpaid status (red)

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly buttons and interactions

### Visual Hierarchy
1. Page header with back button
2. Room/User profile card
3. Payment summary statistics
4. Payment history table

### Status Indicators
- **Paid (Lunas)**: Green badge with check icon
- **Pending (Menunggu Verifikasi)**: Yellow badge with clock icon
- **Unpaid (Belum Bayar)**: Red badge with cancel icon

## Data Flow

### Room Payment History Flow
```
1. User navigates to /admin/rooms/[id]
2. fetchRoomDetail() loads room data
3. fetchPayments() tries:
   a. ApiClient.getRoomPayments(roomId) - NEW ENDPOINT
   b. If fails: ApiClient.getAdminPayments() + filter by room
4. Display in PaymentHistoryTable with showUserInfo=true
```

### User Payment History Flow
```
1. User navigates to /admin/residents/[id]
2. fetchResidentDetail() loads user data
3. fetchPayments() tries:
   a. ApiClient.getUserPayments(userId) - NEW ENDPOINT
   b. If fails: ApiClient.getAdminPayments() + filter by user
4. Display in PaymentHistoryTable with showRoomInfo=true
```

## Testing Checklist

### Room Payment History
- [ ] Navigate to room details page
- [ ] Verify payment summary shows correct statistics
- [ ] Verify payment table shows all payments for that room
- [ ] Verify user information is displayed in table
- [ ] Test with room that has no payments
- [ ] Test with room that has multiple residents over time

### User Payment History
- [ ] Navigate to resident profile page
- [ ] Verify payment summary shows correct statistics
- [ ] Verify payment table shows all payments for that user
- [ ] Verify room information is displayed in table
- [ ] Test with user that has no payments
- [ ] Test with user that moved between rooms

### Edge Cases
- [ ] Room with no current resident
- [ ] User with no assigned room
- [ ] Payment with missing user/room data
- [ ] Large number of payments (pagination needed?)
- [ ] Network error handling
- [ ] Loading states

## Performance Considerations

### Current Implementation
- Fetches all payments and filters in frontend (fallback)
- Acceptable for small to medium datasets (<1000 payments)

### Recommended Improvements
1. Implement backend endpoints for server-side filtering
2. Add pagination for large datasets
3. Add caching for frequently accessed data
4. Consider lazy loading for payment details

## Future Enhancements

### Phase 2 Features
1. **Export to PDF/Excel**
   - Export room payment history
   - Export user payment history
   - Include summary statistics

2. **Advanced Filtering**
   - Filter by date range
   - Filter by status
   - Filter by amount range

3. **Search & Sort**
   - Search by billing period
   - Sort by date, amount, status
   - Multi-column sorting

4. **Payment Analytics**
   - Payment trends over time
   - Average payment time
   - Late payment analysis
   - Revenue forecasting

5. **Bulk Actions**
   - Bulk status update
   - Bulk export
   - Bulk notifications

## Files Modified

### Frontend
1. `app/lib/api.ts` - Added getRoomPayments() and getUserPayments()
2. `app/(admin)/admin/rooms/[id]/page.tsx` - Updated to use new components
3. `app/(admin)/admin/residents/[id]/page.tsx` - Updated to use new components
4. `app/components/PaymentHistoryTable.tsx` - NEW reusable component
5. `app/components/PaymentSummary.tsx` - NEW reusable component
6. `app/components/index.ts` - Export new components

### Documentation
1. `PAYMENT_HISTORY_API.md` - Backend API specification
2. `PAYMENT_HISTORY_FEATURE.md` - This file

## Deployment Notes

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
No new environment variables required. Uses existing `NEXT_PUBLIC_API_URL`.

## Support & Maintenance

### Common Issues

**Issue:** Payment history not showing
- **Solution:** Check if backend endpoints are implemented
- **Fallback:** Will use existing /api/payments endpoint

**Issue:** User/Room info not showing in table
- **Solution:** Ensure backend includes related data in response
- **Check:** Payment model should include user/room relationships

**Issue:** Summary statistics incorrect
- **Solution:** Verify payment status values match expected strings
- **Expected:** "Lunas", "Menunggu Verifikasi", "Belum Bayar"

## Contact

For questions or issues with this feature:
1. Check this documentation first
2. Review `PAYMENT_HISTORY_API.md` for backend details
3. Check component props and usage examples
4. Review browser console for errors
