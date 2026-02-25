export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  isVerified: boolean;
  stars: number;
  showInLeaderboard: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  autoRenew: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: string;
  themeId: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  displayOrder: number;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  theme?: Theme;
}

export interface Question {
  id: string;
  quizId: string;
  content: string;
  type: 'QCM' | 'QCU';
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  points: number;
  createdAt: string;
  updatedAt: string;
  options?: Option[];
}

export interface Option {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  starsEarned: number;
  completedAt: string;
  quiz?: Quiz;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  stars: number;
}

export interface UserPosition {
  rank: number;
  stars: number;
  totalUsers: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { articles: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string; lastName: string };
  category?: BlogCategory;
  tags?: Tag[];
  _count?: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  userId: string;
  articleId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string };
  _count?: { likes: number };
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { topics: number };
}

export interface ForumTopic {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  content: string;
  status: 'OUVERT' | 'FERME' | 'RESOLU';
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string; lastName: string };
  category?: ForumCategory;
  comments?: ForumComment[];
  _count?: { comments: number };
}

export interface ForumComment {
  id: string;
  userId: string;
  topicId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string };
  replies?: ForumComment[];
  _count?: { likes: number };
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}
