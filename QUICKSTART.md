# Quick Start Guide

## Getting Started with DGSC Management System

### Step 1: Install Prerequisites

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Install Angular CLI**
   ```powershell
   npm install -g @angular/cli
   ```

### Step 2: Setup Backend

1. Open PowerShell and navigate to backend folder:
   ```powershell
   cd "c:\Users\BHAVESH\Desktop\TYBCA SEM 6 MAJOR PROJECT\Digital Government Service Consultancy\backend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Update `.env` file with your MongoDB connection string

4. Start MongoDB (if local):
   ```powershell
   # In a new PowerShell window
   mongod
   ```

5. Start backend server:
   ```powershell
   npm run dev
   ```
   
   ✅ Backend should now be running on http://localhost:5000

### Step 3: Setup Frontend

1. Open a new PowerShell window and navigate to frontend folder:
   ```powershell
   cd "c:\Users\BHAVESH\Desktop\TYBCA SEM 6 MAJOR PROJECT\Digital Government Service Consultancy\frontend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start frontend server:
   ```powershell
   ng serve
   ```
   
   ✅ Frontend should now be running on http://localhost:4200

### Step 4: Access the Application

1. Open your browser and go to: http://localhost:4200

2. **Register a New User**
   - Click on "Register here"
   - Fill in the form
   - Select role: Citizen, Consultant, or Admin
   - Click Register

3. **Login**
   - Use your registered email and password
   - You'll be redirected to your role-specific dashboard

### Step 5: Test the System

#### As Citizen:
1. Navigate to "Apply for Service"
2. Select a service (you may need to create services as Admin first)
3. Submit application
4. View your applications in "My Applications"

#### As Admin (Create one via MongoDB or registration):
1. Go to Admin dashboard
2. Add services in "Service Management"
3. Manage users in "User Management"
4. Assign applications to consultants

#### As Consultant:
1. View assigned applications
2. Update status
3. Add remarks

## Default Test Accounts

You can create these accounts through registration:

**Admin Account**
- Email: admin@dgsc.com
- Password: admin123
- Role: admin

**Consultant Account**
- Email: consultant@dgsc.com
- Password: consultant123
- Role: consultant

**Citizen Account**
- Email: citizen@dgsc.com
- Password: citizen123
- Role: citizen

## Quick Commands Reference

### Backend Commands
```powershell
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Frontend Commands
```powershell
# Install dependencies
npm install

# Start dev server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test
```

## Troubleshooting

### Port Already in Use
If port 5000 or 4200 is already in use:
- Backend: Change PORT in `.env` file
- Frontend: Run `ng serve --port 4300`

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in `.env` file
- For MongoDB Atlas, ensure IP is whitelisted

### Cannot Find Module Error
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Angular CLI Not Found
```powershell
npm install -g @angular/cli
```

## Next Steps

1. **Explore the System**: Navigate through all modules
2. **Test Features**: Try creating applications, updating status, etc.
3. **Customize**: Modify code to add new features
4. **Deploy**: Deploy to production when ready

## Need Help?

- Check the main README.md for detailed documentation
- Review API documentation for endpoint details
- Check console logs for error messages
- Ensure all services are running correctly

---

Happy Coding! 🚀
