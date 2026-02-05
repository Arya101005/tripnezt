# TripNezt — Indian Travel Booking Platform

A comprehensive travel booking platform built with React, Firebase, and modern web technologies. TripNezt allows users to browse trips, make bookings, and provides admins with powerful management tools.

![TripNezt Logo](src/assets/logo.png)

## 🚀 Features

### For Users
- **User Authentication** - Sign up, login, forgot password with email reset
- **Browse Trips** - View available travel packages with detailed information
- **Trip Booking** - Book trips with a smooth booking modal
- **My Bookings** - View all your bookings and their status
- **Responsive Design** - Works seamlessly on mobile and desktop

### For Admins
- **Admin Dashboard** - Centralized admin management interface
- **User Management** - View, block, unblock, and delete users
- **Bulk Actions** - Select multiple users for batch operations
- **Admin Request Management** - Approve or reject admin access requests
- **Trip Management** - Create, edit, and manage travel packages
- **Analytics** - View booking statistics and analytics
- **Lead Management** - Manage customer leads

### Security Features
- **Role-based Access Control** - Users, Admins, and Primary Admin roles
- **Admin Approval Flow** - New admin requests require approval
- **Protected Routes** - Unauthorized access prevented
- **Firebase Security Rules** - Secure data access

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Animations**: Framer Motion
- **Icons**: Lucide React, React Icons
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── assets/                 # Static assets (images, logos)
├── components/            # Reusable React components
│   ├── AdminRoute.jsx    # Admin-only route protection
│   ├── AdminTrips.jsx    # Admin trip management
│   ├── AnimationWrapper.jsx
│   ├── BookingModal.jsx  # Trip booking modal
│   ├── Footer.jsx        # Site footer
│   ├── Hero.jsx          # Homepage hero section
│   ├── Navbar.jsx        # Navigation bar
│   ├── ProtectedRoute.jsx # Auth protection
│   ├── Toast.jsx         # Toast notifications
│   ├── Toast.css
│   └── TripCard.jsx      # Trip display card
├── context/              # React contexts
│   ├── AuthContext.jsx   # Authentication state
│   └── ToastContext.jsx  # Toast notifications state
├── pages/                # Page components
│   ├── About.jsx         # About page
│   ├── AdminAnalytics.jsx # Analytics dashboard
│   ├── AdminDashboard.jsx # Main admin dashboard
│   ├── AdminLeads.jsx    # Lead management
│   ├── AuthPage.jsx      # Authentication page
│   ├── Contact.jsx       # Contact page
│   ├── HomePage.jsx      # Homepage
│   ├── MyBookings.jsx    # User bookings
│   ├── TripDetails.jsx   # Trip details page
│   ├── TripsPage.jsx     # Browse trips
│   ├── UserDashboard.jsx # User dashboard
│   └── WaitingApproval.jsx # Pending admin approval
├── App.css              # Global styles
├── App.jsx              # Main app component
├── firebase.js          # Firebase configuration
├── index.css            # Index styles
└── main.jsx             # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arya101005/tripnezt.git
   cd tripnezt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable **Authentication** with Email/Password provider
   - Create a **Firestore Database**
   - Create a **Storage Bucket**
   - Copy your Firebase config and update `src/firebase.js`:

   ```javascript
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";
   import { getStorage } from "firebase/storage";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

4. **Set up Firestore Security Rules**
   - Go to Firestore → Rules
   - Update with appropriate rules for your security needs

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Navigate to `http://localhost:5173`

## 🔐 User Roles

| Role | Description |
|------|-------------|
| **User** | Can browse trips, make bookings, view their bookings |
| **Admin** | Can manage trips, view analytics, manage leads (requires approval) |
| **Primary Admin** | Full access including user management, admin approvals |

### Admin Approval Flow
1. User signs up with "Apply as Travel Partner"
2. Admin status is set to `pending`
3. Primary admin reviews and approves/rejects the request
4. Approved admins gain access to admin dashboard

## 📱 Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home page | Public |
| `/auth` | Login/Signup | Public |
| `/trips` | Browse all trips | Public |
| `/trips/:id` | Trip details | Public |
| `/contact` | Contact page | Public |
| `/about` | About page | Public |
| `/dashboard` | User dashboard | User |
| `/my-bookings` | My bookings | User |
| `/admin` | Admin dashboard | Admin |
| `/admin/analytics` | Analytics | Admin |
| `/admin/leads` | Lead management | Admin |
| `/waiting-approval` | Pending approval | Pending Admin |

## 🎨 Design Features

- **Modern UI** with clean, professional design
- **Responsive layout** for all screen sizes
- **Smooth animations** using Framer Motion
- **Toast notifications** for user feedback
- **Indian travel theme** with cultural touches

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will auto-detect the React + Vite setup
4. Add environment variables in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. Deploy!

### Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy --only hosting
```

## 📧 Contact

**TripNezt**
- Email: admin@tripnezt.in
- Phone: +91 8610414032
- Address: E1 Royal tower, Ejipura, Bangalore- 560046

## 📄 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- Built with ❤️ for Indian travelers
- Powered by Firebase
- Icons from Lucide and React Icons
