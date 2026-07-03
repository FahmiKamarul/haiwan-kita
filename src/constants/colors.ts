// SAFM "Haiwan Kita" Color Palette
export const Colors = {
  // Primary
  primary: '#F97316',       // SAFM Orange
  primaryDark: '#EA6C0A',
  primaryLight: '#FEF3EB',
  primaryMuted: '#FDE8D8',

  // Secondary / Accents
  success: '#22C55E',
  successLight: '#DCFCE7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F7FA',
  cardBg: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status
  statusActive: '#22C55E',
  statusPending: '#F59E0B',
  statusCompleted: '#6B7280',
  statusCancelled: '#EF4444',

  // Categories
  catRescue: '#EF4444',
  catAdoption: '#8B5CF6',
  catMedical: '#3B82F6',
  catAwareness: '#F59E0B',
  catFeeding: '#22C55E',
  catOther: '#6B7280',

  // Map
  mapPin: '#F97316',
  mapPinVolunteer: '#3B82F6',
};

export const CategoryColors: Record<string, string> = {
  RESCUE: Colors.catRescue,
  ADOPTION: Colors.catAdoption,
  MEDICAL: Colors.catMedical,
  AWARENESS: Colors.catAwareness,
  FEEDING: Colors.catFeeding,
  OTHER: Colors.catOther,
};
