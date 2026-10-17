# Daylight Task Manager

A responsive full-stack task manager built with the MERN stack: MongoDB, Express, React, and Node.js. Tasks are stored in MongoDB, so they are no longer limited to one browser's local storage.

## Features

- Create tasks with a category, priority, and due date
- Browse All, Today, Upcoming, and Completed task views
- Search tasks, mark them complete, and delete them
- Save and retrieve tasks through an Express REST API backed by MongoDB
- Responsive interface built with React and Vite

This starter version does not include user accounts. All visitors using the same deployed API will see and change the same task list, so add authentication before using it for private tasks.

## Requirements

- Node.js 20.19+ (or 22.12+)
- A MongoDB database, such as MongoDB Atlas

## Set up MongoDB

1. Create a MongoDB Atlas cluster and database user.
2. Copy the cluster connection string. Replace its username, password, and database name with your values.
3. In the Atlas Network Access settings, allow the machine running the API to connect.
4. In the project root, copy `.env.example` to `.env` and set `MONGODB_URI` to the connection string. Keep `.env` private; it is excluded from Git.

## Run locally

In a terminal opened at the project root:

```bash
npm install
npm run dev
```

Open the Vite address shown in the terminal (usually `http://localhost:5173`). The development command starts both the Vite front end and the Express API. Vite proxies `/api` requests to the API on port 5000.

On PowerShell, if `npm` is blocked by the script execution policy, use `npm.cmd install` and `npm.cmd run dev`.

To run only the API, use `npm start`. Its health endpoint is `/api/health`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API and database status |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Change task completion status |
| DELETE | `/api/tasks/:id` | Delete a task |

## Deploy the full stack

The front end and API can be hosted separately while sharing this repository:

1. Deploy the Node/Express service on a Node web host. Use the project root, build command `npm install`, and start command `npm start`. Add `MONGODB_URI` and `CLIENT_ORIGIN` as private service environment variables. `CLIENT_ORIGIN` must be the exact public URL of the deployed React site.
2. Deploy the React front end on Vercel with build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the public base URL of the deployed Express service, without a trailing slash.
3. Redeploy the front end after setting `VITE_API_URL`.

The API expects `MONGODB_URI` and `CLIENT_ORIGIN` at runtime. The front end uses `VITE_API_URL` when deployed and the local Vite proxy during development. Never put the MongoDB connection string in a `VITE_` variable or commit credentials.
