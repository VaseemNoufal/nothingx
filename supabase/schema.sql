-- Create teams table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create members table
CREATE TABLE members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('team_lead', 'member')),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create xp_submissions table
CREATE TABLE xp_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_week_range CHECK (week_end >= week_start)
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teams policies
CREATE POLICY "Teams are viewable by authenticated users" ON teams
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teams are insertable by authenticated users" ON teams
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Teams are deletable by authenticated users" ON teams
    FOR DELETE TO authenticated USING (true);

-- Members policies
CREATE POLICY "Members are viewable by authenticated users" ON members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members are insertable by authenticated users" ON members
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Members are deletable by authenticated users" ON members
    FOR DELETE TO authenticated USING (true);

-- XP Submissions policies
CREATE POLICY "XP submissions are viewable by authenticated users" ON xp_submissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "XP submissions are insertable by authenticated users" ON xp_submissions
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_members_team_id ON members(team_id);
CREATE INDEX idx_xp_submissions_member_id ON xp_submissions(member_id);
CREATE INDEX idx_xp_submissions_week_range ON xp_submissions(week_start, week_end); 