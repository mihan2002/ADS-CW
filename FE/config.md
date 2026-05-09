# Dummy Data & Demo Account Guide

## 🎯 Overview

The frontend now includes a comprehensive dummy data system that allows you to test the application without needing a backend connection. This is perfect for development, demos, and testing UI components.

## 🔐 Demo Account Credentials

Use these credentials to sign in and access all dummy data:

```
Email: dummy@test.com
Password: dummy123
```

When you sign in with these credentials:

- ✅ Authentication is bypassed (no API calls made)
- ✅ All data is loaded from local dummy files
- ✅ Full application functionality is available
- ✅ No backend connection required

## 📊 What's Included

### 25 Alumni Profiles

Complete profiles with realistic data including:

- Personal information (name, bio, graduation year)
- Educational background (degrees from Sri Lankan universities)
- Professional certifications (AWS, Google, Cisco, etc.)
- Employment history (local tech companies like WSO2, IFS, Dialog, etc.)
- Various roles: Software Engineers, Data Analysts, Product Managers, etc.

### Bidding History

- Sample bids with different statuses (pending, won, lost, cancelled)
- Multiple bids across different alumni
- Realistic timestamps and amounts

### User Data

- Admin-level dummy user
- Full profile information
- Email verification status

## 🚀 How to Use

### Method 1: Sign In with Dummy Account

1. Go to the sign-in page
2. Enter the credentials shown above
3. Click "Sign In"
4. You're now in demo mode with all dummy data

### Method 2: Dev Sign-In Button

1. Go to the sign-in page
2. Click "Dev Sign-In (Bypass Auth)" link at the bottom
3. Instant access to demo mode

## 🛠️ Technical Details

### Files Modified

1. **`FE/src/data/devMock.ts`**

   - Expanded alumni profiles from 3 to 25
   - Added comprehensive employment, education, and certification data
   - Added dummy account credentials constant
   - Added more bid records

2. **`FE/src/context/AuthContext.tsx`**

   - Detects dummy account credentials on sign-in
   - Automatically enables dev bypass mode
   - Uses dummy user data instead of API

3. **`FE/src/services/api/users.ts`**

   - Supports dev bypass mode
   - Returns dummy user when in dev mode

4. **`FE/src/pages/signin.tsx`**
   - Displays dummy account credentials prominently
   - Shows helpful info box with credentials

### Dev Mode Detection

When signed in with the dummy account:

- `isDevBypassEnabled()` returns `true`
- All API services check this flag
- Data is returned from `devMock.ts` instead of making HTTP requests
- No network calls are made

### API Services with Dev Bypass

All these services automatically use dummy data in dev mode:

- ✅ `getAlumniList()` - Returns 25 alumni profiles
- ✅ `getAlumniProfile(id)` - Returns detailed profile
- ✅ `getBiddingHistory(id)` - Returns bid history
- ✅ `getBidStatus(id)` - Returns current bid status
- ✅ `placeBid()` - Simulates bid placement
- ✅ `updateBid()` - Simulates bid update
- ✅ `getUserById()` - Returns dummy user

## 📝 Dummy Data Details

### Companies Included

- WSO2, Sysco Labs, IFS, Virtusa
- Dialog Axiata, 99x, hSenid Mobile
- Zone24x7, Codegen, Arimac, Rootcode Labs
- And many more local Sri Lankan tech companies

### Educational Institutions

- University of Moratuwa
- University of Colombo
- University of Peradeniya
- SLIIT, NIBM, NSBM Green University
- And others

### Certifications

- AWS (Solutions Architect, DevOps Engineer)
- Google (Data Analytics, Cloud Architect)
- Cisco (CCNA, CCNP)
- Scrum Master, PMP
- Security certifications (CEH, CISSP)
- And many more

## 🔄 Switching Between Real and Dummy Data

### To Use Dummy Data:

1. Sign in with `dummy@test.com` / `dummy123`
2. OR click "Dev Sign-In (Bypass Auth)"

### To Use Real Data:

1. Sign out if in demo mode
2. Sign in with a real account
3. API calls will be made to the backend

### To Clear Dev Mode:

```javascript
// In browser console:
localStorage.removeItem("ads_dev_auth_bypass");
```

Then refresh the page.

## 💡 Use Cases

### Perfect for:

- 🎨 Frontend development without backend
- 🎭 Demos and presentations
- 🧪 UI testing and QA
- 📱 Offline development
- 🚀 Quick prototyping
- 📊 Data visualization testing

### Great for:

- Testing filter and search functionality
- Validating UI layouts with realistic data
- Demonstrating features to stakeholders
- Training and onboarding new developers

## 🔍 Verifying Dev Mode

When in dev mode, you should see:

- User email: `dummy@test.com`
- User name: `Demo User`
- 25 alumni profiles in the list
- No network errors in console
- All features working normally

## 🎨 Customizing Dummy Data

To add more dummy data:

1. Open `FE/src/data/devMock.ts`
2. Add new profiles to `devAlumniProfiles` array
3. Add corresponding details to `devAlumniDetails` object
4. Follow the existing format for consistency

## ⚠️ Important Notes

- Dummy account only works in development mode
- All changes in dev mode are stored in localStorage
- Bids placed in dev mode are not sent to backend
- Data persists across page refreshes until you sign out
- Original backend data is never affected

## 🎉 Benefits

1. **No Backend Dependency**: Test frontend independently
2. **Realistic Data**: Sri Lankan names, companies, and institutions
3. **Full Functionality**: All features work with dummy data
4. **Easy Access**: Simple credentials everyone can remember
5. **Instant Setup**: No database or API configuration needed
6. **Safe Testing**: No risk of corrupting real data

---

**Note**: This is a development feature. In production, always use real authentication and data.
