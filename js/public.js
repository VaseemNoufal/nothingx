class PublicView {
    constructor() {
        this.leaderboardType = document.getElementById('leaderboard-type');
        this.leaderboardLevel = document.getElementById('leaderboard-level');
        this.weekStartLeaderboard = document.getElementById('week-start-leaderboard');
        this.weekEndLeaderboard = document.getElementById('week-end-leaderboard');
        this.leaderboardContainer = document.getElementById('leaderboard-container');
        this.teamsContainer = document.getElementById('teams-dropdown-container');
        this.dateRangeControls = document.getElementById('date-range-controls');

        this.teams = [];
        this.members = [];

        this.init();
    }

    init() {
        // Add event listeners for leaderboard controls
        this.leaderboardType.addEventListener('change', () => this.updateLeaderboard());
        this.leaderboardLevel.addEventListener('change', () => this.updateLeaderboard());
        
        // This listener now correctly handles the entire date change sequence
        this.weekStartLeaderboard.addEventListener('change', () => {
            this.updateEndDate();       // 1. First, calculate the new end date
            this.updateLeaderboard();   // 2. Then, refresh the leaderboard with the new dates
        });
        
        this.weekEndLeaderboard.readOnly = true;

        // Initial load
        this.setupDatePicker();
        this.loadTeamsAndMembers();
        this.updateLeaderboard();
    }

    setupDatePicker() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1...
        const mostRecentSunday = new Date(today);
        // Go back to the last Sunday
        mostRecentSunday.setDate(today.getDate() - dayOfWeek);

        this.weekStartLeaderboard.value = mostRecentSunday.toISOString().split('T')[0];
        this.updateEndDate();

        // The event listener has been moved to init() to consolidate logic
    }

    updateEndDate() {
        const startDate = new Date(this.weekStartLeaderboard.value);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Set to 6 days after for a 7-day week
        this.weekEndLeaderboard.value = endDate.toISOString().split('T')[0];
    }

    async loadTeamsAndMembers() {
        try {
            // Load teams
            const { data: teamsData, error: teamsError } = await supabase
                .from('teams')
                .select('*')
                .order('name');

            if (teamsError) throw teamsError;
            this.teams = teamsData;

            // Load members with team info
            const { data: membersData, error: membersError } = await supabase
                .from('members')
                .select(`
                    *,
                    teams(name)
                `)
                .order('name');

            if (membersError) throw membersError;
            this.members = membersData;

            // Render the UI
            this.renderTeamsDropdown();
        } catch (error) {
            console.error('Error loading teams and members:', error);
        }
    }

    renderTeamsDropdown() {
        this.teamsContainer.innerHTML = '';

        this.teams.forEach((team, index) => {
            const teamMembers = this.members.filter(member => member.team_id === team.id);
            
            if (teamMembers.length === 0) return; // Skip teams with no members

            const teamDropdown = document.createElement('div');
            teamDropdown.className = 'team-dropdown';
            teamDropdown.innerHTML = `
                <div class="team-header" onclick="publicView.toggleTeam(this)">
                    <span class="team-name">${team.name}</span>
                    <span class="team-toggle ${index === 0 ? 'expanded' : ''}">▼</span>
                </div>
                <div class="team-members ${index === 0 ? 'expanded' : ''}">
                    ${teamMembers.map(member => this.createMemberRow(member)).join('')}
                </div>
            `;

            this.teamsContainer.appendChild(teamDropdown);
        });
    }

    createMemberRow(member) {
        return `
            <div class="member-row" data-member-id="${member.id}">
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-role ${member.role}">${member.role === 'team_lead' ? 'Team Lead' : 'Member'}</span>
                </div>
            </div>
        `;
    }

    toggleTeam(headerElement) {
        const teamDropdown = headerElement.parentElement;
        const membersDiv = teamDropdown.querySelector('.team-members');
        const toggleIcon = headerElement.querySelector('.team-toggle');
        
        const isExpanded = membersDiv.classList.contains('expanded');
        
        if (isExpanded) {
            membersDiv.classList.remove('expanded');
            toggleIcon.classList.remove('expanded');
        } else {
            membersDiv.classList.add('expanded');
            toggleIcon.classList.add('expanded');
        }
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

        if (!data || data.length === 0) {
            this.leaderboardContainer.innerHTML = `
                <h3>${title}</h3>
                <p class="no-data-message">No XP data found for this period. Try another date range!</p>
            `;
            return;
        }

        const topThree = data.slice(0, 3);
        const theRest = data.slice(3);

        const podiumOrder = {
            second: topThree[1],
            first: topThree[0],
            third: topThree[2],
        };

        this.leaderboardContainer.innerHTML = `
            <h3>${title}</h3>
            <div class="leaderboard-podium">
                ${podiumOrder.second ? this.createPodiumCard(podiumOrder.second, 2, level) : '<div class="podium-card empty"></div>'}
                ${podiumOrder.first ? this.createPodiumCard(podiumOrder.first, 1, level) : '<div class="podium-card empty rank-1"></div>'}
                ${podiumOrder.third ? this.createPodiumCard(podiumOrder.third, 3, level) : '<div class="podium-card empty"></div>'}
            </div>

            ${theRest.length > 0 ? `
                <div class="leaderboard-list-rest">
                    ${theRest.map((item, index) => this.createRestListItem(item, index + 4, level)).join('')}
                </div>
            ` : ''}
        `;
    }

    createPodiumCard(item, rank, level) {
        return `
            <div class="podium-card rank-${rank}">
                ${rank === 1 ? '<div class="podium-crown">👑</div>' : ''}
                <div class="podium-rank-badge">${rank}</div>
                <div class="podium-name">${item.name}</div>
                <div class="podium-xp">${item.total_xp.toLocaleString()}</div>
                ${level === 'individual' ? `<div class="podium-team">${item.team}</div>` : ''}
            </div>
        `;
    }

    createRestListItem(item, rank, level) {
        return `
            <div class="leaderboard-item-rest">
                <div class="rest-rank">
                    <span>${rank}</span>
                </div>
                <div class="rest-info">
                    <div class="rest-name">${item.name}</div>
                    ${level === 'individual' ? `<div class="rest-team">${item.team}</div>` : ''}
                </div>
                <div class="rest-xp">${item.total_xp.toLocaleString()} XP</div>
            </div>
        `;
    }
}

// Initialize public view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publicView = new PublicView();
}); 