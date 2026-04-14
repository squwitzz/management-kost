# Payment History Data Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │  Room Details Page   │         │ Resident Profile Page│     │
│  │  /admin/rooms/[id]   │         │ /admin/residents/[id]│     │
│  └──────────┬───────────┘         └──────────┬───────────┘     │
│             │                                 │                  │
│             ├─ fetchRoomDetail()              ├─ fetchResidentDetail()
│             ├─ fetchPayments()                ├─ fetchPayments()
│             │                                 │                  │
│  ┌──────────▼─────────────────────────────────▼──────────────┐ │
│  │              API Client (app/lib/api.ts)                   │ │
│  │                                                             │ │
│  │  getRoomPayments(roomId)    getUserPayments(userId)       │ │
│  │         │                            │                     │ │
│  │         ├─ Try new endpoint          ├─ Try new endpoint  │ │
│  │         ├─ Fallback to all payments  ├─ Fallback          │ │
│  │         └─ Filter by room            └─ Filter by user    │ │
│  └─────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   HTTP Request     │
                    │  (Bearer Token)    │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      BACKEND (Laravel)                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Routes (api.php)                         │  │
│  │                                                             │  │
│  │  GET /api/rooms/{id}/payments                              │  │
│  │  GET /api/users/{id}/payments                              │  │
│  │  GET /api/payments (existing fallback)                     │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────▼───────────────────────────────────────┐  │
│  │              Middleware (auth:api, admin)                   │  │
│  │  - Verify JWT token                                         │  │
│  │  - Check user role = Admin                                  │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────▼───────────────────────────────────────┐  │
│  │            PaymentController                                │  │
│  │                                                             │  │
│  │  getRoomPayments($roomId)                                  │  │
│  │  ├─ Find room                                              │  │
│  │  ├─ Query payments where user.room_id = $roomId           │  │
│  │  ├─ Include user & room relations                         │  │
│  │  └─ Return JSON response                                  │  │
│  │                                                             │  │
│  │  getUserPayments($userId)                                  │  │
│  │  ├─ Find user                                              │  │
│  │  ├─ Query payments where user_id = $userId                │  │
│  │  ├─ Include user & room relations                         │  │
│  │  ├─ Calculate summary statistics                          │  │
│  │  └─ Return JSON response                                  │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
│  ┌────────────────────▼───────────────────────────────────────┐  │
│  │                  Eloquent ORM                               │  │
│  │                                                             │  │
│  │  Payment::whereHas('user', ...)                            │  │
│  │         ->with(['user', 'room'])                           │  │
│  │         ->orderBy('created_at', 'desc')                    │  │
│  │         ->get()                                            │  │
│  └────────────────────┬───────────────────────────────────────┘  │
│                       │                                           │
└───────────────────────┼───────────────────────────────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │         MySQL Database          │
        │                                 │
        │  ┌──────────┐  ┌──────────┐   │
        │  │  users   │  │  rooms   │   │
        │  └────┬─────┘  └─────┬────┘   │
        │       │              │         │
        │  ┌────▼──────────────▼────┐   │
        │  │      payments          │   │
        │  │  - id                  │   │
        │  │  - user_id (FK)        │   │
        │  │  - room_id (FK)        │   │
        │  │  - bulan_dibayar       │   │
        │  │  - jumlah_tagihan      │   │
        │  │  - status_bayar        │   │
        │  │  - tanggal_upload      │   │
        │  └────────────────────────┘   │
        └─────────────────────────────────┘
```

## Data Flow Sequences

### 1. Room Payment History Flow

```
User → Room Details Page
  │
  ├─ 1. Load room data
  │    GET /api/rooms/{id}
  │    Response: { room: {...}, users: [...] }
  │
  └─ 2. Load payment history
       │
       ├─ Try: GET /api/rooms/{id}/payments
       │  │
       │  ├─ Success (200)
       │  │  Response: { payments: [...], count: X }
       │  │  → Display in PaymentHistoryTable
       │  │
       │  └─ Fail (404)
       │     │
       │     └─ Fallback: GET /api/payments
       │        Response: { payments: [...] }
       │        → Filter by room.users[].id
       │        → Display in PaymentHistoryTable
       │
       └─ 3. Calculate summary
            → PaymentSummary component
            → Display statistics
```

### 2. User Payment History Flow

```
User → Resident Profile Page
  │
  ├─ 1. Load resident data
  │    GET /api/admin/users/{id}
  │    Response: { user: {...}, room: {...} }
  │
  └─ 2. Load payment history
       │
       ├─ Try: GET /api/users/{id}/payments
       │  │
       │  ├─ Success (200)
       │  │  Response: { payments: [...], summary: {...} }
       │  │  → Display in PaymentHistoryTable
       │  │
       │  └─ Fail (404)
       │     │
       │     └─ Fallback: GET /api/payments
       │        Response: { payments: [...] }
       │        → Filter by user_id
       │        → Display in PaymentHistoryTable
       │
       └─ 3. Calculate summary
            → PaymentSummary component
            → Display statistics
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    Page Component                        │
│  (RoomDetailPage / ResidentDetailPage)                  │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           AdminHeader                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │      Profile Section (Room/User Info)          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Payment History Section                 │    │
│  │                                                 │    │
│  │  ┌───────────────────────────────────────┐    │    │
│  │  │      PaymentSummary                    │    │    │
│  │  │  - Total payments                      │    │    │
│  │  │  - Paid count & amount                 │    │    │
│  │  │  - Pending count & amount              │    │    │
│  │  │  - Unpaid count                        │    │    │
│  │  │  - Payment rate %                      │    │    │
│  │  └───────────────────────────────────────┘    │    │
│  │                                                 │    │
│  │  ┌───────────────────────────────────────┐    │    │
│  │  │    PaymentHistoryTable                 │    │    │
│  │  │                                        │    │    │
│  │  │  Props:                                │    │    │
│  │  │  - payments: Payment[]                 │    │    │
│  │  │  - showUserInfo: boolean (room page)   │    │    │
│  │  │  - showRoomInfo: boolean (user page)   │    │    │
│  │  │                                        │    │    │
│  │  │  Columns:                              │    │    │
│  │  │  [User/Room] | Period | Date | Amount | Status
│  │  └───────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           AdminBottomNav                        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────┐
│         Component State                  │
├─────────────────────────────────────────┤
│                                          │
│  room: Room | null                       │
│  resident: User | null                   │
│  payments: Payment[]                     │
│  loading: boolean                        │
│                                          │
│  Effects:                                │
│  ├─ useEffect(() => {                   │
│  │    fetchRoomDetail()                 │
│  │  }, [roomId])                        │
│  │                                       │
│  └─ useEffect(() => {                   │
│       if (room) fetchPayments()         │
│     }, [room])                           │
│                                          │
└─────────────────────────────────────────┘
```

## API Response Formats

### Room Payments Response

```json
{
  "success": true,
  "room": {
    "id": 13,
    "nomor_kamar": "01",
    "tarif_dasar": 1300000
  },
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
  ],
  "count": 1
}
```

### User Payments Response

```json
{
  "success": true,
  "user": {
    "id": 5,
    "nama": "John Doe",
    "nomor_telepon": "08123456789"
  },
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
  ],
  "summary": {
    "total_payments": 5,
    "total_paid": 4,
    "total_pending": 1,
    "total_unpaid": 0,
    "total_amount_paid": 5200000,
    "total_amount_pending": 1300000,
    "payment_rate": 80
  }
}
```

## Error Handling Flow

```
API Request
    │
    ├─ Network Error
    │  └─ Show: "Tidak dapat terhubung ke server"
    │
    ├─ 401 Unauthorized
    │  ├─ Clear localStorage
    │  ├─ Clear cookies
    │  └─ Redirect to /login
    │
    ├─ 404 Not Found (new endpoint)
    │  └─ Fallback to existing endpoint
    │
    ├─ 500 Server Error
    │  └─ Show: "Failed to fetch payments"
    │
    └─ Success (200)
       └─ Display data
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│         Optimization Strategy            │
├─────────────────────────────────────────┤
│                                          │
│  Frontend:                               │
│  ├─ Lazy load payment table              │
│  ├─ Memoize summary calculations         │
│  ├─ Debounce search/filter               │
│  └─ Virtual scrolling for large lists    │
│                                          │
│  Backend:                                │
│  ├─ Database indexes on:                 │
│  │  - payments.user_id                   │
│  │  - payments.room_id                   │
│  │  - payments.status_bayar              │
│  │  - payments.created_at                │
│  │                                       │
│  ├─ Eager loading relationships          │
│  ├─ Pagination for large datasets        │
│  └─ Query result caching                 │
│                                          │
└─────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────┐
│           Security Layers                │
├─────────────────────────────────────────┤
│                                          │
│  1. Authentication                       │
│     ├─ JWT token validation              │
│     └─ Token expiry check                │
│                                          │
│  2. Authorization                        │
│     ├─ Admin role verification           │
│     └─ Resource ownership check          │
│                                          │
│  3. Input Validation                     │
│     ├─ ID parameter validation           │
│     └─ SQL injection prevention          │
│                                          │
│  4. Rate Limiting                        │
│     └─ Prevent API abuse                 │
│                                          │
│  5. CORS Configuration                   │
│     └─ Allowed origins only              │
│                                          │
└─────────────────────────────────────────┘
```
