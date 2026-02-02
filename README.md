# Digital Government Service Consultancy Management System

## Project Overview
A comprehensive web-based platform for managing government service consultancy operations. This system enables citizens to apply for government services online, consultants to process applications, and administrators to manage the entire system.

## Team Information
- **Course**: BCA Semester 6 (VNSGU)
- **Team Size**: 3 Members
- **Project Type**: Major Project

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Angular Forms

## Features

### 1. Citizen Module
- User registration and authentication
- Browse available government services
- Apply for services with document upload
- Track application status in real-time
- View application history
- Manage personal profile

### 2. Consultant Module
- View assigned applications
- Update application status
- Add remarks and comments
- Process documents
- Track workload

### 3. Admin Module
- Dashboard with statistics
- User management (Create, Read, Update, Delete)
- Service management
- Application assignment to consultants
- View all applications
- Generate reports

## Project Structure

```
Digital Government Service Consultancy/
├── backend/
│   ├── controllers/          # Business logic
│   ├── models/              # Database schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth & file upload middleware
│   ├── uploads/             # Uploaded documents
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env                 # Environment variables
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/  # UI components
    │   │   ├── services/    # API services
    │   │   ├── guards/      # Route guards
    │   │   └── interceptors/# HTTP interceptors
    │   ├── main.ts
    │   └── index.html
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Angular CLI (v17 or higher)
- Git

### Backend Setup

1. Navigate to backend directory:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Configure environment variables (`.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dgsc_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB service:
```powershell
# Start MongoDB (if installed locally)
mongod
```

5. Start the backend server:
```powershell
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm start
```

The frontend will run on `http://localhost:4200`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  name, email, password, phone, role, aadharNumber
}
```

#### Login
```
POST /api/auth/login
Body: { email, password }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Citizen Endpoints

#### Get My Applications
```
GET /api/citizen/applications
Headers: Authorization: Bearer <token>
```

#### Create Application
```
POST /api/citizen/applications
Headers: Authorization: Bearer <token>
Body: { serviceId, applicationData }
```

#### Upload Documents
```
POST /api/citizen/applications/:id/documents
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Consultant Endpoints

#### Get Assigned Applications
```
GET /api/consultant/applications
Headers: Authorization: Bearer <token>
```

#### Update Application Status
```
PUT /api/consultant/applications/:id/status
Headers: Authorization: Bearer <token>
Body: { status }
```

#### Add Remark
```
POST /api/consultant/applications/:id/remarks
Headers: Authorization: Bearer <token>
Body: { comment }
```

### Admin Endpoints

#### Get All Users
```
GET /api/admin/users
Headers: Authorization: Bearer <token>
```

#### Get Dashboard Stats
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token>
```

#### Assign Application
```
PUT /api/admin/applications/:id/assign
Headers: Authorization: Bearer <token>
Body: { consultantId }
```

### Service Endpoints

#### Get All Services
```
GET /api/services
```

#### Create Service (Admin only)
```
POST /api/services
Headers: Authorization: Bearer <token>
Body: { name, description, category, fee, requiredDocuments }
```

## Database Schema

### User Model
- name (String)
- email (String, unique)
- password (String, hashed)
- role (Enum: citizen, consultant, admin)
- phone (String)
- address (Object)
- aadharNumber (String)
- isActive (Boolean)

### Service Model
- name (String)
- description (String)
- category (Enum)
- requiredDocuments (Array)
- processingTime (String)
- fee (Number)
- isActive (Boolean)

### Application Model
- applicationNumber (String, unique)
- citizen (Reference to User)
- service (Reference to Service)
- documents (Array)
- status (Enum)
- assignedTo (Reference to User)
- remarks (Array)
- applicationData (Mixed)
- timestamps

## User Roles & Permissions

### Citizen
- Register and login
- View services
- Apply for services
- Upload documents
- Track application status
- View own applications only

### Consultant
- View assigned applications
- Update application status
- Add remarks
- Process applications
- Cannot create or delete users/services

### Admin
- Full system access
- Create/manage users
- Create/manage services
- Assign applications to consultants
- View all data
- Generate reports

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password encryption
3. **Role-Based Access Control**: Different permissions for different roles
4. **HTTP Interceptors**: Automatic token attachment
5. **Route Guards**: Protected routes based on authentication
6. **File Validation**: Only allowed file types can be uploaded
7. **File Size Limits**: Maximum 5MB per document

## Development Guidelines

### Backend
- Follow MVC pattern
- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all inputs
- Use middleware for common operations

### Frontend
- Use standalone components
- Implement lazy loading for routes
- Use services for API calls
- Follow Angular style guide
- Use TypeScript interfaces

## Testing

### Backend Testing
```powershell
cd backend
npm test
```

### Frontend Testing
```powershell
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application
3. Deploy to hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build for production:
```powershell
ng build --configuration production
```
2. Deploy dist folder to hosting service

### Database
- Use MongoDB Atlas for cloud database
- Update MONGODB_URI in production

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: Ensure MongoDB is running and connection string is correct

### Issue: CORS Error
**Solution**: Backend has CORS enabled. Check API URL in frontend services

### Issue: Authentication Error
**Solution**: Check if token is present in localStorage and valid

### Issue: File Upload Failed
**Solution**: Check file size (max 5MB) and file type restrictions

## Future Enhancements

1. Email notifications for application updates
2. SMS alerts
3. Payment gateway integration
4. Advanced reporting with charts
5. Application tracking via QR code
6. Multi-language support
7. Mobile application
8. Document verification with AI
9. Chatbot support
10. Video KYC integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is created for educational purposes as part of BCA Semester 6 curriculum.

## Support

For any queries or issues, please contact:
- Project Team Members
- Course Instructor
- University Faculty

## Acknowledgments

- VNSGU for project guidance
- Faculty members for support
- Team members for collaboration

---

**Note**: This is a semester project and is intended for educational purposes only.
