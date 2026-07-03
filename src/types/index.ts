// src/types/index.ts — Shared TypeScript types for the Haiwan Kita app
// ─── Prefixed ID Types ───────────────────────────────────────────────────────
// All IDs follow the format: PREFIX-XXXXX (e.g., USR-00001, PRJ-00024)
// Using branded types for compile-time safety.
export type UserId = string & { readonly __brand: 'UserId' };           // USR-XXXXX
export type ProjectId = string & { readonly __brand: 'ProjectId' };     // PRJ-XXXXX
export type ParticipantId = string & { readonly __brand: 'ParticipantId' }; // PTP-XXXXX
export type LocationId = string & { readonly __brand: 'LocationId' };   // LOC-XXXXX
export type AttendanceId = string & { readonly __brand: 'AttendanceId' }; // ATT-XXXXX
/** Generic prefixed ID — matches any PREFIX-XXXXX format */
export type PrefixedId = `${string}-${string}`;
/** Validates a string matches the prefixed ID format */
export function isValidPrefixedId(id: string, prefix?: string): boolean {
  const pattern = prefix
    ? new RegExp(`^${prefix}-\\d{5}$`)
    : /^[A-Z]{3}-\d{5}$/;
  return pattern.test(id);
}
/** Extracts the human-readable prefix from an ID */
export function getIdPrefix(id: string): string {
  return id.split('-')[0] ?? '';
}
/** Extracts the numeric sequence from a prefixed ID */
export function getIdSequence(id: string): number {
  const parts = id.split('-');
  return parseInt(parts[1] ?? '0', 10);
}
export type UserRole = 'VOLUNTEER' | 'MEMBER' | 'ADMIN';
export type PaymentStatus = 'PENDING' | 'PAID';
export type MissionState = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type MissionCategory = 'RESCUE' | 'ADOPTION' | 'MEDICAL' | 'AWARENESS' | 'FEEDING' | 'OTHER';
export type CertStatus = 'GENERATING' | 'GENERATED' | 'FAILED';
// ─── Auth ────────────────────────────────────────────────────────────────────
export interface MemberProfile {
  paymentStatus: PaymentStatus;
  membershipFeeRM: number;
  membershipExpiry?: string;
  paidAt?: string;
}
export interface VolunteerProfile {
  totalMissions: number;
  skills?: string;
}
export interface User {
  id: UserId;              // USR-XXXXX
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  token: string;
  createdAt?: string;
  memberProfile?: MemberProfile | null;
  volunteerProfile?: VolunteerProfile | null;
  // Only present after MEMBER registration before payment
  paymentRequired?: boolean;
  paymentStatus?: PaymentStatus;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'VOLUNTEER' | 'MEMBER';
  phone?: string;
  skills?: string;
}
// ─── Missions ────────────────────────────────────────────────────────────────
export interface MissionCreator {
  id: UserId;              // USR-XXXXX
  name: string;
  avatarUrl?: string | null;
}
export interface Mission {
  id: ProjectId;           // PRJ-XXXXX
  title: string;
  description: string;
  category: MissionCategory;
  state: MissionState;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  requiredVolunteers: number;
  currentParticipants: number;
  isGpsRequired: boolean;
  isFull: boolean;
  spotsRemaining: number;
  isJoined: boolean;       // true if the current user has registered
  createdBy: MissionCreator;
  createdAt: string;
  attendanceId?: AttendanceId | null;
  attendanceStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | null;
  certificateStatus?: CertStatus | null;
  certificateUrl?: string | null;
  certificateGeneratedAt?: string | null;
  attendanceNotes?: string | null;
  _count?: {
    participants: number;
    attendances: number;
  };
}
export interface MissionListParams {
  state?: string;
  category?: MissionCategory;
  search?: string;
  page?: number;
  limit?: number;
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface MissionsResponse {
  missions: Mission[];
  pagination: PaginationMeta;
}
// ─── Location ────────────────────────────────────────────────────────────────
export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  projectId?: ProjectId;   // PRJ-XXXXX
  isStreaming: boolean;
}
export interface LocationRecord {
  id: LocationId;          // LOC-XXXXX
  userId: UserId;          // USR-XXXXX
  latitude: number;
  longitude: number;
  timestamp: string;
  isStreaming: boolean;
  user?: {
    id: UserId;            // USR-XXXXX
    name: string;
    avatarUrl?: string | null;
  };
}
// ─── Attendance & Certificates ────────────────────────────────────────────────
export interface AttendanceResult {
  attendanceId: AttendanceId;  // ATT-XXXXX
  status: 'VERIFIED';
  verifiedAt: string;
  certificateStatus: CertStatus;
  certificateUrl?: string;
  message: string;
}
export interface VolunteerAttendee {
  id: UserId;              // USR-XXXXX
  name: string;
  skill?: string;
  isPresent: boolean;
}
// ─── API envelope ─────────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}
// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  VolunteerApp: undefined;
  MemberApp: undefined;
  AdminApp: undefined;
  PendingPayment: undefined;
};
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
export type VolunteerTabParamList = {
  Home: undefined;
  Search: undefined;
  ActivityHistory: undefined;
  Profile: undefined;
};
export type VolunteerStackParamList = {
  VolunteerTabs: undefined;
  MissionDetail: { missionId: ProjectId };
};
export type MemberTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Billing: undefined;
  Settings: undefined;
};
export type MemberStackParamList = {
  MemberTabs: undefined;
  MarkAttendance: { missionId: ProjectId; missionTitle: string };
  MissionDetail: { missionId: ProjectId };
  ProposeMission: undefined;
};
export type AdminTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Projects: undefined;
  Reports: undefined;
};
export type AdminStackParamList = {
  AdminTabs: undefined;
  ReviewProject: { projectId: ProjectId; projectTitle: string };
  MissionDetail: { missionId: ProjectId };
};
