class BatchXP {
    constructor() {
        this.weekStartInput = document.getElementById('batch-week-start');
        this.weekEndInput = document.getElementById('batch-week-end');
        this.teamsContainer = document.getElementById('teams-dropdown-container');
        this.submitBtn = document.getElementById('batch-submit-btn');
        this.statusDiv = document.getElementById('submission-status');
        
        this.teams = [];
        this.members = [];
        
        this.init();
    }

    init() {
        // Set up date picker logic
        this.setupDatePicker();
        
        // Set up submit button
        this.submitBtn.addEventListener('click', () => this.handleBatchSubmission());
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Load teams and members when view is shown
        this.loadTeamsAndMembers();
    }

    setupDatePicker() {
        // Set default start date to today
        const today = new Date();
        this.weekStartInput.value = today.toISOString().split('T')[0];
        
        // Calculate and set end date (7 days after start)
        this.updateEndDate();
        
        // Update end date when start date changes
        this.weekStartInput.addEventListener('change', () => this.updateEndDate());
    }

    updateEndDate() {
        const startDate = new Date(this.weekStartInput.value);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // 7 days total (including start date)
        
        this.weekEndInput.value = endDate.toISOString().split('T')[0];
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
            this.showStatus('Error loading teams and members: ' + error.message, 'error');
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
                <div class="team-header" onclick="batchXP.toggleTeam(this)">
                    <span class="team-name">${team.name}</span>
                    <span class="team-toggle ${index === 0 ? 'expanded' : ''}">▼</span>
                </div>
                <div class="team-members ${index === 0 ? 'expanded' : ''}">
                    ${teamMembers.map(member => this.createMemberRow(member)).join('')}
                </div>
            `;

            this.teamsContainer.appendChild(teamDropdown);
        });

        // Auto-focus on the first XP input after a short delay
        setTimeout(() => {
            const firstXpInput = document.querySelector('.xp-input');
            if (firstXpInput) {
                firstXpInput.focus();
            }
        }, 500);
    }

    createMemberRow(member) {
        return `
            <div class="member-row" data-member-id="${member.id}">
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-role ${member.role}">${member.role === 'team_lead' ? 'Team Lead' : 'Member'}</span>
                </div>
                <div class="xp-input-container">
                    <span class="xp-label">XP:</span>
                    <input type="number" class="xp-input" min="0" placeholder="0" data-member-id="${member.id}">
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

    async handleBatchSubmission() {
        const weekStart = this.weekStartInput.value;
        const weekEnd = this.weekEndInput.value;

        if (!weekStart || !weekEnd) {
            this.showStatus('Please select a start date', 'error');
            return;
        }

        // Collect all XP inputs
        const xpInputs = document.querySelectorAll('.xp-input');
        const submissions = [];

        xpInputs.forEach(input => {
            const xpValue = parseInt(input.value) || 0;
            if (xpValue > 0) {
                submissions.push({
                    member_id: input.dataset.memberId,
                    week_start: weekStart,
                    week_end: weekEnd,
                    xp_earned: xpValue
                });
            }
        });

        if (submissions.length === 0) {
            this.showStatus('Please enter XP for at least one member', 'error');
            return;
        }

        // Show loading state
        this.showStatus(`Submitting XP for ${submissions.length} member(s)...`, 'loading');
        this.submitBtn.disabled = true;

        try {
            // Submit all XP in batch
            const { data, error } = await supabase
                .from('xp_submissions')
                .insert(submissions)
                .select();

            if (error) throw error;

            // Clear all inputs
            xpInputs.forEach(input => input.value = '');

            this.showStatus(`Successfully submitted XP for ${submissions.length} member(s)!`, 'success');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                this.submitBtn.disabled = false;
                this.statusDiv.innerHTML = '';
            }, 3000);

        } catch (error) {
            console.error('Error submitting batch XP:', error);
            this.showStatus('Error submitting XP: ' + error.message, 'error');
            this.submitBtn.disabled = false;
        }
    }

    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `submission-status ${type}`;
    }

    setupKeyboardShortcuts() {
        // Allow Enter key to submit
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.handleBatchSubmission();
            }
        });

        // Allow Tab navigation through XP inputs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && e.target.classList.contains('xp-input')) {
                // Let the browser handle default tab behavior
                // We just want to ensure smooth navigation
            }
        });
    }
}

// Initialize BatchXP when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.batchXP = new BatchXP();
}); 