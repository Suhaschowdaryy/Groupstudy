# StudyPod Local Development Setup

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **PostgreSQL** (version 12 or higher) installed locally

## Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd studypod
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `studypod`:
   ```bash
   createdb studypod
   ```
   Or via SQL:
   ```sql
   CREATE DATABASE studypod;
   ```

#### Option B: Use Neon (Cloud PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database project
3. Copy the connection string

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings:
   ```env
   # For local PostgreSQL
   DATABASE_URL=postgresql://postgres:password@localhost:5432/studypod
   
   # Or for Neon database
   DATABASE_URL=your-neon-connection-string
   
   # Required for AI features
   GOOGLE_API_KEY=your-google-gemini-api-key
   
   # Session security
   SESSION_SECRET=your-random-secret-key
   ```

### 4. Initialize Database Schema

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## API Keys Setup

### Google Gemini API Key (Required for AI features)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in and create a new API key
3. Add it to your `.env` file as `GOOGLE_API_KEY`

## Features Available Locally

✅ **All features work locally including:**
- User authentication with email/password
- Pod creation and discovery
- File sharing within pods
- Video calling with Jitsi Meet
- AI-powered study assistant
- Profile customization
- Real-time collaboration

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_ctl status`
- Check your connection string in `.env`
- Verify database exists and user has permissions

### AI Features Not Working
- Ensure `GOOGLE_API_KEY` is set in `.env`
- Check API key is valid at Google AI Studio

### Port Already in Use
- Change port in package.json scripts or set `PORT=3000` in `.env`

### Missing Dependencies
- Run `npm install` to ensure all packages are installed
- If issues persist, delete `node_modules` and `package-lock.json`, then reinstall