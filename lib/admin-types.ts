export type Role = "ADMIN" | "EDITOR" | "MEMBER";
export type Profile = {
  userId: string; email: string; roles: Role[];
  personal?: { firstName: string; lastName: string; phone?: string; city?: string; biography?: string };
};
export type PageResult<T> = { content: T[]; totalElements: number; totalPages: number; page: number };
export type AnnouncementRecord = {
  id: string; title: string; slug: string; summary?: string; content: string; category?: string;
  coverImageUrl?: string; coverImageAltText?: string; status: string; pinned: boolean; featured: boolean;
  displayOrder: number; publishedAt?: string; createdAt: string;
};
export type ContentRecord = {
  id: string; page: string; type: string; key: string; title?: string; subtitle?: string; body?: string;
  imageUrl?: string; imageAltText?: string; linkLabel?: string; linkUrl?: string;
  metadata?: unknown; displayOrder: number; featured: boolean; active: boolean;
};
export type SettingRecord = { id: string; key: string; value?: string; type: string; description?: string; publicSetting: boolean };
export type MemberRecord = {
  userId: string; firstName: string; lastName: string; email: string; phone?: string;
  membershipStatus: string; institutionName?: string; department?: string; interests: string[]; appliedAt: string;
};
export type MemberDetail = Profile & {
  education?: { institutionName: string; faculty: string; department: string; classLevel?: string; schoolEmail?: string };
  membership?: { status: string; motivation: string; experienceLevel: string; volunteerForEvents: boolean; interests: { name: string }[]; reviewNote?: string };
  consentRecords: { type: string; accepted: boolean; documentVersion: string; recordedAt: string }[];
};
export type MessageRecord = { id: string; name: string; email: string; phone?: string; subject: string; message: string; status: string; createdAt: string };
export type UserRecord = { id: string; firstName: string; lastName: string; email: string; status: string; roles: Role[]; createdAt: string };
