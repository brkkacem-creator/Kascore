export type MatchStatus = 'upcoming' | 'live' | 'finished' | 'postponed';
export type MatchPhase =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Team {
  id: string;
  name: string;
  short_name: string;
  flag_emoji: string;
  group_id?: string;
  api_id?: number;
}

export interface Group {
  id: string;
  name: string;
  teams: GroupStanding[];
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  qualified: boolean;
}

export interface Match {
  id: string;
  api_id?: number;
  home_team: Team;
  away_team: Team;
  home_score: number | null;
  away_score: number | null;
  scheduled_at: string;
  status: MatchStatus;
  phase: MatchPhase;
  group_id?: string;
  group_name?: string;
  stadium: string;
  city: string;
  minute?: number;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points: number | null;
  created_at: string;
  updated_at: string;
  match?: Match;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  favorite_team?: string;
  total_points: number;
  rank?: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
}

export interface PredictionResult {
  type: 'exact' | 'result' | 'miss';
  points: number;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'rank'>;
        Update: Partial<Profile>;
      };
      teams: {
        Row: Team;
        Insert: Team;
        Update: Partial<Team>;
      };
      matches: {
        Row: {
          id: string;
          api_id: number | null;
          home_team_id: string;
          away_team_id: string;
          home_score: number | null;
          away_score: number | null;
          scheduled_at: string;
          status: MatchStatus;
          phase: MatchPhase;
          group_id: string | null;
          stadium: string;
          city: string;
          minute: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Row']>;
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['predictions']['Row']>;
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardEntry;
      };
    };
  };
};
