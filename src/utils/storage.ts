import { TrackedApp, DailyQuest, RewardItem, DayUsage, LeaderboardUser } from '../types';

export interface AppState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDay: string; // ISO string
  trackedApps: TrackedApp[];
  quests: DailyQuest[];
  rewardsStore: RewardItem[];
  usageHistory: DayUsage[];
  leaderboard: LeaderboardUser[];
  selectedTheme: string;
  selectedSkin: string; // 'panda_classic' | 'panda_zen' | 'panda_gold'
  hardcoreMode: boolean;
  blockCounter: number;
}

export const INITIAL_TRACKED_APPS: TrackedApp[] = [
  { id: 'app_instagram', name: 'Instagram', category: 'Social', icon: 'Instagram', color: 'from-pink-500 to-purple-600', usageMinutes: 42, limitMinutes: 30, isBlocked: false },
  { id: 'app_tiktok', name: 'TikTok', category: 'Social', icon: 'Flame', color: 'from-cyan-400 to-rose-500', usageMinutes: 75, limitMinutes: 45, isBlocked: true },
  { id: 'app_youtube', name: 'YouTube', category: 'Entertainment', icon: 'Youtube', color: 'from-red-600 to-rose-700', usageMinutes: 38, limitMinutes: 60, isBlocked: false },
  { id: 'app_reddit', name: 'Reddit', category: 'Social', icon: 'MessageSquare', color: 'from-orange-500 to-amber-600', usageMinutes: 18, limitMinutes: 20, isBlocked: false },
  { id: 'app_clash', name: 'Clash Royale', category: 'Games', icon: 'Gamepad2', color: 'from-blue-500 to-indigo-600', usageMinutes: 25, limitMinutes: 15, isBlocked: true },
  { id: 'app_slack', name: 'Slack', category: 'Productivity', icon: 'Slack', color: 'from-emerald-500 to-teal-600', usageMinutes: 15, limitMinutes: null, isBlocked: false },
];

export const INITIAL_QUESTS: DailyQuest[] = [
  { id: 'q_session', title: 'Complete a Deep Focus Session', points: 50, progress: 0, target: 1, unit: 'session', completed: false },
  { id: 'q_screentime', title: 'Keep daily screen time under 3 hours', points: 100, progress: 213, target: 180, unit: 'mins', completed: false }, // 213 is current, wait, progress of screentime is the screen time limit remaining
  { id: 'q_blocks', title: 'Shield Zenji from 5 distractions', points: 75, progress: 3, target: 5, unit: 'blocks', completed: false },
  { id: 'q_prod', title: 'Log 45 minutes of productive focus', points: 120, progress: 15, target: 45, unit: 'mins', completed: false },
];

export const INITIAL_REWARDS: RewardItem[] = [
  { id: 'rw_zen_skin', name: 'Meditation Kimono', description: 'Gives Zenji a serene green kimono. Boosts focus visual appeal.', cost: 300, category: 'skins', unlocked: false, value: 'panda_zen', icon: 'Shirt' },
  { id: 'rw_gold_skin', name: 'Golden Master', description: 'Drape Zenji in solid gold. Shows ultimate focus dedication.', cost: 800, category: 'skins', unlocked: false, value: 'panda_gold', icon: 'Sparkles' },
  { id: 'rw_theme_sakura', name: 'Sakura Blush Theme', description: 'Warm pink theme with cherry blossoms and peaceful ambient accent.', cost: 250, category: 'themes', unlocked: false, value: 'sakura', icon: 'Palette' },
  { id: 'rw_theme_cyber', name: 'Cyberpunk Shield Theme', description: 'Electric neon-cyan interface with matrix-style block overlays.', cost: 400, category: 'themes', unlocked: false, value: 'cyberpunk', icon: 'Palette' },
  { id: 'rw_shield_doge', name: 'Doge Meme Shield', description: 'Replaces blocked app pages with encouragingly sarcastic Doge memes.', cost: 150, category: 'shields', unlocked: true, value: 'doge', icon: 'ShieldAlert' },
  { id: 'rw_shield_philosophy', name: 'Stoic Wisdom Shield', description: 'Replaces blocked apps with mind-centering quotes from Seneca and Marcus Aurelius.', cost: 200, category: 'shields', unlocked: false, value: 'stoic', icon: 'Quote' },
];

export const INITIAL_USAGE_HISTORY: DayUsage[] = [
  { day: 'Thu', screenTimeMins: 245, focusMins: 45, blocksCount: 12 },
  { day: 'Fri', screenTimeMins: 190, focusMins: 60, blocksCount: 18 },
  { day: 'Sat', screenTimeMins: 320, focusMins: 25, blocksCount: 6 },
  { day: 'Sun', screenTimeMins: 280, focusMins: 30, blocksCount: 8 },
  { day: 'Mon', screenTimeMins: 165, focusMins: 90, blocksCount: 22 },
  { day: 'Tue', screenTimeMins: 185, focusMins: 50, blocksCount: 15 },
  { day: 'Wed (Today)', screenTimeMins: 213, focusMins: 75, blocksCount: 19 },
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'FocusMaster99', xp: 2450, avatarColor: 'bg-yellow-500' },
  { rank: 2, name: 'BePresent_Guru', xp: 1980, avatarColor: 'bg-emerald-500' },
  { rank: 3, name: 'ZenPanda_X', xp: 1540, avatarColor: 'bg-indigo-500' },
  { rank: 4, name: 'You (Focus Rookie)', xp: 850, avatarColor: 'bg-amber-500', isCurrentUser: true },
  { rank: 5, name: 'TikTokFreeZone', xp: 720, avatarColor: 'bg-pink-500' },
  { rank: 6, name: 'ProductiveNerd', xp: 610, avatarColor: 'bg-purple-500' },
];

const LOCAL_STORAGE_KEY = 'bepresent_state_v1';

export function getInitialState(): AppState {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load local storage:', e);
  }

  return {
    xp: 850,
    level: 3,
    streak: 5,
    lastActiveDay: new Date().toISOString(),
    trackedApps: INITIAL_TRACKED_APPS,
    quests: INITIAL_QUESTS,
    rewardsStore: INITIAL_REWARDS,
    usageHistory: INITIAL_USAGE_HISTORY,
    leaderboard: INITIAL_LEADERBOARD,
    selectedTheme: 'classic',
    selectedSkin: 'panda_classic',
    hardcoreMode: false,
    blockCounter: 19,
  };
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}
