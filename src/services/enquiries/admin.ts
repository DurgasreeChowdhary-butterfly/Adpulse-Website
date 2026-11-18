import 'server-only';
import { enquiryStore } from './store';
import type { Enquiry, EnquiryFilter } from './types';
import { listQuery } from './validation';

/** Admin-side helpers (used only behind the admin login). */

export function parseFilter(url: string): EnquiryFilter | null {
  const p = Object.fromEntries(new URL(url).searchParams);
  const res = listQuery.safeParse(Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '')));
  return res.success ? res.data : null;
}

export async function listEnquiries(filter: EnquiryFilter) {
  const store = enquiryStore();
  return { storage: store.kind, items: await store.list(filter) };
}

const HEADERS: [keyof Enquiry, string][] = [
  ['id', 'ID'],
  ['createdAt', 'Received (UTC)'],
  ['type', 'Type'],
  ['status', 'Status'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['website', 'Website'],
  ['service', 'Needs help with'],
  ['sourcePage', 'Source page'],
  ['notificationStatus', 'Notification'],
];

/** CSV safe for Excel/Sheets: quoted cells, and formulas (=, +, -, @) neutralised. */
export function toCsv(items: Enquiry[]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [HEADERS.map(([, h]) => cell(h)).join(','), ...items.map((e) => HEADERS.map(([k]) => cell(e[k])).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n';
}
