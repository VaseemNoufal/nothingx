class Members {
    constructor() {
        this.createMemberForm = document.getElementById('create-member-form');
        this.membersList = document.getElementById('members-list');

        this.init();
    }

    init() {
        this.createMemberForm.addEventListener('submit', (e) => this.handleCreateMember(e));
        this.loadMembers();
    }

    async handleCreateMember(e) {
        e.preventDefault();
        
        const memberName = document.getElementById('member-name').value;
        const teamId = document.getElementById('member-team').value;
        const role = document.getElementById('member-role').value;

        try {
            const { data, error } = await supabase
                .from('members')
                .insert([{
                    name: memberName,
                    team_id: teamId,
                    role: role
                }])
                .select();

            if (error) throw error;

            this.createMemberForm.reset();
            this.loadMembers();
        } catch (error) {
            alert('Error creating member: ' + error.message);
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
            alert('Error loading members: ' + error.message);
        }
    }

    renderMembers(members) {
        this.membersList.innerHTML = members.map(member => `
            <div class="member-item" data-id="${member.id}">
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>Team: ${member.teams.name}</p>
                    <p>Role: ${member.role}</p>
                </div>
                <div class="member-actions">
                    <button class="btn btn-secondary" onclick="members.deleteMember(${member.id})">Delete</button>
                </div>
            </div>
        `).join('');

        // Update member select in XP submission form
        const xpMemberSelect = document.getElementById('xp-member');
        if (xpMemberSelect) {
            xpMemberSelect.innerHTML = members.map(member => 
                `<option value="${member.id}">${member.name} (${member.teams.name})</option>`
            ).join('');
        }
    }

    async deleteMember(memberId) {
        if (!confirm('Are you sure you want to delete this member?')) return;

        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            this.loadMembers();
        } catch (error) {
            alert('Error deleting member: ' + error.message);
        }
    }
}

// Initialize members when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.members = new Members();
}); 