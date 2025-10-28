i# TODO List for Video Page and Contact Form Fixes

## Plan 1: Fix Video Page Design (Completed)
- [x] Update videostyle.css to make .bottom-section position: fixed at bottom
- [x] Adjust body padding to account for fixed bottom section
- [ ] Test that buttons and chat inputs remain visible during connection

## Plan 2: Contact Form Email Integration (Pending)
- [ ] Update contact.html to submit form to server endpoint
- [ ] Add POST /contact route in server/src/index.ts
- [ ] Install and configure nodemailer for Gmail sending
- [ ] Add Gmail credentials (email and app password needed)
- [ ] Test email sending functionality
