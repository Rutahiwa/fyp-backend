'use server';

import { getAuthHeaders } from './auth';

const BASE_URL = 'https://fyp-backend-pi-one.vercel.app/api';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
}

export async function getUsers({ page = 1, pageSize = 20, search = '', roleId }: GetUsersParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set('search', search);
  if (roleId) params.set('roleId', roleId);

  const res = await fetch(`${BASE_URL}/users?${params}`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch users');
  return json; // { success, data: User[], meta: { total, page, pageSize, totalPages } }
}

export async function getUser(id: string) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch user');
  return json;
}

export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch current user');
  return json;
}

export async function updateUser(
  id: string,
  data: { fullName?: string; roleId?: string; isActive?: boolean },
) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update user');
  return json;
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete user');
  return json;
}
