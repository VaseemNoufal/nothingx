class Auth {
    constructor() {
        this.loginForm = document.getElementById('login');
        this.logoutBtn = document.getElementById('logout-btn');
        this.authSection = document.getElementById('auth-section');
        this.dashboardSection = document.getElementById('dashboard-section');
        
        this.init();
    }

    init() {
        // Check if we're on the admin dashboard page
        const isAdminDashboard = window.location.pathname.includes('admin-dashboard.html');
        const isAdminLogin = window.location.pathname.includes('admin.html');
        
        // Check session and handle routing
        this.checkSession(isAdminDashboard, isAdminLogin);

        // Add event listeners
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async checkSession(isAdminDashboard, isAdminLogin) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // If user is logged in
            if (isAdminLogin) {
                // If on login page but already logged in, redirect to dashboard
                window.location.href = 'admin-dashboard.html';
            }
        } else {
            // If user is not logged in
            if (isAdminDashboard) {
                // If trying to access dashboard without being logged in, redirect to login
                window.location.href = 'admin.html';
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Redirect to admin login page
            window.location.href = 'admin.html';
        } catch (error) {
            alert(error.message);
        }
    }
}

// Initialize auth
const auth = new Auth(); 