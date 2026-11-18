export const ENQUIRY_TYPES = ['audit', 'newsletter'] as const;
export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;
export const NOTIFICATION_STATUSES = ['pending', 'sent', 'failed', 'not_configured', 'not_required'] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface Enquiry {
  id: number;
  type: EnquiryType;
  name: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  service: string | null;
  sourcePage: string | null;
  status: EnquiryStatus;
  notificationStatus: NotificationStatus;
  notificationError: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewEnquiry = Pick<Enquiry, 'type' | 'name' | 'phone' | 'email' | 'website' | 'service' | 'sourcePage'>;

export interface EnquiryFilter {
  type?: EnquiryType;
  status?: EnquiryStatus;
  /** Matches name, email, phone, website, service or source page */
  q?: string;
  /** ISO dates (inclusive) */
  from?: string;
  to?: string;
  limit?: number;
}
