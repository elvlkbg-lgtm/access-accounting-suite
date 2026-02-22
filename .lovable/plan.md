

# Accounting Services Platform

A full-featured platform connecting clients with professional accountants, featuring role-based access, document management, messaging, and service request workflows. Designed with a bright, stylish gray-white-blue color scheme.

---

## 1. Landing Page & Public Pages

- **Hero section** with search bar to find accountants by specialization (audit, HR, tax, full accounting)
- **How it works** section explaining the platform for clients and accountants
- **Featured accountants** showcase with ratings and specializations
- **Footer** with contact info, links, and legal pages

## 2. Authentication & Role-Based Access

- **Login / Register** pages with email and password
- **Three roles**: Administrator, Accountant, Client
- Each user is directed to their own dashboard after login
- Role-based navigation — users only see what they have access to
- Backend with Lovable Cloud (Supabase) for user accounts and data storage

## 3. Client Dashboard

- **Search accountants** by specialization, location, rating, and price range
- **View accountant profiles** with services, pricing, specialization, and reviews
- **Request a service** from an accountant (select service type, describe needs)
- **Track service requests** — see status (pending, in progress, completed)
- **Messaging** — send and receive messages to/from accountants
- **Document management** — upload documents for accountants, receive processed documents back
- **Notifications** for new messages, status updates, and document activity

## 4. Accountant Dashboard

- **Profile management** — edit specialization (audit, HR, accounting, tax), bio, experience, and contact info
- **Price list** — manage services with descriptions and pricing
- **Client requests** — view incoming service requests, accept/reject, update status
- **Document processing** — receive client documents, upload processed/completed documents back
- **Messaging** — communicate with clients
- **External contacts section** — links and info for NAP (National Revenue Agency), NOI (National Social Security Institute), and Labor Inspectorate
- **Online consultations** — schedule and manage consultation sessions with clients
- **Analytics overview** — number of active clients, completed requests, revenue summary

## 5. Administrator Panel

- **User management** — view all users, assign/change roles, activate/deactivate accounts
- **Accountant approval** — review and approve new accountant registrations
- **Content moderation** — manage reported messages or reviews
- **Platform overview** — statistics on users, requests, documents, and activity
- **Full access** to all client and accountant data

## 6. Messaging System

- Real-time messaging between clients and accountants
- Message history and conversation threads
- Notification indicators for unread messages

## 7. Document Management

- Secure file upload and download for clients and accountants
- Document status tracking (uploaded, in review, processed, returned)
- Organized by client and service request

## 8. Database & Backend (Lovable Cloud / Supabase)

- User profiles, roles, and authentication
- Accountant profiles with specializations and pricing
- Service requests with status workflow
- Messages table for conversations
- Document storage with file references
- Row-level security ensuring users only access their own data

## 9. Design & Styling

- **Color palette**: Blue primary, white backgrounds, gray accents
- Clean, modern, professional aesthetic
- Responsive design for desktop and mobile
- Consistent card-based layouts for profiles, requests, and documents

