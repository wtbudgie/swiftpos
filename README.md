# SwiftPOS

**SwiftPOS** is a full-stack Point of Sale (POS) system built with TypeScript, Next.js App Router, MongoDB, Stripe, and MUI. It handles authentication, email confirmations, secure Stripe payments, and supports a modular layout system for flexible UI composition.
**Built for VCE Software Development Unit 3/4 SAT.**

---

-   Built using **NextJS** with **Typescript**
-   Utilises **MongoDB** database.
-   With support for **NextAuth.js** and payments with **stripe**
-   **Uses **Nodemailer\*\* for sending out emails.

---

## Getting Started

-   **Install dependencies**
    `npm install`
-   **Start development server**
    `npm run dev`
-   **Start Stripe webhook listener**
    `npm run stripe`
-   **Fix local DNS issues (if needed)**
    `npm run fixDNS`

## 📁 File Structure

```plaintext
/src

├── app/ # Server-side pages and API routes (Next.js App Router)

├── components/ # Reusable global UI components (e.g., buttons)

├── layouts/ # Page-level layout structures

│ ├── */sections/ # Layout components (e.g., headers, footers)

│ └── */pages/ # Subpages nested within a layout

├── type/ # Shared TypeScript types and interfaces

└── utils/ # Pure utility/helper functions

```

### 🔐 Environment Variables

##### All environment variables are stored in .env.local. Do not commit this file. Below is a template:

_For stripe_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

_For database_
MONGODB_URI=

_For Auth_
AUTH_SECRET=
AUTH_TRUST_HOST=

_For Email (SMTP - for nextauth)_
EMAIL_SERVER=
EMAIL_FROM=

_With use in nodemailer_
NODEMAILER_FROM=
NODEMAILER_HOST=
NODEMAILER_PORT=
NODEMAILER_USER=
NODEMAILER_PASSWORD=

## 📜 Scripts

| Script       | Description                                       |
| ------------ | ------------------------------------------------- |
| `dev`        | Start dev server using Turbopack                  |
| `build`      | Build the production bundle                       |
| `start`      | Start the app in production mode                  |
| `lint`       | Run ESLint across the codebase                    |
| `lint:fix`   | Automatically fix lint issues                     |
| `type-check` | Run TypeScript checks without emitting files      |
| `prepare`    | Patch WebSocket support via `next-ws`             |
| `stripe`     | Start Stripe webhook forwarding to `/api/webhook` |
| `fixDNS`     | Bash script to resolve DNS issues                 |
