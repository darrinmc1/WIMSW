# Deployment Checklist - Immediate Fixes

## Pre-Deployment

### 1. Environment Variables
- [ ] Add `SUPPORT_EMAIL=support@wimsw.com` to production environment (Vercel/hosting platform)
- [ ] Verify all existing environment variables are set
- [ ] Update `.env.local` for local testing

### 2. Database Verification
- [ ] Ensure at least one admin user exists with `role: 'ADMIN'`
  ```sql
  -- Check for admin users
  SELECT email, role FROM users WHERE role = 'ADMIN';

  -- If needed, update a user to admin
  UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
  ```

### 3. Code Review
- [ ] Review changes in `middleware.ts`
- [ ] Review changes in `lib/auth.ts`
- [ ] Review changes in `next.config.mjs`
- [ ] Review new `lib/config.ts` file

### 4. Local Testing
- [ ] Run `npm run dev` and test admin access
- [ ] Verify non-admin users cannot access `/admin`
- [ ] Test forgot password flow (check email shows correct support address)
- [ ] Verify images load correctly with new whitelist

## Deployment Steps

### 5. Version Control
```bash
git add .
git commit -m "Security fixes: admin auth, remove hardcoded emails, restrict image domains"
git push origin main
```

### 6. Deploy to Production
- [ ] Deploy via Vercel/your hosting platform
- [ ] Monitor deployment logs for errors
- [ ] Verify build completes successfully

### 7. Post-Deployment Verification
- [ ] Test login as regular user
- [ ] Test login as admin user
- [ ] Verify admin dashboard access control works
- [ ] Test image loading on market research page
- [ ] Verify support email appears correctly in error messages
- [ ] Check forgot password functionality

### 8. Monitoring
- [ ] Check Sentry for any new errors
- [ ] Monitor server logs for 403 errors (redirected non-admins)
- [ ] Verify no image loading errors in console

## Rollback Plan

If issues occur:

1. **Immediate:** Revert deployment in Vercel dashboard
2. **Database:** No database changes were made, so no DB rollback needed
3. **Code:** Revert to previous commit
   ```bash
   git revert HEAD
   git push origin main
   ```

## Success Criteria

✅ All tests pass
✅ No production errors in Sentry
✅ Admin users can access /admin routes
✅ Non-admin users are redirected from /admin routes
✅ Support email shows correctly in UI
✅ Images load from whitelisted domains
✅ No security vulnerabilities remain

---

**Estimated Deployment Time:** 15-20 minutes
**Risk Level:** Low (mostly security improvements, no breaking changes)
**Recommended Time:** During low-traffic hours or with monitoring
