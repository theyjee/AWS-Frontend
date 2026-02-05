# Frontend

## Overview

This is the AWSQ-frontend application for the Emraay AWS project, built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It provides a modern web interface for users, integrated with Firebase for authentication and connecting to the backend API.

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository.
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env.local` file in the frontend root directory with the following variables (see `.env.local` for example):

- `NEXT_PUBLIC_API_URL`: URL of the backend API (e.g., `http://localhost:3001/api` for local dev, or production backend URL)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID

**Security Note**: Never commit `.env.local` to version control. Use deployment platform environment variables.

## Running the Application

### Local Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Deployment

### Vercel Deployment (Recommended)

1. Connect the GitHub repository to Vercel.
2. Set the root directory to `frontend`.
3. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Set to your production backend API URL (e.g., Railway URL)
   - Firebase config keys as above
4. Deploy automatically on push to main branch.

### Other Platforms (Netlify, AWS Amplify, etc.)

- Ensure Node.js support.
- Set build command: `npm run build`
- Publish directory: `.next` (or use static export if needed).
- Configure environment variables securely.
- For custom domains, update DNS accordingly.

## Key Technologies

- **Next.js 15**: React framework for SSR/SSG
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Firebase**: Authentication and user management
- **Lucide React**: Icon library

## Project Structure

- `src/app/`: Next.js app router pages and layouts
- `src/components/`: Reusable React components
- `public/`: Static assets
- `package.json`: Dependencies and scripts
- `next.config.ts`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

## API Integration

The frontend communicates with the backend via REST API calls. Ensure `NEXT_PUBLIC_API_URL` points to the correct backend endpoint.

## Authentication

User authentication is handled by Firebase. Sign-up, login, and session management are built-in.

## Development Workflow

1. Create feature branches from `main`.
2. Make changes and test locally.
3. Run `npm run lint` to ensure code quality.
4. Commit and push changes.
5. Create pull request for review.
6. Merge to `main` for deployment.

## Troubleshooting

- **Build Errors**: Check Node.js version and dependencies.
- **API Connection Issues**: Verify `NEXT_PUBLIC_API_URL` and backend availability.
- **Auth Problems**: Ensure Firebase keys are correct and environment is set.
- **Styling Issues**: Tailwind may need purging; check `tailwind.config.js`.

## Contributing

- Follow the development workflow above.
- Write clear commit messages.
- Update this README if adding new features or changing setup.
