class App {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.views = document.querySelectorAll('.view');

        this.init();
    }

    init() {
        // Add click handlers to navigation buttons
        this.navButtons.forEach(button => {
            button.addEventListener('click', () => this.switchView(button.dataset.view));
        });
    }

    switchView(viewName) {
        // Update active state of nav buttons
        this.navButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === viewName);
        });

        // Show/hide views
        this.views.forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        // Refresh data if needed
        if (viewName === 'teams') {
            teams.loadTeams();
        } else if (viewName === 'members') {
            members.loadMembers();
        } else if (viewName === 'xp-submission') {
            // Refresh teams and members for batch XP submission
            if (window.batchXP) {
                batchXP.loadTeamsAndMembers();
            }
        } else if (viewName === 'leaderboard') {
            leaderboard.updateLeaderboard();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 