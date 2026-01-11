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

  <br />

  [![](https://img.shields.io/badge/🟢_Live_Demo-Visit_App-success?style=for-the-badge)](https://nebripop.vercel.app/)

</div>

---

## About the Project

**NebriPop** is a robust, full-stack **C2C (Consumer-to-Consumer) marketplace** designed to facilitate the buying and selling of second-hand goods. Inspired by platforms like Wallapop or Vinted, it provides a seamless experience for users to list products, negotiate via real-time chat, and manage transactions securely.

The platform is built with a focus on scalability and performance, utilizing **NestJS** for a solid backend architecture and **React** for a responsive, mobile-first frontend experience.

## Key Features

### Marketplace Core
- **Product Management:** Users can upload products with multiple images, categories, and detailed descriptions.
- **Advanced Search & Filters:** Filter by price range, date, category, and keywords.
- **Favorites System:** Save items for later.

### Real-Time & Interaction
- **Live Chat:** Integrated messaging system using **Socket.io**. Buyers and sellers can negotiate deals instantly without refreshing the page.
- **Notification System:** Real-time alerts for new messages and product updates. Includes a user preference center to **toggle notifications ON/OFF**.

### Analytics & Engagement
- **View Counters:** Unique view tracking logic (filtering owner views and repeated visits via IP/User ID).
- **Public Profiles:** View seller ratings, active products, and transaction history.
- **Reviews:** Rating system for completed transactions.

### Financial System (Wallet)
- **Integrated Wallet:** Users have a virtual balance to receive payments or make purchases.
- **Transactions:** Deposit and withdrawal simulation.

### Security & Architecture
- **Authentication:** JWT-based auth (Access & Refresh tokens).
- **Role-Based Access:** Distinction between public/private routes.
- **Data Integrity:** PostgreSQL with TypeORM for strict data modeling and relationships.

---

## Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Language:** TypeScript
- **Styling:** CSS Modules / Responsive Design (Mobile First)
- **State Management:** React Context API
- **Routing:** React Router DOM
- **HTTP Client:** Axios

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** TypeORM
- **Real-time:** Socket.io (for Chat)
- **File Storage:** Supabase Storage / Multer

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
