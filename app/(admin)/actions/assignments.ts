'use server';

import { getAuthHeaders } from './auth';

const BASE_URL = 'https://fyp-backend-pi-one.vercel.app/api';

// LECTURER ASSIGNMENTS
export async function getLecturerAssignments() {
  const res = await fetch(`${BASE_URL}/lecturer-assignments`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch lecturer assignments');
  return json;
}

export async function createLecturerAssignment(data: any) {
  const res = await fetch(`${BASE_URL}/lecturer-assignments`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create lecturer assignment');
  return json;
}

// CR ASSIGNMENTS
export async function getCrAssignments() {
  const res = await fetch(`${BASE_URL}/cr-assignments`, {
    headers: await getAuthHeaders(),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch CR assignments');
  return json;
}

export async function createCrAssignment(data: any) {
  const res = await fetch(`${BASE_URL}/cr-assignments`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create CR assignment');
  return json;
}
