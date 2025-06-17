class Teams {
    constructor() {
        this.createTeamForm = document.getElementById('create-team-form');
        this.teamsList = document.getElementById('teams-list');

        this.init();
    }

    init() {
        this.createTeamForm.addEventListener('submit', (e) => this.handleCreateTeam(e));
        this.loadTeams();
    }

    async handleCreateTeam(e) {
        e.preventDefault();
        
        const teamName = document.getElementById('team-name').value;

        try {
            const { data, error } = await supabase
                .from('teams')
                .insert([{ name: teamName }])
                .select();

            if (error) throw error;

            this.createTeamForm.reset();
            this.loadTeams();
        } catch (error) {
            alert('Error creating team: ' + error.message);
        }
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
            alert('Error loading teams: ' + error.message);
        }
    }

    renderTeams(teams) {
        this.teamsList.innerHTML = teams.map(team => `
            <div class="team-item" data-id="${team.id}">
                <div class="team-info">
                    <h3>${team.name}</h3>
                </div>
                <div class="team-actions">
                    <button class="btn btn-secondary" onclick="teams.deleteTeam(${team.id})">Delete</button>
                </div>
            </div>
        `).join('');

        // Update team select in members form
        const memberTeamSelect = document.getElementById('member-team');
        if (memberTeamSelect) {
            memberTeamSelect.innerHTML = teams.map(team => 
                `<option value="${team.id}">${team.name}</option>`
            ).join('');
        }
    }

    async deleteTeam(teamId) {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamId);

            if (error) throw error;

            this.loadTeams();
        } catch (error) {
            alert('Error deleting team: ' + error.message);
        }
    }
}

// Initialize teams when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teams = new Teams();
}); 