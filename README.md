# Welcome to your Lovable project

## Project Overview

This is a risk assessment notification system that allows users to:
- View and manage risk assessments for different countries
- Send email notifications about risk levels
- Track email notification history
- Filter and manage notifications by client

**URL**: https://lovable.dev/projects/ab3bf431-9b7f-4571-9060-4383736eed4a

## Development Setup

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git for version control
- A code editor (VS Code recommended)
- Supabase account for backend services
- Resend.com account for email functionality

### Local Development

There are several ways to work with this codebase:

**1. Using Lovable (Recommended for Quick Changes)**

Simply visit the [Lovable Project](https://lovable.dev/projects/ab3bf431-9b7f-4571-9060-4383736eed4a) and start prompting.
Changes made via Lovable will be committed automatically to the repository.

**2. Local Development Setup**

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

**3. GitHub Codespaces**

1. Navigate to the repository on GitHub
2. Click "Code" > "Codespaces" tab
3. Click "New codespace"
4. Make changes directly in the browser-based IDE

## Technology Stack

This project is built with modern web technologies:

- **Frontend**:
  - Vite - Fast build tool and development server
  - TypeScript - Type-safe JavaScript
  - React - UI framework
  - shadcn/ui - Component library
  - Tailwind CSS - Utility-first CSS framework
  - TanStack Query - Data fetching and state management
  - Mapbox - Interactive maps

- **Backend (Supabase)**:
  - Authentication
  - PostgreSQL Database
  - Edge Functions
  - Storage
  - Row Level Security

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── admin/     # Admin-specific components
│   ├── dashboard/ # Dashboard components
│   └── ui/        # Base UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Configuration Requirements

1. **Supabase Setup**
   - Set Site URL and Redirect URLs in Authentication settings
   - Configure email provider settings if using email auth
   - Set up storage buckets if needed

2. **Email Configuration**
   - Create a Resend.com account
   - Verify your domain
   - Add RESEND_API_KEY to Supabase Edge Function secrets

3. **Environment Variables**
   - No .env files needed - all configuration is handled through Supabase

## Common Issues & Solutions

### Authentication Issues

1. **Redirect Errors**
   - Check Supabase Authentication settings
   - Verify Site URL configuration
   - Ensure redirect URLs are properly set

2. **Session Problems**
   - Clear browser cache and cookies
   - Check console for authentication errors
   - Verify user permissions in Supabase

### Email Sending Issues

1. **Failed to Send**
   - Verify RESEND_API_KEY is properly set
   - Check domain verification status
   - Review Edge Function logs

2. **Permission Errors**
   - Verify RLS policies
   - Check user authentication status
   - Review database access permissions

## Support Resources

### Documentation
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)

### Getting Help
- Join our [Discord Community](https://discord.gg/lovable)
- Report issues through GitHub
- Follow [@LovableHQ](https://twitter.com/LovableHQ) for updates

### Debugging Tools
- Supabase Dashboard - Database and API monitoring
- Edge Function Logs - Email sending and API logs
- Browser DevTools - Frontend debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.