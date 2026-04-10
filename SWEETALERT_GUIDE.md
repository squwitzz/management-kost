# SweetAlert2 Implementation Guide

Panduan lengkap penggunaan SweetAlert2 di aplikasi Kost Management System.

## 📦 Installation

```bash
npm install sweetalert2
```

## 🎨 Custom Utility Functions

File: `app/lib/sweetalert.ts`

Sudah dibuat custom functions dengan Material Design 3 styling yang konsisten dengan aplikasi.

## 🚀 Usage Examples

### 1. Success Alert

```typescript
import { showSuccess } from '@/app/lib/sweetalert';

// Simple success
showSuccess('Success!', 'Data saved successfully');

// With auto-close (3 seconds)
showSuccess('Saved!');
```

### 2. Error Alert

```typescript
import { showError } from '@/app/lib/sweetalert';

// Show error
showError('Error!', 'Something went wrong');

// From catch block
catch (err: any) {
  showError('Failed', err.message || 'Operation failed');
}
```

### 3. Warning Alert

```typescript
import { showWarning } from '@/app/lib/sweetalert';

showWarning('Warning!', 'Please check your input');
```

### 4. Info Alert

```typescript
import { showInfo } from '@/app/lib/sweetalert';

showInfo('Information', 'This is an informational message');
```

### 5. Confirmation Dialog

```typescript
import { showConfirm } from '@/app/lib/sweetalert';

const result = await showConfirm(
  'Are you sure?',
  'Do you want to proceed with this action?',
  'Yes, proceed',
  'Cancel'
);

if (result.isConfirmed) {
  // User clicked "Yes, proceed"
  // Do something
}
```

### 6. Delete Confirmation

```typescript
import { showDeleteConfirm } from '@/app/lib/sweetalert';

const result = await showDeleteConfirm('User Name');

if (result.isConfirmed) {
  // User confirmed deletion
  await deleteUser();
  showSuccess('Deleted!', 'User has been deleted');
}
```

### 7. Loading Alert

```typescript
import { showLoading, closeLoading } from '@/app/lib/sweetalert';

// Show loading
showLoading('Processing...', 'Please wait');

try {
  await someAsyncOperation();
  closeLoading();
  showSuccess('Done!');
} catch (err) {
  closeLoading();
  showError('Failed');
}
```

### 8. Toast Notification

```typescript
import { showToast } from '@/app/lib/sweetalert';

// Success toast (bottom-right, auto-close)
showToast('success', 'Saved successfully!');

// Error toast
showToast('error', 'Something went wrong');

// Warning toast
showToast('warning', 'Please check your input');

// Info toast
showToast('info', 'New notification received');
```

### 9. Custom Alert

```typescript
import { showCustom } from '@/app/lib/sweetalert';

showCustom({
  title: 'Custom Alert',
  html: '<p>Custom HTML content</p>',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'OK',
  cancelButtonText: 'Cancel',
});
```

## 📝 Real-World Examples

### Example 1: Delete Resident

```typescript
const handleDeleteResident = async (resident: User) => {
  const result = await showDeleteConfirm(
    `${resident.nama} (Room ${resident.room?.nomor_kamar})`
  );
  
  if (result.isConfirmed) {
    try {
      await ApiClient.deleteResident(resident.id);
      setResidents(residents.filter((r) => r.id !== resident.id));
      showSuccess('Deleted!', 'Resident has been deleted successfully');
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  }
};
```

### Example 2: Form Submission with Loading

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    showWarning('Invalid Input', 'Please check your form');
    return;
  }

  showLoading('Saving...', 'Please wait');
  
  try {
    await ApiClient.updateData(formData);
    closeLoading();
    await showSuccess('Success!', 'Data updated successfully');
    router.push('/dashboard');
  } catch (err: any) {
    closeLoading();
    showError('Update Failed', err.message);
  }
};
```

### Example 3: Logout Confirmation

```typescript
const handleLogout = async () => {
  const result = await showConfirm(
    'Logout',
    'Are you sure you want to logout?',
    'Yes, logout',
    'Cancel'
  );

  if (result.isConfirmed) {
    showLoading('Logging out...');
    await ApiClient.logout();
    closeLoading();
    router.push('/login');
  }
};
```

### Example 4: Payment Verification

```typescript
const handleVerifyPayment = async (paymentId: number) => {
  const result = await showConfirm(
    'Verify Payment',
    'Mark this payment as verified?',
    'Verify',
    'Cancel'
  );

  if (result.isConfirmed) {
    try {
      await ApiClient.verifyPayment(paymentId);
      showToast('success', 'Payment verified!');
      refreshPayments();
    } catch (err: any) {
      showError('Verification Failed', err.message);
    }
  }
};
```

## 🎨 Styling

SweetAlert sudah dikonfigurasi dengan Material Design 3 styling yang match dengan aplikasi:

- **Popup**: Rounded corners, shadow
- **Title**: Headline font, bold
- **Text**: Body font, surface variant color
- **Buttons**: Material Design 3 button styling
- **Colors**: Primary, error, surface colors dari theme

## 🔧 Customization

Jika perlu custom styling lebih lanjut, edit `app/lib/sweetalert.ts`:

```typescript
const swalConfig = {
  customClass: {
    popup: 'your-custom-class',
    title: 'your-title-class',
    // ... more classes
  },
  buttonsStyling: false,
};
```

## 📱 Mobile Responsive

SweetAlert2 sudah responsive dan bekerja baik di mobile. Toast notifications muncul di bottom-right (desktop) atau bottom (mobile).

## ⚡ Performance

- Lazy loading: SweetAlert hanya di-import saat digunakan
- Tree shaking: Hanya functions yang digunakan yang di-bundle
- Small bundle size: ~50KB gzipped

## 🐛 Troubleshooting

### Alert tidak muncul

Check import:
```typescript
import { showSuccess } from '@/app/lib/sweetalert';
```

### Styling tidak match

Pastikan Tailwind classes di `sweetalert.ts` sesuai dengan `tailwind.config.ts`.

### TypeScript errors

Install types:
```bash
npm install --save-dev @types/sweetalert2
```

## 📚 Resources

- [SweetAlert2 Documentation](https://sweetalert2.github.io/)
- [SweetAlert2 Examples](https://sweetalert2.github.io/#examples)
- [SweetAlert2 GitHub](https://github.com/sweetalert2/sweetalert2)

## ✅ Migration Checklist

- [x] Install sweetalert2
- [x] Create utility functions
- [x] Replace alert() in residents page
- [x] Replace alert() in edit resident page
- [ ] Replace alert() in other pages (if any)
- [ ] Replace confirm() with showConfirm()
- [ ] Add toast notifications where appropriate
- [ ] Test on mobile devices

## 🎯 Best Practices

1. **Use appropriate alert types**
   - Success: For successful operations
   - Error: For failures
   - Warning: For cautions
   - Info: For information
   - Confirm: For user decisions

2. **Keep messages concise**
   - Title: Short and clear
   - Message: Brief explanation

3. **Use loading for async operations**
   - Show loading before operation
   - Close loading after completion
   - Show result (success/error)

4. **Use toast for non-critical notifications**
   - Quick feedback
   - Auto-dismiss
   - Non-blocking

5. **Always handle promise results**
   ```typescript
   const result = await showConfirm(...);
   if (result.isConfirmed) {
     // Handle confirmation
   }
   ```

## 🚀 Next Steps

1. Replace remaining alert() calls in other pages
2. Add toast notifications for quick feedback
3. Implement loading states for all async operations
4. Add custom icons for specific actions
5. Consider adding sound effects (optional)

---

**Status**: ✅ Implemented in residents management

**Files Updated**:
- `app/lib/sweetalert.ts` (new)
- `app/(admin)/admin/residents/page.tsx`
- `app/(admin)/admin/residents/[id]/edit/page.tsx`

**Next**: Apply to other pages as needed
