# URL Analyzer

This project is a URL Analyzer web application built as a monorepo with separate frontend and backend services.

- **Frontend:** React + TypeScript web app with responsive UI and Storybook for component development.
- **Backend:** Go (Golang) API server that crawls and analyzes URLs, storing results in MySQL.
- **Monorepo:** Root folder manages shared dev tooling and scripts.

---

## Project Structure

    url_analyzer/
    ├── backend/                # Go backend service
    ├── frontend/               # React frontend app
    ├── package.json            # Root package.json with dev dependencies and scripts
    ├── README.md               # This file
    ├── docker-compose.yml
    ├── Makefile
    └── .gitignore

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [Go](https://golang.org/dl/) (v1.18+ recommended)
- [MySQL](https://dev.mysql.com/downloads/) server running locally or remotely

---

### 1. Install root dev dependencies

From the root folder, run:

```bash
npm install
```

### 2.  Install frontend dependencies

```bash
cd frontend
npm install
```


### 3.  Download Go backend dependencies

```bash
cd ../backend
go mod download
```

### 4.  Download Go backend dependencies

```bash
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_NAME=sykell
JWT_SECRET=your_jwt_secret
```

Running the Application
From the root folder, start both frontend and backend concurrently:

```bash
npm run start:all
```

Frontend runs on http://localhost:5173

Backend runs on http://localhost:8080

## Docker Setup

You can also run both the frontend and backend using Docker and docker-compose for a seamless local development experience.

### 1. Build and Start All Services

From the root folder, run:

```bash
docker-compose up --build
```

This will build and start the backend (Go), frontend (React), and a MySQL database container.

### 2. Stopping the Services

To stop all running containers:

```bash
docker-compose down
```

### 3. Accessing the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- MySQL: localhost:3306 (see `docker-compose.yml` for credentials)

### 4. Environment Variables

You can configure environment variables for the backend in the `backend/.env` file or directly in `docker-compose.yml`.

---


## Available Scripts
### Frontend

#### From the /frontend folder

1. Start React development server

    ```bash
    npm run dev
    ```
2. Run Storybook for UI components
    
    ```bash
    npm run storybook
    ```

### Backend
#### From the /backend folder:

1. Start the Go server

    ```bash
    go run cmd/main.go
    ```

## Testing

### End-to-End Tests (Frontend)

Run Cypress for e2e testing:

```bash
npm run cypress:open
```

## Notes

1. Backend API includes authorization middleware and frontend API calls use auth tokens.

2. Real-time crawl status updates are displayed in the frontend via polling or WebSocket.

3. Storybook allows isolated UI component development and testing.

4. Monorepo pattern keeps frontend and backend organized and shareable.

## Usage 

  You're all set up! You can now start using the app locally.

## Author

👤 **Shweta Khatra**

* Github: [@shwetakhatra](https://github.com/shwetakhatra)

