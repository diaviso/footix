import api from '@/lib/api';

export interface DuelParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  rank: number | null;
  starsWon: number;
  correctCount: number;
  score: number;
  finishedAt: string | null;
}

export interface Duel {
  id: string;
  code: string;
  creatorId: string;
  maxParticipants: number;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE' | 'ALEATOIRE';
  starsCost: number;
  status: 'WAITING' | 'READY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';
  startedAt: string | null;
  finishedAt: string | null;
  expiresAt: string;
  isCreator: boolean;
  participants: DuelParticipant[];
}

export interface DuelListItem {
  id: string;
  code: string;
  difficulty: string;
  starsCost: number;
  status: string;
  maxParticipants: number;
  participantCount: number;
  isCreator: boolean;
  myRank: number | null;
  myStarsWon: number;
  myCorrectCount: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  participants: DuelParticipant[];
}

export interface DuelQuestion {
  id: string;
  content: string;
  type: 'QCU' | 'QCM';
  options: {
    id: string;
    content: string;
    isCorrect?: boolean;
    explanation?: string | null;
  }[];
}

export interface DuelQuestionsResponse {
  questions: DuelQuestion[];
  timeLimit: number;
  startedAt: string;
}

export const duelService = {
  async create(data: { maxParticipants: number; difficulty: string }): Promise<Duel> {
    const response = await api.post('/duels', data);
    return response.data;
  },

  async join(code: string): Promise<Duel> {
    const response = await api.post('/duels/join', { code: code.toUpperCase() });
    return response.data;
  },

  async getMyDuels(): Promise<DuelListItem[]> {
    const response = await api.get('/duels/my');
    return response.data;
  },

  async getDuel(id: string): Promise<Duel> {
    const response = await api.get(`/duels/${id}`);
    return response.data;
  },

  async getQuestions(id: string): Promise<DuelQuestionsResponse> {
    const response = await api.get(`/duels/${id}/questions`);
    return response.data;
  },

  async launch(id: string): Promise<{ message: string; startedAt: string }> {
    const response = await api.post(`/duels/${id}/launch`);
    return response.data;
  },

  async submit(duelId: string, answers: Record<string, string[]>): Promise<{ score: number; correctCount: number; total: number }> {
    const response = await api.post('/duels/submit', { duelId, answers });
    return response.data;
  },

  async leave(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/duels/${id}/leave`);
    return response.data;
  },
};
