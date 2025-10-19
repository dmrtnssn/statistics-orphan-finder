# Build Instructions

## Quick Start

```bash
cd frontend
npm install
npm run build
```

## What You Need

1. **Node.js 18+** and npm installed
2. **Home Assistant** running

## Step-by-Step

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Lit 3.x (web components)
- TypeScript 5.x (type checking)
- Vite 5.x (build tool)

Takes about 30 seconds.

### 2. Build the Frontend

**For development (auto-rebuild on changes):**
```bash
npm run dev
```

This watches your `.ts` files and rebuilds automatically. Keep it running in the background.

**For production:**
```bash
npm run build
```

Output: `www/statistics-orphan-panel.js` (this is what Home Assistant loads)

### 3. Install in Home Assistant

1. Restart Home Assistant
2. Go to **Settings** → **Devices & Services**
3. Click **+ Add Integration**
4. Search for "Statistics Orphan Finder"
5. Enter database connection details

### 4. Access the Panel

Look for "Statistics Orphans" in the sidebar (database-search icon).

## Development Workflow

```bash
# Terminal 1: Watch for changes
npm run dev

# Edit files in src/...
# Files automatically rebuild

# Terminal 2: Restart HA when needed
# (only needed for Python changes, not TypeScript)
```

## File Structure

```
v2/
├── src/                         # TypeScript source
│   ├── components/              # Reusable UI components
│   ├── views/                   # Main tab views
│   ├── services/                # API & utilities
│   ├── types/                   # TypeScript types
│   ├── styles/                  # Shared CSS
│   └── statistics-orphan-panel.ts  # Entry point
├── www/                         # Build output (don't edit!)
│   └── statistics-orphan-panel.js  # Generated file
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── vite.config.ts               # Build config
```

## Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org/

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Panel doesn't load
1. Check `www/statistics-orphan-panel.js` exists
2. Hard refresh browser (Ctrl+Shift+R)
3. Check HA logs for errors
4. Check browser console (F12)

### TypeScript errors
Check `tsconfig.json` has:
```json
{
  "experimentalDecorators": true,
  "useDefineForClassFields": false
}
```


## Next Steps

After testing, see README.md for full documentation.
