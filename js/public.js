class PublicView {
    constructor() {
        this.leaderboardType = document.getElementById('leaderboard-type');
        this.leaderboardLevel = document.getElementById('leaderboard-level');
        this.weekStartLeaderboard = document.getElementById('week-start-leaderboard');
        this.weekEndLeaderboard = document.getElementById('week-end-leaderboard');
        this.leaderboardContainer = document.getElementById('leaderboard-container');
        this.teamsGrid = document.getElementById('teams-grid');
        this.membersGrid = document.getElementById('members-grid');
        this.dateRangeControls = document.getElementById('date-range-controls');

        this.init();
    }

    init() {
        // Add event listeners for leaderboard controls
        this.leaderboardType.addEventListener('change', () => this.updateLeaderboard());
        this.leaderboardLevel.addEventListener('change', () => this.updateLeaderboard());
        this.weekStartLeaderboard.addEventListener('change', () => this.updateLeaderboard());
        this.weekEndLeaderboard.addEventListener('change', () => this.updateLeaderboard());

        // Initial load
        this.loadTeams();
        this.loadMembers();
        this.updateLeaderboard();
    }

    async loadTeams() {
        try {
            const { data: teams, error } = await supabase
                .from('teams')
                .select('*')
                .order('name');

            if (error) throw error;

            this.renderTeams(teams);
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    }

    async loadMembers() {
        try {
            const { data: members, error } = await supabase
                .from('members')
                .select(`
                    *,
                    teams (
                        name
                    )
                `)
                .order('name');

            if (error) throw error;

            this.renderMembers(members);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    }

    renderTeams(teams) {
        this.teamsGrid.innerHTML = teams.map(team => `
            <div class="team-card">
                <h3>${team.name}</h3>
            </div>
        `).join('');
    }

    renderMembers(members) {
        this.membersGrid.innerHTML = members.map(member => `
            <div class="member-card">
                <h3>${member.name}</h3>
                <div class="role">${member.role === 'team_lead' ? 'Team Lead' : 'Member'}</div>
                <div class="team">${member.teams.name}</div>
            </div>
        `).join('');
    }

    async updateLeaderboard() {
        const type = this.leaderboardType.value;
        const level = this.leaderboardLevel.value;
        
        // Show/hide date range controls based on type
        this.dateRangeControls.style.display = type === 'weekly' ? 'flex' : 'none';

        try {
            let data;
            if (type === 'weekly') {
                data = await this.getWeeklyLeaderboard(level);
            } else {
                data = await this.getOverallLeaderboard(level);
            }

            this.renderLeaderboard(data, level);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    async getWeeklyLeaderboard(level) {
        const weekStart = this.weekStartLeaderboard.value;
        const weekEnd = this.weekEndLeaderboard.value;

        if (!weekStart || !weekEnd) {
            return [];
        }

        if (level === 'team') {
            const { data, error } = await supabase
                .from('xp_submissions')
                .select(`
                    xp_earned,
                    members (
                        teams (
                            id,
                            name
                        )
                    )
                `)
                .gte('week_start', weekStart)
                .lte('week_end', weekEnd);

            if (error) throw error;

            // Group by team and sum XP
            const teamXP = data.reduce((acc, submission) => {
                const teamId = submission.members.teams.id;
                const teamName = submission.members.teams.name;
                
                if (!acc[teamId]) {
                    acc[teamId] = { name: teamName, total_xp: 0 };
                }
                
                acc[teamId].total_xp += submission.xp_earned;
                return acc;
            }, {});

            return Object.values(teamXP).sort((a, b) => b.total_xp - a.total_xp);
        } else {
            const { data, error } = await supabase
                .from('xp_submissions')
                .select(`
                    xp_earned,
                    members (
                        id,
                        name,
                        teams (
                            name
                        )
                    )
                `)
                .gte('week_start', weekStart)
                .lte('week_end', weekEnd);

            if (error) throw error;

            // Group by member and sum XP
            const memberXP = data.reduce((acc, submission) => {
                const memberId = submission.members.id;
                const memberName = submission.members.name;
                const teamName = submission.members.teams.name;
                
                if (!acc[memberId]) {
                    acc[memberId] = { 
                        name: memberName, 
                        team: teamName,
                        total_xp: 0 
                    };
                }
                
                acc[memberId].total_xp += submission.xp_earned;
                return acc;
            }, {});

            return Object.values(memberXP).sort((a, b) => b.total_xp - a.total_xp);
        }
    }

    async getOverallLeaderboard(level) {
        if (level === 'team') {
            const { data, error } = await supabase
                .from('xp_submissions')
                .select(`
                    xp_earned,
                    members (
                        teams (
                            id,
                            name
                        )
                    )
                `);

            if (error) throw error;

            // Group by team and sum XP
            const teamXP = data.reduce((acc, submission) => {
                const teamId = submission.members.teams.id;
                const teamName = submission.members.teams.name;
                
                if (!acc[teamId]) {
                    acc[teamId] = { name: teamName, total_xp: 0 };
                }
                
                acc[teamId].total_xp += submission.xp_earned;
                return acc;
            }, {});

            return Object.values(teamXP).sort((a, b) => b.total_xp - a.total_xp);
        } else {
            const { data, error } = await supabase
                .from('xp_submissions')
                .select(`
                    xp_earned,
                    members (
                        id,
                        name,
                        teams (
                            name
                        )
                    )
                `);

            if (error) throw error;

            // Group by member and sum XP
            const memberXP = data.reduce((acc, submission) => {
                const memberId = submission.members.id;
                const memberName = submission.members.name;
                const teamName = submission.members.teams.name;
                
                if (!acc[memberId]) {
                    acc[memberId] = { 
                        name: memberName, 
                        team: teamName,
                        total_xp: 0 
                    };
                }
                
                acc[memberId].total_xp += submission.xp_earned;
                return acc;
            }, {});

            return Object.values(memberXP).sort((a, b) => b.total_xp - a.total_xp);
        }
    }

    renderLeaderboard(data, level) {
        const type = this.leaderboardType.value;
        const title = `${type.charAt(0).toUpperCase() + type.slice(1)} ${level.charAt(0).toUpperCase() + level.slice(1)} Leaderboard`;

        this.leaderboardContainer.innerHTML = `
            <h3>${title}</h3>
            <div class="leaderboard-list">
                ${data.map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="info">
                            <div class="name">${item.name}</div>
                            ${level === 'individual' ? `<div class="team">${item.team}</div>` : ''}
                        </div>
                        <div class="xp">${item.total_xp} XP</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize public view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publicView = new PublicView();
}); 