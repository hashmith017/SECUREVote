# SECUREVote

A simple demonstration e‑voting application (educational) that uses a Node.js backend and a static frontend. It provides basic user registration/login, an admin interface to configure an election, and simple voting functionality.

**Warning:** This project is a learning/demo implementation and is NOT suitable for real-world secure voting without major security, testing, and cryptographic improvements.

## Project structure

- `backend/` - Express server and API (`server.js`).
- `frontend/` - Static HTML/JS files for admin and voter interfaces.
- `package.json` - Node project metadata and dependencies.
- `README.md` - This file.

## Quick setup (Windows PowerShell)

1. Install Node.js (v16+ recommended) and npm.

2. Install dependencies:

```powershell
cd "D:\2.COLLEGE\Projects\SECUREVote"
npm install
```

3. Start the backend server:

```powershell
node backend/server.js
```

The backend listens on `http://localhost:3000` by default.

4. Serve or open the frontend:

- Option A (recommended): serve the `frontend/` folder with a static server (for example `http-server`):

```powershell
# from project root
npx http-server frontend -p 3001
# then open http://localhost:3001/admin.html (or index.html)
```

- Option B: open the HTML files directly in your browser (some features may require a server due to CORS/Authorization headers).

## Default/demo accounts

The backend creates a demo admin account and many sample users on startup:

- Admin: username `pro`, password `pass`
- Users: `user1`...`user100` with passwords `pass1`...`pass100`

Use the admin account to sign in at `admin.html` and configure the election (title, description, period, candidates).

## How to use

- Register a normal user at `register.html` or log in using one of the sample users.
- As admin, set election title, description, voting period, and candidates via `admin.html`.
- During the active voting period, a logged-in user can vote for one candidate.
- The admin can view turnout and live results in the admin interface.

## Notes and known limitations

- Authentication uses JWT tokens stored in `localStorage` for the demo.
- The backend stores data in memory — restarting the server resets all state.
- This is NOT production-grade: no database, minimal input validation, simplistic security.
- Comments were removed from several frontend/backend files to satisfy a code-cleaning request; functionality should be unchanged.

## Troubleshooting

- If the frontend cannot reach the API, ensure the backend is running on port `3000` and the frontend is served from a web server (or use `npx http-server`).
- For CORS issues, confirm the backend has `cors()` enabled (it does by default in `backend/server.js`).

## Next steps you can ask me to do

- Run the server and exercise the endpoints locally (I can provide PowerShell commands).
- Reintroduce helpful inline comments or documentation in specific files.
- Add a minimal automated test or a small JSON file to persist data across restarts.

---

If you want I can now run the server, or continue removing comments from the remaining files as planned.