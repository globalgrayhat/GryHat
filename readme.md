# Grayhat: E-Learning Platform  
**Tech Stack:** TypeScript | JavaScript | React.js | Node.js | Express.js | Docker | Clean Architecture | MongoDB | Redis

Grayhat is a comprehensive e-learning platform that connects teachers and students. Teachers can upload educational courses, and students can browse and watch them. The project follows a clean architecture pattern to ensure scalability and maintainability, using modern technologies on both the frontend and backend.

---

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/globalgrayhat/GryHat
````

2. Navigate into the project directory:

   ```bash
   cd GryHat
   ```

3. Navigate to both the client and server directories:

   ```bash
   cd client
   cd server
   ```

4. Install dependencies in both `client` and `server`:

   ```bash
   yarn install
   ```

5. Set up environment variables:
   Rename `.env.example` to `.env` and fill in your configuration values.

---

## ▶️ Usage

1. Start the backend server:

   ```bash
   yarn run dev
   ```

2. Start the frontend development server:

   ```bash
   yarn start
   ```

3. Open the application in your browser via the provided local URL.

4. Register as a **teacher** or **student** to access the platform features.

---

## ✨ Features

* Teacher and student authentication (register/login)
* Teacher dashboard for course management
* Student dashboard to browse and watch courses
* Admin panel for user and course management
* Course uploading, video playback, and progress tracking

---

## 🧱 Architecture & Technologies

### Backend:

* Node.js
* Express.js
* TypeScript
* MongoDB with Mongoose
* Redis for caching

### Frontend:

* React.js
* Redux (for state management)
* Tailwind CSS (for styling)

---

## 🗂️ Folder Structure

```
.
├── /client           # Frontend codebase
├── /server           # Backend codebase
└── /conf.d           # Nginx configuration for deployment
```

---

## 🧪 API Documentation

All API endpoints are fully documented and available within the `docs` directory of the project.

---

## ⚙️ Configuration

To run the application, ensure the following environment variables are configured:

* `PORT`: Port number for the backend server
* `MONGODB_URI`: MongoDB connection string
* `REDIS_URL`: Redis connection URL

(Refer to the configuration documentation inside the `docs` folder for more.)

---

## 🧠 State Management (Redux)

Redux is used to manage application state on the frontend. The implementation includes actions, reducers, and selectors. You can find more details in the `docs/redux-state-management.md`.

---

## 🎨 Styling (Tailwind CSS)

Tailwind CSS is used for a utility-first approach to styling. All customization and design conventions are documented within the project.

---

## 🚀 Caching (Redis)

Redis is integrated to cache frequently accessed data, improving performance and reducing load times on the server.

---

## 🔐 Authentication (JWT)

Authentication and authorization are handled using JSON Web Tokens (JWT). Tokens are securely issued upon login and validated for protected routes.

---

## 📦 Third-party Libraries

### Multer

Middleware for handling file uploads (e.g., course videos, thumbnails).

### Cloudinary

Used to manage image and video uploads, transformations, and hosting.

### Helmet

Helps secure Express apps by setting various HTTP headers.

### Nodemailer

For sending transactional emails (e.g., password reset, confirmations).

### express-mongo-sanitize

Prevents MongoDB Operator Injection by sanitizing incoming data.

### express-async-handler

Simplifies error handling for async Express route handlers.

### react-oauth

Enables OAuth login with providers like Google or Facebook.

### Yup

Schema validation for frontend form inputs.

### Axios

Promise-based HTTP client for frontend-backend communication.

### Formik

React library for building and managing complex forms easily.
