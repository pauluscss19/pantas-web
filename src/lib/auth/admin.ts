/**
 * Admin Configuration and Role Check for PANTAS
 * Puskesmas Karangawen I
 */

const DEFAULT_ADMIN_EMAILS = [
  'admin@pantas.id',
  'admin@puskesmas.id',
  'admin@karangawen.id',
];

export function getAdminEmails(): string[] {
  const envAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!envAdmins) return DEFAULT_ADMIN_EMAILS;
  
  const parsed = envAdmins.split(',').map((e) => e.trim().toLowerCase());
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...parsed]));
}

export function isAdminUser(email?: string | null, userMetadata?: any): boolean {
  if (!email) return false;
  
  const cleanEmail = email.trim().toLowerCase();
  const adminList = getAdminEmails();
  
  // 1. Explicit admin emails
  if (adminList.includes(cleanEmail)) {
    return true;
  }

  // 2. Any designated admin email starting with admin@
  if (cleanEmail.startsWith('admin@')) {
    return true;
  }
  
  // 3. Supabase Auth user_metadata role
  if (userMetadata?.role === 'admin' || userMetadata?.isAdmin === true) {
    return true;
  }
  
  return false;
}
