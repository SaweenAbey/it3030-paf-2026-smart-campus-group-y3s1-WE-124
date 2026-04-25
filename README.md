# UNI 360 | Smart Campus Operations Hub 🚀

**Project ID**: it3030-paf-2026-smart-campus-group124  
**Module**: PAF (Practical Application Frameworks) Web Development Project 2026

---

## 🌟 Project Overview
UNI 360 is a premium, unified operating system designed for modern smart campuses. It streamlines the management of campus resources, facilities, and maintenance operations while providing an intuitive, high-fidelity interface for students, staff, and administrators. 

Built with a focus on real-time intelligence, the platform integrates AI-driven assistance, automated booking workflows, and incident tracking to ensure a seamless campus experience.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core**: React 18 (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS (Glassmorphic Design System)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State/Auth**: Context API & JWT
- **Charts/UI**: Custom modern components & Bento Grids

### **Backend**
- **Core**: Java 21 & Spring Boot 3.4+
- **Security**: Spring Security (JWT-based Stateless Auth)
- **Database**: MySQL 8.0
- **ORM**: Hibernate / Spring Data JPA
- **AI Integration**: Google Gemini API (1.5 Flash)
- **Email**: SMTP (Gmail) for OTP and Notifications

---

## 🚀 Key Features

- **🔐 Multi-Role Access Control**: Tailored dashboards for Administrators, Managers, Technicians, and Students/Tutors.
- **📅 Smart Resource Booking**: Real-time availability checking, automated conflict resolution, and PDF receipt generation.
- **🤖 Gemini AI Assistant**: A system-aware chatbot grounded in live campus data to answer questions about resources and bookings.
- **🛠️ Incident Ticket Center**: Comprehensive maintenance workflow from reporting (OPEN) to resolution (CLOSED).
- **🔔 Real-time Notifications**: Instant system-wide alerts and updates via a high-frequency polling notification center.
- **🌐 Social Auth & Security**: Google OAuth 2.0 integration combined with secure OTP email verification.
- **📱 Responsive Design**: A "Mobile-First" professional UI optimized for every device, from 4K monitors to smartphones.

---

## 📦 Getting Started

### **1. Prerequisites**
- Java 21 JDK
- Node.js (v18+)
- MySQL Server 8.0
- Google Cloud API Key (for Gemini)
- Google OAuth Client ID (for Login)

### **2. Backend Setup**
1. Navigate to the `Backend` directory.
2. Create a `.env` file (refer to `.env.example`):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=uni360
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_long_secure_secret
   GEMINI_API_KEY=your_gemini_key
   MAIL_USERNAME=your_email
   MAIL_PASSWORD=your_app_password
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### **3. Frontend Setup**
1. Navigate to the `Frontend` directory.
2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

---

## 🤝 For Contributors

We welcome contributions! To ensure a high-quality codebase, please follow these guidelines:

1. **Design System**: Adhere to the established glassmorphic and futuristic design tokens. Use Tailwind classes for consistency.
2. **Commit Style**: Use descriptive commit messages (e.g., `feat: add receipt download logic`).
3. **Mobile Audit**: Every new component MUST be tested for mobile responsiveness before submission.
4. **Environment Variables**: Never hardcode API keys or secrets. Always use `.env` files.

---

## 🧩 Google Login Troubleshooting
If Google Sign-In shows `Error 401: invalid_client`, ensure your **Authorized JavaScript origins** in the Google Cloud Console include:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

---

## 👥 Group Information
**Group ID**: Group 124  
**Module**: IT3030 PAF 2026  
**Institution**: SLIIT

*Developed with ❤️ by the UNI 360 Smart Campus Team.*
