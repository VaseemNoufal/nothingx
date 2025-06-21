# XP Leaderboard System

A web application for tracking and displaying team and individual XP (experience points) using Supabase as the backend.

## Features

- Team management (create, view, delete teams)
- Member management (add, view, delete team members)
- **Batch XP Submission** - Submit XP for multiple team members at once
- Weekly XP submissions for team members
- Leaderboards:
  - Weekly and overall rankings
  - Team-level and individual-level views
- Secure authentication for admin access

## New Batch XP Submission Feature

The new batch XP submission system allows team leads to efficiently submit XP for multiple team members at once:

### Key Features:
- **Date Picker**: Select a start date, end date is automatically calculated (7 days)
- **Team-Based UI**: All teams are displayed in collapsible dropdowns
- **Inline XP Inputs**: Each member has a dedicated input box for XP entry
- **Single Submit**: One button submits all XP data in batch
- **Real-time Feedback**: Status messages show submission progress and results

### How to Use:
1. Navigate to "XP Submission" in the admin dashboard
2. Select the week start date (end date auto-calculates)
3. Expand team dropdowns to see members
4. Enter XP values for each member
5. Click "Submit All XP" to submit everything at once

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
│   ├── xp.js           # XP submission handling (legacy)
│   ├── batch-xp.js     # Batch XP submission handling
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