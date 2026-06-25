export interface TrackedApp {
  id: string;
  name: string;
  category: 'Social' | 'Entertainment' | 'Productivity' | 'Games';
  icon: string;
  color: string;
  usageMinutes: number;
  limitMinutes: number | null; // null means no limit set
  isBlocked: boolean;
}

export interface FocusSession {
  durationMinutes: number;
  category: 'Work' | 'Study' | 'Mindfulness' | 'Reading';
  blockedApps: string[];
  isHardcore: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'skins' | 'themes' | 'shields';
  unlocked: boolean;
  value: string; // theme class or skin name
  icon: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  points: number;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatarColor: string;
  isCurrentUser?: boolean;
}

export interface DayUsage {
  day: string;
  screenTimeMins: number;
  focusMins: number;
  blocksCount: number;
}
