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

**4. Direct GitHub Editing**

For quick file edits:
1. Navigate to the file on GitHub
2. Click the pencil icon (Edit)
3. Make changes and commit

## Technology Stack

This project is built with modern web technologies:

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React**: UI framework
- **shadcn/ui**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend services (auth, database, storage)
- **TanStack Query**: Data fetching and state management

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Deployment

### Quick Deploy

1. Open [Lovable](https://lovable.dev/projects/ab3bf431-9b7f-4571-9060-4383736eed4a)
2. Click Share -> Publish

### Custom Domain Setup

While we don't currently support custom domains directly, you can deploy to Netlify:
1. Export the project from Lovable
2. Follow our [Custom domains guide](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Support & Troubleshooting

### Common Issues

1. **Build Errors**
   - Run `npm install` to ensure all dependencies are up to date
   - Check console for specific error messages
   - Verify TypeScript types are correct

2. **Database Issues**
   - Check Supabase connection settings
   - Verify RLS policies are configured correctly
   - Review database logs for errors

### Getting Help

- **Documentation**: Visit [Lovable Docs](https://docs.lovable.dev/)
- **Community**: Join our [Discord](https://discord.gg/lovable)
- **Issues**: Report bugs through the GitHub repository
- **Updates**: Follow [@LovableHQ](https://twitter.com/LovableHQ) for news

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.