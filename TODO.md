# Admin Login Fix Tasks

- [x] Update server/src/routes/auth.ts:
  - [x] Change JWT payload in admin login to use 'userId' instead of 'id'
  - [x] Modify admin login response to include user object with id, name, email, role
  - [x] Apply same fixes to user/login endpoint
  - [x] Fix profile endpoint to use req.user._id

- [x] Test admin login after changes
- [x] Verify profile endpoint works
