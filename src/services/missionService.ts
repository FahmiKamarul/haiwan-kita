// src/services/missionService.ts
import api from '../lib/api';
import { Mission, MissionListParams, MissionsResponse } from '../types';

export interface Participant {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  skills: string;
  joinedAt: string;
}

export const missionService = {
  /**
   * GET /api/v1/missions — paginated, filterable list
   */
  async getMissions(params: MissionListParams = {}): Promise<MissionsResponse> {
    const res = await api.get('/api/v1/missions', { params });
    return res.data.data as MissionsResponse;
  },

  /**
   * GET /api/v1/missions/:id — full mission details
   */
  async getMissionById(id: string): Promise<Mission> {
    const res = await api.get(`/api/v1/missions/${id}`);
    return res.data.data as Mission;
  },

  /**
   * POST /api/v1/missions/join
   * Errors: 409 (already joined / full), 400 (cancelled/completed)
   */
  async joinMission(projectId: string): Promise<{ message: string; projectId: string }> {
    const res = await api.post('/api/v1/missions/join', { projectId });
    return res.data.data;
  },

  /**
   * POST /api/v1/missions/leave
   * Volunteer cancels registration. Blocked within 7 days of startDate.
   */
  async leaveMission(projectId: string): Promise<{ message: string; projectId: string }> {
    const res = await api.post('/api/v1/missions/leave', { projectId });
    return res.data.data;
  },

  /**
   * POST /api/v1/missions/verify-attendance
   * MEMBER / ADMIN only
   */
  async verifyAttendance(
    projectId: string,
    userId?: string,
    notes?: string
  ): Promise<{
    attendanceId: string;
    status: string;
    verifiedAt: string;
    certificateStatus: string;
    message: string;
  }> {
    const res = await api.post('/api/v1/missions/verify-attendance', {
      projectId,
      ...(userId && { userId }),
      ...(notes && { notes }),
    });
    return res.data.data;
  },

  /**
   * POST /api/v1/missions — Create / propose a new mission (MEMBER only)
   */
  async createMission(payload: {
    title: string;
    category: string;
    startDate: string;
    location: string;
    description: string;
    requiredVolunteers: number;
  }): Promise<Mission> {
    const res = await api.post('/api/v1/missions', payload);
    return res.data.data as Mission;
  },

  /**
   * GET /api/v1/missions/:id/participants — MEMBER / ADMIN
   * Returns the real list of registered volunteers for attendance marking.
   */
  async getParticipants(missionId: string): Promise<Participant[]> {
    const res = await api.get(`/api/v1/missions/${missionId}/participants`);
    return res.data.data as Participant[];
  },

  /**
   * GET /api/v1/missions/my-missions — VOLUNTEER only
   * Returns missions the volunteer has joined (history + active).
   */
  async getMyMissions(): Promise<Mission[]> {
    const res = await api.get('/api/v1/missions/my-missions');
    return res.data.data as Mission[];
  },

  /**
   * POST /api/v1/missions/:id/conclude — MEMBER only
   * Marks a project as COMPLETED.
   */
  async concludeMission(projectId: string): Promise<{ projectId: string; message: string }> {
    const res = await api.post(`/api/v1/missions/${projectId}/conclude`);
    return res.data.data;
  },


};
