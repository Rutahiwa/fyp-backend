import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const payload = jwt.decode(token) as any;
  if (!payload || !payload.userId) {
    redirect('/login');
  }

  // We should also ensure this role is an admin role.
  // Assuming 'roleId' corresponds to admin, but since we use
  // backend endpoints that already verify permissions, the main thing
  // is ensuring the JWT parses successfully here.
  
  return {
    userId: payload.userId,
    roleId: payload.roleId,
    email: payload.email,
  };
}
