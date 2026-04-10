import Swal from 'sweetalert2';

// Custom SweetAlert configurations with Material Design 3 styling
const swalConfig = {
  customClass: {
    popup: 'rounded-2xl shadow-2xl',
    title: 'font-headline font-bold text-on-surface',
    htmlContainer: 'font-body text-on-surface-variant',
    confirmButton: 'px-6 py-3 bg-primary text-on-primary font-label font-bold rounded-xl hover:bg-primary/90 transition-colors',
    cancelButton: 'px-6 py-3 bg-surface-container-highest text-on-surface font-label font-bold rounded-xl hover:bg-surface-container-high transition-colors',
    denyButton: 'px-6 py-3 bg-error text-on-error font-label font-bold rounded-xl hover:bg-error/90 transition-colors',
  },
  buttonsStyling: false,
};

// Success Alert
export const showSuccess = (title: string, message?: string) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert
export const showError = (title: string, message?: string) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
};

// Warning Alert
export const showWarning = (title: string, message?: string) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
};

// Info Alert
export const showInfo = (title: string, message?: string) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
  });
};

// Confirmation Dialog
export const showConfirm = (
  title: string,
  message: string,
  confirmText: string = 'Yes',
  cancelText: string = 'Cancel'
) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

// Delete Confirmation
export const showDeleteConfirm = (itemName: string) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: 'Delete Confirmation',
    html: `Are you sure you want to delete <strong>${itemName}</strong>?<br><small class="text-error">This action cannot be undone.</small>`,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    customClass: {
      ...swalConfig.customClass,
      confirmButton: 'px-6 py-3 bg-error text-on-error font-label font-bold rounded-xl hover:bg-error/90 transition-colors',
    },
  });
};

// Loading Alert
export const showLoading = (title: string = 'Loading...', message?: string) => {
  return Swal.fire({
    ...swalConfig,
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close Loading
export const closeLoading = () => {
  Swal.close();
};

// Toast Notification (bottom-right)
export const showToast = (
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
      popup: 'rounded-xl shadow-lg',
      title: 'font-label font-bold text-sm',
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

// Custom HTML Alert
export const showCustom = (config: any) => {
  return Swal.fire({
    ...swalConfig,
    ...config,
  });
};
