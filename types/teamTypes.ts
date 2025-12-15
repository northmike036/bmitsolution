type TeamMember = {
  id: string;
  name: string;
  userName: string;
};

type TeamPerformance = {
  total: number;
  today: number;
  week: number;
};

export type Team = {
  id: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  performance?: TeamPerformance;
};

export type TeamPerformanceResponse = {
  teamId: string;

  summary: {
    dailyPosts: number;
    weeklyPosts: number;
    monthlyPosts: number;
    lastMonthPosts: number;
  };

  memberBreakdown: TeamMemberPerformance[];

  topPosters: TeamMemberPerformance[];
};

export type TeamMemberPerformance = {
  id: string;
  name: string;
  userName: string;

  daily: number;
  weekly: number;
  monthly: number;

  total: number;
};
