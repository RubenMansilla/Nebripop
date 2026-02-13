# NebriPop

<div align="center">

  <img src="https://github.com/RubenMansilla/Nebripop/blob/main/apps/frontend/src/assets/logos/nebripop.png?raw=true" alt="NebriPop Logo" width="300" />

  <br />
  <br />

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

  <br />

  [![](https://img.shields.io/badge/🟢_Live_Demo-Visit_App-success?style=for-the-badge)](https://nebripop.vercel.app/)

</div>

---

## About the Project

**NebriPop** is a full-stack **C2C (Consumer-to-Consumer) marketplace** for buying and selling second-hand goods. Inspired by platforms like Wallapop or Vinted, it offers a complete experience: list products, negotiate in real time, purchase securely, and participate in live auctions — all from one place.

Built with **React** on the frontend and **NestJS** on the backend, with a responsive, mobile-first design.

---

## Key Features

### 🛒 Marketplace
- Upload products with multiple images, categories, subcategories, and detailed descriptions (condition, color, material, dimensions).
- All images are automatically optimized for fast loading.
- Advanced search with filters by price range, publication date, category, and keywords.
- Save your favorite products and auctions. Get notified when a product you follow drops in price.
- Products under active negotiation are flagged, preventing other buyers from purchasing them until the conversation concludes.

### 🔨 Auctions
- Sellers can create timed auctions with a starting price and a custom end time.
- Users place bids that must exceed the current highest offer, with a live countdown and full bid history visible.
- **Automatic notifications** alert all bidders as the auction nears its end (5h, 1h, 30min, 10min, 5min).
- When the auction finishes, the highest bidder wins and has **48 hours to complete the payment**.
- If the winner doesn't pay, the system **automatically penalizes** them and **reassigns the auction** to the next highest bidder.
- Auctions with no bids or no remaining valid bidders expire automatically, and the seller is notified.

### ⚠️ Penalty System
A progressive **3-strike system** to discourage non-payment and ensure fair play:

| Strike | Consequence | Duration |
|--------|------------|----------|
| **Strike 1** | Warning — the user can still participate | 30 days |
| **Strike 2** | Blocked from bidding and creating auctions | 180 days |
| **Strike 3** | **Permanent ban** from all auction activity | Permanent |

- Repeat offenders face exponentially longer restriction periods.
- Penalties expire automatically after their duration. Permanent bans do not expire.

### 💬 Real-Time Chat & Offers
- Integrated messaging system where buyers and sellers can negotiate deals instantly via live chat.
- Users can send price offers directly in the conversation. If accepted, the agreed price is used at checkout.
- Each conversation is linked to the products being discussed, and products are automatically unlinked when sold.

### 🔔 Notifications
- Real-time notifications for messages, auction countdowns, wins, payment reminders, penalties, price drops, and transaction updates.
- Outdated notifications are automatically replaced to keep things clean.
- Users can customize which notification categories they want to receive from a preferences panel.

### 📊 Statistics & Profiles
- Unique view counter for each product, filtering out repeated visits and owner views.
- Seller dashboard with financial charts (income, expenses, sales, reviews) filterable by week, month, or year.
- Top products ranking by views, favorites, and activity.
- Public profiles showing seller ratings, active listings, and review history.
- Review system for completed transactions.

### 💰 Wallet & Checkout
- Each user has a virtual wallet to receive payments and make purchases.
- Simulated deposit and withdrawal operations.
- Full checkout flow with shipping details, 21% IVA calculation, shipping costs, and support for wallet or PayPal payment methods.
- If a price was negotiated via chat, the checkout automatically uses the agreed amount.

### 🔐 Security
- JWT-based authentication with access and refresh tokens.
- Public and private routes with role-based access control.
- Passwords securely hashed.
- Strict data integrity with relational constraints.
- Transactional email system for account-related communications.

---

## Tech Stack

### Frontend
- **React.js** (Vite) — UI Framework
- **TypeScript** — Type Safety
- **CSS** — Responsive, Mobile-First Styling
- **React Context API** — State Management
- **React Router DOM** — Client-Side Routing
- **Axios** — HTTP Client
- **Socket.io Client** — Real-Time Communication

### Backend
- **NestJS** — Server Framework
- **TypeScript** — Type Safety
- **PostgreSQL** (Supabase) — Relational Database
- **TypeORM** — ORM & Data Modeling
- **Socket.io** — Real-Time Chat
- **Supabase Storage** — Image Hosting
- **Sharp** — Image Optimization
- **Cron Scheduler** — Automated Auction Lifecycle

---

## Screenshots

| Home Page | Product Detail |
|:---:|:---:|
| <img src="https://via.placeholder.com/300x600?text=Home+Screen" width="300"> | <img src="https://via.placeholder.com/300x600?text=Product+Detail" width="300"> |

| Wallet & Stats | User Profile |
|:---:|:---:|
| <img src="https://via.placeholder.com/300x600?text=Wallet" width="300"> | <img src="https://via.placeholder.com/300x600?text=Profile" width="300"> |

---

## Contributors

This project was built by:

* [**Rubén Mansilla**](https://github.com/RubenMansilla)
* [**Marcos Martín**](https://github.com/MarcosMartdomg)
* [**Rubén Romero**](https://github.com/Rubenro22)
* [**Roberto Aláez**](https://github.com/Robgolte)
