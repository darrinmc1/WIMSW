# Authentication System Documentation

## Overview
Real authentication has been successfully implemented using NextAuth.js with Google Sheets as the user database.

## What Changed

### Before (Fake Authentication)
- Login form accepted any credentials
- No password validation
- No user database
- Anyone could access protected routes
- Passwords were collected but ignored

### After (Real Authentication)
- Full user registration with password hashing (bcrypt)
- User credentials stored in Google Sheets
- Session management with JWT tokens
- Protected routes with middleware
- Secure password validation

---

## Architecture

### Components

1. **NextAuth.js** - Authentication framework
2. **Google Sheets** - User database (stored in "Users" sheet)
3. **bcrypt** - Password hashing
4. **JWT** - Session tokens
5. **Middleware** - Route protection

---

## File Structure

```
app/
├── api/
│   └── auth/
│       ├── [...nextauth]/route.ts    # NextAuth API route
│       └── register/route.ts          # User registration endpoint
├── login/page.tsx                     # Login page (updated)
└── signup/page.tsx                    # Signup page (updated)

lib/
├── auth.ts                            # NextAuth configuration
├── google-sheets-db.ts                # User database functions
├── env.ts                             # Environment validation (updated)
└── rate-limit.ts                      # Rate limiting

components/
└── providers.tsx                      # Session provider wrapper

middleware.ts                          # Route protection
.env.local                             # Environment variables (updated)
.env.example                           # Example env file
```

---

## Google Sheets Database

### Users Sheet Structure

| Column | Description |
|--------|-------------|
| A - ID | Unique user ID (`user_{timestamp}_{random}`) |
| B - Email | User email address (unique) |
| C - Password | Bcrypt hashed password |
| D - Name | User's name (optional) |
| E - Plan | Subscription plan (default: "free") |
| F - Created At | ISO timestamp |
| G - Last Login | ISO timestamp (updated on login) |

### Setup Instructions

1. Open your Google Sheet (ID: `1EngPJg8c0iEiGesOKDDlEH_GHtv1Gq4-PNOQiyI8S9Q`)
2. A "Users" sheet will be created automatically on first signup
3. Headers are added automatically if missing

---

## API Endpoints

### POST `/api/auth/register`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Validations:**
- Email must be valid
- Password must be at least 8 characters
- Email must be unique

---

### POST `/api/auth/signin`
Login with credentials (handled by NextAuth)

**Request:**
```javascript
signIn('credentials', {
  email: 'user@example.com',
  password: 'securepassword123',
  redirect: false
})
```

---

### GET `/api/auth/session`
Get current session (handled by NextAuth)

**Response:**
```json
{
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "free"
  },
  "expires": "2025-01-11T00:00:00.000Z"
}
```

---

## Protected Routes

The following routes require authentication:
- `/market-research`
- `/history`
- `/checkout`
- `/success`

**Middleware Configuration** ([middleware.ts](middleware.ts)):
```typescript
export const config = {
  matcher: [
    "/market-research/:path*",
    "/history/:path*",
    "/checkout/:path*",
    "/success/:path*",
  ],
};
```

If an unauthenticated user tries to access these routes, they'll be redirected to `/login` with a `callbackUrl` parameter.

---

## Environment Variables

### Required Variables

```bash
# NextAuth Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
NEXTAUTH_SECRET=your_secret_here

# NextAuth URL (optional in development)
NEXTAUTH_URL=http://localhost:3000

# Google Sheets (already configured)
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CLIENT_EMAIL=your_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini API (already configured)
GEMINI_API_KEY=your_api_key
```

---

## Usage Examples

### 1. User Registration

```typescript
// In signup page
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'mypassword123',
    name: 'John Doe'
  })
})

const data = await response.json()
if (data.success) {
  // Auto-login after registration
  await signIn('credentials', {
    email: 'user@example.com',
    password: 'mypassword123',
    redirect: false
  })
}
```

### 2. User Login

```typescript
// In login page
const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'mypassword123',
  redirect: false
})

if (result?.error) {
  toast.error(result.error) // "Invalid email or password"
} else {
  router.push('/market-research')
}
```

### 3. Check Session (Client-Side)

```typescript
import { useSession } from 'next-auth/react'

function ProtectedComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return <div>Welcome, {session.user.name}!</div>
}
```

### 4. Check Session (Server-Side)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // User is authenticated
  return NextResponse.json({ user: session.user })
}
```

### 5. Logout

```typescript
import { signOut } from 'next-auth/react'

// Sign out and redirect to home
await signOut({ callbackUrl: '/' })
```

---

## Security Features

### 1. Password Hashing
- Uses bcrypt with 10 salt rounds
- Passwords are never stored in plain text
- Password hashes are generated server-side only

### 2. Session Management
- JWT tokens stored in HTTP-only cookies
- 30-day session expiration
- Secure session validation on every request

### 3. Environment Validation
- All required secrets validated on startup
- Fails fast if misconfigured
- Type-safe environment access

### 4. Protected Routes
- Middleware automatically redirects unauthenticated users
- No client-side hacks can bypass protection
- Session verified server-side

### 5. Input Validation
- Zod schemas validate all registration inputs
- Email format validation
- Password minimum length enforcement

---

## Testing the Authentication

### 1. Create a Test User

1. Go to http://localhost:3000/signup
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123 (min 8 chars)
   - Confirm Password: password123
3. Click "Sign Up"
4. You'll be auto-logged in and redirected to `/market-research`

### 2. Verify User in Google Sheets

1. Open the Google Sheet
2. Go to the "Users" tab
3. You should see your test user with hashed password

### 3. Test Login

1. Log out (if you add a logout button)
2. Go to http://localhost:3000/login
3. Enter credentials:
   - Email: test@example.com
   - Password: password123
4. Click "Sign In"
5. You'll be redirected to `/market-research`

### 4. Test Protected Routes

1. Open an incognito window
2. Try to access http://localhost:3000/market-research
3. You should be redirected to `/login?callbackUrl=/market-research`
4. After login, you'll be sent back to `/market-research`

---

## Troubleshooting

### Error: "NEXTAUTH_SECRET is required"
- Make sure `.env.local` has `NEXTAUTH_SECRET` set
- Restart the dev server after adding the variable

### Error: "Invalid email or password"
- Check that the user exists in the Users sheet
- Verify the password is correct
- Check console for detailed error logs

### Error: "User already exists"
- The email is already registered
- Try logging in instead
- Or use a different email

### Session not persisting
- Clear cookies and try again
- Check that `NEXTAUTH_SECRET` is set
- Verify `SessionProvider` wraps the app in layout.tsx

---

## Next Steps

### Recommended Additions

1. **Logout Button**
   - Add to navigation
   - Use `signOut()` from next-auth/react

2. **Password Reset**
   - Add "Forgot Password" endpoint
   - Send reset links via email

3. **Email Verification**
   - Verify emails before allowing login
   - Send verification links

4. **User Profile Page**
   - View/edit user information
   - Change password
   - Delete account

5. **Admin Panel**
   - View all users
   - Manage subscriptions
   - Ban/unban users

6. **Upgrade to Redis**
   - For production, use Redis for session storage
   - Better performance and scalability

---

## Production Deployment

### Environment Variables
Make sure to set all required variables in your production environment:
- `NEXTAUTH_SECRET` (generate a new one for production)
- `NEXTAUTH_URL` (your production URL)
- All Google Sheets credentials
- Gemini API key

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Generate new NEXTAUTH_SECRET for production
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Enable Google Sheets API access for production service account
- [ ] Review and update CORS settings if needed
- [ ] Set up monitoring for failed login attempts
- [ ] Consider adding 2FA for admin accounts

---

**Authentication Status**: ✅ Fully Implemented and Functional

Users can now:
- Register with email/password
- Login securely
- Access protected routes only when authenticated
- Have their credentials stored securely in Google Sheets
