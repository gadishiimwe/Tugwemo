# Tugwemo Project Documentation

## Overview
Tugwemo is a comprehensive anonymous video chat platform designed to facilitate meaningful connections in Africa and globally. The platform provides a safe, secure, and user-friendly environment for anonymous video interactions, emphasizing privacy, authenticity, and community building.

## Mission
To be Africa's premier platform for anonymous video chat and meaningful connections, offering cutting-edge technology with unmatched privacy. The platform aims to revolutionize social interaction by providing a space where users can connect authentically without the constraints of traditional social media.

## Vision
Create a global community where people can meet, chat, and form connections anonymously, fostering genuine relationships in a digital world that prioritizes safety and respect.

## Key Features

### Core Functionality
- **Anonymous Video Chat**: Users can engage in video conversations without revealing personal information
- **Language Selection**: Multi-language support with language selection page
- **User Authentication**: Secure login and registration system
- **Real-time Communication**: WebRTC-based video chat functionality
- **Ad Integration**: Dynamic advertisement system for monetization

### User Experience
- **Responsive Design**: Mobile-first approach with optimized layouts for all devices
- **Modern UI/UX**: Eye-catching design with gradients, animations, and smooth transitions
- **Dark Theme**: Consistent dark gradient backgrounds across pages
- **Social Proof**: Display of user statistics and trust indicators
- **Contact System**: Integrated contact form and social media links

### Administrative Features
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **User Management**: View, manage, and moderate user accounts
- **Analytics**: Detailed analytics and reporting on platform usage
- **Ad Management**: Create, manage, and track advertisements
- **Content Moderation**: Tools for monitoring and moderating content
- **System Logs**: Comprehensive logging system for debugging and monitoring

## Technology Stack

### Frontend (Client)
- **HTML5/CSS3**: Semantic markup and modern styling
- **Vanilla JavaScript**: Client-side scripting for interactivity
- **Responsive Design**: CSS media queries for mobile optimization
- **Icons8 Integration**: Professional icons for social media and UI elements

### Admin Panel
- **React**: Component-based UI framework
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

### Backend (Server)
- **Node.js**: JavaScript runtime for server-side development
- **TypeScript**: Typed JavaScript for better code quality
- **Express.js**: Web application framework
- **Socket.io**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **Prisma**: Database ORM (implied from models)
- **File Upload**: Multer for handling file uploads

### Database
- **Models**: User, Ad, Ban, Log, Report, Setting, SettingHistory
- **File Storage**: Local file system for uploads (ads, etc.)

## Project Structure

```
tugwemo/
├── client/                    # Frontend client application
│   ├── index.html            # Landing page with hero section
│   ├── contact.html          # Contact page with form and social links
│   ├── privacy.html          # Privacy policy page
│   ├── terms.html            # Terms of service page
│   ├── login.html            # User login page
│   ├── register.html         # User registration page
│   ├── video.html            # Video chat interface
│   ├── language.html         # Language selection page
│   ├── public/               # Static assets
│   │   ├── style.css         # Main stylesheet
│   │   ├── videostyle.css    # Video page specific styles
│   │   ├── favicon.ico       # Site favicon
│   │   └── Tugwemo.png       # Logo image
│   ├── package.json          # Client dependencies
│   └── vite.config.js        # Vite configuration
├── admin/                     # Admin panel (React app)
│   ├── src/
│   │   ├── App.jsx           # Main React app
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Global styles
│   │   ├── components/       # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Notifications.jsx
│   │   ├── pages/            # Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Ads.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Logs.jsx
│   │   │   └── Login.jsx
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.jsx
│   │   └── config.js         # Configuration file
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                    # Backend server
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── lib.ts            # Utility functions
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── controllers/      # Route controllers
│   │   │   ├── authController.ts
│   │   │   └── adminController.ts
│   │   ├── middlewares/      # Express middlewares
│   │   │   └── auth.ts
│   │   ├── models/           # Database models
│   │   │   ├── User.ts
│   │   │   ├── Ad.ts
│   │   │   ├── Ban.ts
│   │   │   ├── Log.ts
│   │   │   ├── Report.ts
│   │   │   ├── Setting.ts
│   │   │   └── SettingHistory.ts
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts
│   │   │   └── admin.ts
│   │   ├── socket/           # WebSocket handlers
│   │   │   └── adminSocket.ts
│   │   └── scripts/          # Utility scripts
│   │       ├── seedAdmin.ts
│   │       └── seedAds.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── public/               # Static files served by server
├── uploads/                   # User uploaded files
│   └── ads/                   # Advertisement images
├── package.json              # Root package.json
├── README.md                 # Project README
└── TODO.md                   # Task tracking
```

## Architecture

### Client-Server Architecture
- **Client**: Handles user interface and user interactions
- **Server**: Manages business logic, database operations, and real-time communication
- **Admin**: Separate React application for administrative tasks

### Authentication Flow
1. User selects language on language.html
2. User registers or logs in via login.html/register.html
3. JWT token stored in localStorage
4. Token validated on protected routes
5. Admin access via separate admin panel

### Video Chat Implementation
- WebRTC for peer-to-peer video communication
- Socket.io for signaling and room management
- Anonymous connections with optional user identification

## Security Features
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: Protection against abuse
- **Content Moderation**: Admin tools for monitoring
- **Privacy Protection**: Anonymous chat capabilities
- **Data Encryption**: Secure data transmission

## Deployment
- **Vercel**: Frontend client deployment
- **Node.js Hosting**: Backend server deployment
- **Database**: Hosted database service
- **File Storage**: Cloud storage for uploads

## Development Guidelines
- **Code Quality**: TypeScript for type safety
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized assets and lazy loading
- **Accessibility**: WCAG compliant design
- **Testing**: Unit and integration tests

## Future Enhancements
- **Mobile App**: Native iOS and Android applications
- **Advanced Matching**: AI-powered user matching algorithms
- **Video Filters**: Fun filters and effects for video calls
- **Group Chat**: Multi-user video conferencing
- **Integration APIs**: Third-party service integrations
- **Analytics Dashboard**: Advanced user behavior analytics


## License
This project is proprietary software owned by Tugwemo. All rights reserved.

## Contact
For support or inquiries, please use the contact form on the website or reach out through our social media channels.
