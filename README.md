# XP Leaderboard System

A web application for tracking and displaying team and individual XP (experience points) using Supabase as the backend.

## Features

- Team management (create, view, delete teams)
- Member management (add, view, delete team members)
- Weekly XP submissions for team members
- Leaderboards:
  - Weekly and overall rankings
  - Team-level and individual-level views
- Secure authentication for admin access

## Setup Instructions

1. **Supabase Setup**
   - Create a new Supabase project at https://supabase.com
   - Copy the SQL code from `supabase/schema.sql` and run it in the Supabase SQL editor
   - Create an admin user in Supabase Authentication
   - Get your Supabase URL and anon/public key from the project settings

2. **Configuration**
   - Open `js/config.js`
   - Replace the empty strings with your Supabase credentials:
     ```javascript
     const SUPABASE_URL = 'your-supabase-url';
     const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
     ```

3. **Running the Application**
   - Serve the files using a local web server
   - Open the application in your browser
   - Log in using the admin credentials you created in Supabase

## Project Structure

```
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styles
├── js/
│   ├── config.js       # Supabase configuration
│   ├── auth.js         # Authentication handling
│   ├── teams.js        # Team management
│   ├── members.js      # Member management
│   ├── xp.js           # XP submission handling
│   ├── leaderboard.js  # Leaderboard functionality
│   └── app.js          # Main application logic
└── supabase/
    └── schema.sql      # Database schema
```

## Security

- Row Level Security (RLS) is enabled on all tables
- Only authenticated users can access the application
- All database operations are protected by RLS policies

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Supabase (Authentication, Database)
- Fetch API for data operations

## Browser Support

The application works in all modern browsers that support:
- ES6+ JavaScript features
- Fetch API
- CSS Grid and Flexbox

## License

MIT License 