/**
 * Notification Router Helper
 * Maps notification types to appropriate URLs
 */

export interface NotificationData {
  id: number;
  judul: string;
  pesan: string;
  tipe: string;
  user_id?: number;
  related_id?: number; // payment_id, request_id, etc.
}

export interface UserData {
  id: number;
  role: string;
  nama: string;
}

/**
 * Get URL for notification based on type and user role
 */
export function getNotificationRoute(
  notification: NotificationData,
  user: UserData
): string {
  const isAdmin = user.role === 'Admin';
  const { tipe, related_id, pesan } = notification;

  // Try to extract ID from message if not provided
  const extractedId = related_id || extractIdFromMessage(pesan);

  if (isAdmin) {
    return getAdminRoute(tipe, extractedId);
  } else {
    return getUserRoute(tipe, extractedId);
  }
}

/**
 * Get admin route based on notification type
 */
function getAdminRoute(tipe: string, relatedId?: number): string {
  switch (tipe) {
    case 'Tagihan':
      return '/admin/payments';
    
    case 'Pembayaran':
      // For admin, just go to payments list (not detail)
      // Admin can see all payments and filter/search
      return '/admin/payments';
    
    case 'Maintenance':
      // For admin, just go to requests list (not detail)
      // Admin can see all requests and filter/search
      return '/admin/requests';
    
    case 'Pesanan':
      return '/admin/dashboard';
    
    case 'Penghuni':
      // New resident notification
      return '/admin/residents';
    
    default:
      return '/admin/dashboard';
  }
}

/**
 * Get user route based on notification type
 */
function getUserRoute(tipe: string, relatedId?: number): string {
  switch (tipe) {
    case 'Tagihan':
      // New bill notification - go to payments list
      return '/payments';
    
    case 'Pembayaran':
      // Payment verified notification - go to payments list
      return '/payments';
    
    case 'Maintenance':
      // Maintenance request update - go to requests list
      return '/requests';
    
    case 'Pesanan':
      // Food order notification
      return '/dashboard';
    
    default:
      return '/dashboard';
  }
}

/**
 * Extract ID from notification message
 * Looks for patterns like "#123" or "ID: 123"
 */
function extractIdFromMessage(message: string): number | undefined {
  // Pattern 1: #123
  const hashPattern = /#(\d+)/;
  const hashMatch = message.match(hashPattern);
  if (hashMatch) {
    return parseInt(hashMatch[1], 10);
  }

  // Pattern 2: ID: 123 or ID 123
  const idPattern = /ID:?\s*(\d+)/i;
  const idMatch = message.match(idPattern);
  if (idMatch) {
    return parseInt(idMatch[1], 10);
  }

  // Pattern 3: Payment 123, Request 123, etc.
  const numberPattern = /\b(\d+)\b/;
  const numberMatch = message.match(numberPattern);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  return undefined;
}

/**
 * Get notification type display name
 */
export function getNotificationTypeName(tipe: string): string {
  const typeNames: Record<string, string> = {
    'Tagihan': 'Tagihan Baru',
    'Pembayaran': 'Pembayaran',
    'Maintenance': 'Maintenance',
    'Pesanan': 'Pesanan Makanan',
    'Penghuni': 'Penghuni Baru',
  };

  return typeNames[tipe] || tipe;
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(tipe: string): string {
  const icons: Record<string, string> = {
    'Tagihan': 'receipt_long',
    'Pembayaran': 'payments',
    'Maintenance': 'build',
    'Pesanan': 'restaurant',
    'Penghuni': 'person_add',
  };

  return icons[tipe] || 'notifications';
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(tipe: string): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    'Tagihan': { bg: 'bg-error/10', text: 'text-error' },
    'Pembayaran': { bg: 'bg-secondary/10', text: 'text-secondary' },
    'Maintenance': { bg: 'bg-tertiary/10', text: 'text-tertiary' },
    'Pesanan': { bg: 'bg-primary/10', text: 'text-primary' },
    'Penghuni': { bg: 'bg-secondary/10', text: 'text-secondary' },
  };

  return colors[tipe] || { bg: 'bg-primary/10', text: 'text-primary' };
}
