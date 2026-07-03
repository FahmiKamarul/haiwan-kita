// src/services/attendanceService.ts
import { Linking } from 'react-native';
import api from '../lib/api';
import { AttendanceResult } from '../types';

const API_BASE_URL = api.defaults.baseURL;

export const attendanceService = {
  /**
   * POST /api/v1/missions/verify-attendance
   * MEMBER / ADMIN only. Triggers async certificate generation.
   */
  async verifyAttendance(
    projectId: string,
    userId?: string,
    notes?: string
  ): Promise<AttendanceResult> {
    const res = await api.post('/api/v1/missions/verify-attendance', {
      projectId,
      ...(userId && { userId }),
      ...(notes && { notes }),
    });
    return res.data.data as AttendanceResult;
  },

  /**
   * Open a PDF certificate in the device browser or PDF viewer.
   * @param certificateUrl  e.g. "/certificates/cert_clxyz789.pdf"
   */
  async openCertificate(certificateUrl: string): Promise<void> {
    const fullUrl = `${API_BASE_URL}${certificateUrl}`;
    const canOpen = await Linking.canOpenURL(fullUrl);
    if (canOpen) {
      await Linking.openURL(fullUrl);
    } else {
      throw new Error('Tidak dapat membuka sijil PDF.');
    }
  },

  /**
   * Get full certificate URL string (for display / copy)
   */
  getCertificateUrl(certificateUrl: string): string {
    return `${API_BASE_URL}${certificateUrl}`;
  },

  /**
   * Approve a project (Admin) — endpoint to be confirmed
   */
  async approveProject(projectId: string): Promise<{ message: string }> {
    const res = await api.post(`/api/v1/missions/${projectId}/approve`);
    return res.data.data;
  },

  async rejectProject(projectId: string, reason?: string): Promise<{ message: string }> {
    const res = await api.post(`/api/v1/missions/${projectId}/reject`, { reason });
    return res.data.data;
  },
};
