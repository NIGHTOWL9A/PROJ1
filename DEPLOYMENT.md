# Free Deployment Guide for NaviVision

## Option 1: Vercel (Recommended)

### Step 1: Prepare Your Repository
1. Create a new GitHub repository
2. Upload all your project files to GitHub
3. Make sure you include the `vercel.json` file created in this project

### Step 2: Deploy to Vercel
1. Sign up at [vercel.com](https://vercel.com) (free account)
2. Click "Import Project" and connect your GitHub repository
3. Vercel will automatically detect it's a Node.js project
4. Set these environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

### Step 3: Configure Build Settings (if needed)
- Build Command: `npm run build`
- Output Directory: `dist/public`
- Install Command: `npm install`

## Option 2: Railway

### Step 1: Deploy to Railway
1. Sign up at [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Connect your repository
4. Railway will auto-detect your Node.js app

### Step 2: Environment Variables
Add these in Railway dashboard:
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: `production`
- `PORT`: `5000` (Railway will set this automatically)

## Option 3: Render

### Step 1: Deploy Web Service
1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository
3. Choose "Web Service"
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 2: Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: `production`

## Getting Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your deployment platform

## Files Required for Deployment

✓ `vercel.json` - Vercel configuration (already created)
✓ `.env.example` - Environment variables template (already created) 
✓ `README.md` - Project documentation (already created)
✓ All source code in `client/` and `server/` directories

## Testing Your Deployment

After deployment, test these features:
- Voice interaction (requires microphone permission)
- Camera access (requires camera permission)
- WebSocket connection for real-time updates
- API endpoints for navigation features

## Troubleshooting

**Issue**: "Module not found" errors
**Solution**: Ensure all dependencies are in package.json

**Issue**: Environment variables not working
**Solution**: Double-check variable names match exactly in your deployment platform

**Issue**: Permissions errors for camera/microphone
**Solution**: Make sure your deployed site uses HTTPS (all platforms provide this automatically)

## Cost Estimate

All recommended platforms offer generous free tiers:
- **Vercel**: 100GB bandwidth, unlimited personal projects
- **Railway**: $5 free credit monthly
- **Render**: Free tier with some limitations

Your navigation app should run comfortably within these free limits for personal use and development.