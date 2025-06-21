class XP {
    constructor() {
        // Check if the old form exists (for backward compatibility)
        this.xpSubmissionForm = document.getElementById('xp-submission-form');
        
        if (this.xpSubmissionForm) {
            this.init();
        }
    }

    init() {
        if (this.xpSubmissionForm) {
            this.xpSubmissionForm.addEventListener('submit', (e) => this.handleXPSubmission(e));
        }
    }

    async handleXPSubmission(e) {
        e.preventDefault();
        
        const memberId = document.getElementById('xp-member').value;
        const weekStart = document.getElementById('week-start').value;
        const weekEnd = document.getElementById('week-end').value;
        const xpAmount = document.getElementById('xp-amount').value;

        try {
            const { data, error } = await supabase
                .from('xp_submissions')
                .insert([{
                    member_id: memberId,
                    week_start: weekStart,
                    week_end: weekEnd,
                    xp_earned: xpAmount
                }])
                .select();

            if (error) throw error;

            this.xpSubmissionForm.reset();
            alert('XP submitted successfully!');
        } catch (error) {
            alert('Error submitting XP: ' + error.message);
        }
    }
}

// Initialize XP when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xp = new XP();
}); 