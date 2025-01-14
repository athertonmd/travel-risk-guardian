# Travel Risk Guardian Application

## Overview

Travel Risk Guardian is a web application designed to manage and communicate travel risk assessments. The application allows users to create, manage, and share risk assessments for different countries, helping organizations maintain duty of care for their travelers.

## Core Features

1. **Risk Assessment Management**
   - Create/Edit/Delete risk assessments for countries
   - Risk levels: Low, Medium, High, Extreme
   - Detailed information storage for each assessment
   - Real-time map visualization of global risk levels

2. **Email Notifications**
   - Send risk assessments via email
   - Support for CC recipients
   - Customizable email templates
   - Email delivery tracking and logging

3. **Interactive World Map**
   - Color-coded countries based on risk levels
   - Interactive country selection
   - Popup information display
   - Smooth animations and transitions

## Technical Architecture

### Frontend (React + TypeScript)

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router
- **Map Integration**: Mapbox GL JS

### Backend (Supabase)

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions
- **Email Service**: Resend.com API
- **File Storage**: Supabase Storage

## Database Schema

### Tables

1. **risk_assessments**
   - Stores country risk assessment data
   - Includes country, risk level, and detailed information
   - Tracks creation and update timestamps

2. **email_logs**
   - Records all email communications
   - Tracks recipient status and error messages
   - Stores CC recipient information

3. **profiles**
   - User profile information
   - Links to Supabase authentication

## Key Components

### Dashboard (/dashboard)
- Main interface for viewing risk assessments
- Interactive world map
- Risk assessment cards
- Search functionality

### Admin Panel (/admin/risk-assessments)
- Risk assessment management interface
- CRUD operations for assessments
- Bulk operations support

### Email Logs (/admin/notifications)
- Email tracking and monitoring
- Status updates
- Error reporting

## Common Issues & Troubleshooting

### Email Delivery Issues

1. **Delayed Emails**
   - Check Edge Function logs for timing
   - Verify Resend API response times
   - Monitor email_logs table for status updates

2. **Failed Deliveries**
   - Check recipient_status in email_logs
   - Verify email format and domain validation
   - Review Edge Function error logs

### Map Display Issues

1. **Countries Not Showing**
   - Verify Mapbox token in Edge Function secrets
   - Check browser console for Mapbox errors
   - Validate risk_assessments data

2. **Color Updates Not Reflecting**
   - Verify risk_assessments table updates
   - Check React Query cache invalidation
   - Review browser console logs

## Monitoring & Debugging

### Edge Function Logs
- Access via Supabase Dashboard
- Monitor email sending performance
- Track API interactions

### Database Monitoring
- Review RLS policies for access issues
- Monitor table sizes and query performance
- Track real-time updates

### Frontend Monitoring
- Browser console logs
- React Query devtools
- Network request timing

## Security Considerations

1. **Row Level Security (RLS)**
   - Enforced on all tables
   - Profile-based access control
   - Public/private data separation

2. **API Security**
   - Edge Function authentication
   - CORS policies
   - Rate limiting

## Environment Variables

Required environment variables:
- `RESEND_API_KEY`: For email service
- `MAPBOX_TOKEN`: For map functionality
- Supabase connection details (auto-configured)

## Deployment

The application is deployed via Lovable's deployment system. For custom deployments:
1. Export the codebase
2. Configure environment variables
3. Set up Supabase project
4. Deploy to preferred hosting platform

## Future Improvements

Potential areas for enhancement:
1. Email template customization
2. Bulk risk assessment updates
3. Advanced reporting features
4. Real-time collaboration tools
5. Mobile app development

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [Resend API Documentation](https://resend.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)