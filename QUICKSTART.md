# BobForge Quick Start Guide

Get BobForge up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm installed
- Two terminal windows

## Step 1: Start the Backend (Terminal 1)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm start
```

✅ Backend should now be running on `http://localhost:3001`

You should see:
```
Server running on port 3001
```

## Step 2: Start the Frontend (Terminal 2)

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the dev server
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 3: Open BobForge

Open your browser and navigate to:
```
http://localhost:5173
```

## Step 4: Generate Your First Blueprint

1. **Enter a project idea** in the textarea, or click "Try Example"
2. **Click "Generate Blueprint"**
3. **Wait a few seconds** for the blueprint to be generated
4. **View the complete blueprint** on the dashboard

Example idea to try:
```
A smart attendance system for schools that uses QR codes for check-in, 
tracks student attendance patterns, sends automated notifications to parents, 
and generates attendance reports for teachers and administrators.
```

## Step 5: Use with IBM Bob

1. Click **"View Bob Prompt"** on the dashboard
2. Click **"Copy Entire Prompt"**
3. Open IBM Bob in your development environment
4. Paste the prompt and let Bob build your application!

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again

### Frontend won't start
- Check if port 5173 is already in use
- Verify the backend is running first
- Delete `node_modules` and run `npm install` again

### Can't connect to backend
- Verify backend is running on port 3001
- Check `.env` file in frontend has: `VITE_API_BASE_URL=http://localhost:3001`
- Restart both servers

### Blueprint generation fails
- Check backend terminal for errors
- Verify the backend is running
- Try the example idea first

## What's Next?

- 📋 **Explore the Dashboard** - See all generated sections
- 🤖 **Copy Bob Prompt** - Use it with IBM Bob
- 📦 **Track Artifacts** - Document Bob's contributions
- 📊 **View Evidence** - See Bob's SDLC involvement
- 📥 **Export Blueprints** - Download as Markdown

## Project Structure

```
bobforge/
├── backend/          # Express API (port 3001)
│   ├── src/
│   │   ├── generators/   # Blueprint generators
│   │   ├── routes/       # API endpoints
│   │   └── data/         # JSON storage
│   └── package.json
│
├── frontend/         # React app (port 5173)
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # UI components
│   │   └── api/          # API client
│   └── package.json
│
└── README.md         # Full documentation
```

## Key Features to Try

1. **Generate Multiple Blueprints** - Try different project ideas
2. **Export to Markdown** - Download blueprints for documentation
3. **Copy Bob Prompts** - Use with IBM Bob to build apps
4. **Track Artifacts** - Document files created by Bob
5. **View Evidence** - See how Bob built BobForge itself

## API Endpoints

The backend provides these endpoints:

- `POST /api/blueprints/generate` - Generate new blueprint
- `GET /api/blueprints` - Get all blueprints
- `GET /api/blueprints/:id` - Get specific blueprint
- `GET /api/blueprints/:id/export` - Export as Markdown
- `GET /api/artifacts` - Get all artifacts
- `POST /api/artifacts` - Create new artifact

## Development Tips

- **Hot Reload**: Both frontend and backend support hot reload
- **Browser DevTools**: Use Network tab to debug API calls
- **Console Logs**: Check browser console for frontend errors
- **Terminal Output**: Check terminal for backend errors

## Need Help?

- 📖 Read the full [README.md](README.md)
- 📚 Check [frontend/README.md](frontend/README.md)
- 🔧 Check [backend/README.md](backend/README.md)
- 📋 Review [docs/](docs/) for detailed documentation

## Success Indicators

✅ Backend running on port 3000  
✅ Frontend running on port 5173  
✅ Can access http://localhost:5173  
✅ Can generate a blueprint  
✅ Can view blueprint dashboard  
✅ Can copy Bob prompt  

---

**You're all set! Start building with BobForge and IBM Bob! 🚀**