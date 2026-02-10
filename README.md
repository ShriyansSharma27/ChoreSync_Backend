# ChoreSync_Backend

# ChoreSync Backend (Services.ae)

A robust Node.js/Express API designed for a home services marketplace. This backend manages multi-role authentication, service listings, and secure payment processing using Clerk, Stripe, and PostgreSQL.

## Features

- **Role-Based Auth:** Differentiates between Customers and Service Providers.
- **Clerk Integration:** Custom middleware for JWT verification and user synchronization.
- **Stripe Payments:** Server-side checkout session creation.
- **Relational Database:** Organized PostgreSQL schema for services, providers, and order history.
- **Security:** Integrated rate-limiting (200 req/min) and CORS protection.

---

## Tech Stack

- **Server:** Node.js, Express.js
- **Database:** PostgreSQL (Neon.tech)
- **Auth:** Clerk Express SDK
- **Payments:** Stripe API
- **Utilities:** Axios, Body-Parser, Cookie-Parser, Dotenv

---

## API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/customer/signup` | Records a new customer in the database. |
| `POST` | `/auth/provider/signup` | Registers a provider (and ensures customer profile exists). |
| `GET` | `/auth/isprovider` | Checks if the authenticated user is a provider. |
| `POST` | `/auth/upgrade-role` | Upgrades an existing customer to a service provider. |

### Provider Management (`/api/provider`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/add_service` | Lists a new service (prevents duplicates). |
| `GET` | `/get_services` | Fetches all available services globally. |
| `GET` | `/provider_services` | Fetches services belonging to a specific provider. |
| `PUT` | `/modify_service` | Updates service details or images. |
| `DELETE`| `/remove_service` | Deletes a service (blocked if active orders exist). |

### Customer & Orders (`/api/customer`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/purchase` | Records bulk service purchases with timestamps. |

### Payments (`/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/checkout-session` | Generates a Stripe Checkout URL for payments. |

---

## Database Logic Highlights

### Service Integrity
The `/remove_service` route includes a relational check against the `Bought_services` table. A service cannot be deleted if a customer has already purchased it, ensuring order history remains intact.

### Identity Syncing
The `/provider/signup` route is designed for atomicity. It checks if a provider also exists as a customer. If not, it creates a customer entry simultaneously, allowing providers to also act as consumers within the marketplace.

---

## 💻 Local Setup

1. **Clone & Install:**
   ```bash
   git clone <your-repo-link>
   cd <repo-folder>
   npm install
