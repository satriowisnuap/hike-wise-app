import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  ecoScore: number;
  totalTrips: number;
  suspended: boolean;
  createdAt: Timestamp;
}

export interface Mountain {
  id: string;
  name: string;
  province: string;
  altitude: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description: string;
  baseCamp: string;
  entryFee: number;
  isOpen: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Trip {
  id: string;
  userId: string;
  mountainId: string;
  mountainName: string;
  title: string;
  mountainDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  members: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'planned' | 'ongoing' | 'completed';
  itinerary: ItineraryDay[];
  packingList: PackingCategory[];
  safetyResult: SafetyResult | null;
  ecoLog: {
    wasteKg: number;
    notes: string;
    loggedAt: Timestamp | null;
  };
  createdAt: Timestamp;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    notes: string;
    durationMinutes: number;
    icon: string;
  }[];
}

export interface PackingCategory {
  category: string;
  icon: string;
  items: PackingItem[];
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isEssential: boolean;
  checked: boolean;
}

export interface SafetyResult {
  status: 'GO' | 'CAUTION' | 'NO-GO';
  score: number;
  recommendations: string[];
  warnings: string[];
  improvements: string[];
}

export interface TrailReport {
  id: string;
  userId: string;
  userName: string;
  mountainId: string;
  mountainName: string;
  condition: 'good' | 'caution' | 'danger';
  weather: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionNote: string;
  createdAt: Timestamp;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  triggerCondition: string;
  category: 'explorer' | 'eco' | 'safety' | 'community';
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Timestamp;
}
