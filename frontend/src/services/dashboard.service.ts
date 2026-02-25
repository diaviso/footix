import api from '@/lib/api';

export interface DashboardStats {
  themes: number;
  quizzes: number;
  blogs: number;
  discussions: number;
  userQuizAttempts: number;
}

export interface Activity {
  type: 'quiz' | 'article' | 'forum';
  title: string;
  time: string;
  score?: string;
}

export interface UserProgress {
  quizSuccessRate: number;
  quizCompletionRate: number;
  blogReadRate: number;
  forumParticipationRate: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getUserActivity(): Promise<Activity[]> {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },

  async getUserProgress(): Promise<UserProgress> {
    const response = await api.get('/dashboard/progress');
    return response.data;
  },
};
