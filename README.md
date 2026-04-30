#  Airbnb Listings API (TypeScript + Express)

A clean, modular REST API that simulates a simplified version of Airbnb.
Built with **Node.js**, **Express**, and **TypeScript**, following an **MVC architecture** and best backend practices.


##  Features

* Full CRUD for **Users** and **Listings**
* In-memory data (no database required)
* Strict TypeScript (no `any`, no unsafe nulls)
* Modular structure (Controllers, Models, Routes)
* Proper HTTP status codes and error handling
* Clean and scalable architecture


##  Project Structure

```
airbnb-api/
├── src/
│   ├── controllers/
│   │   ├── users.controller.ts
│   │   └── listings.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── listing.model.ts
│   ├── routes/
│   │   ├── users.routes.ts
│   │   └── listings.routes.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── .gitignore
```



##  Installation

```bash
# Clone the project
git clone https://github.com/Lapidis2/airbnb-api,

# Navigate into project
cd airbnb-api

# Install dependencies
npm install
```



##  Running the App

```bash
# Development mode
npm run dev

# Build project
npm run build

# Run production build
npm start
```

Server runs at:

```
http://localhost:3000
```

---

##  API Endpoints

###  Users

| Method | Endpoint   | Description     |
| ------ | ---------- | --------------- |
| GET    | /users     | Get all users   |
| GET    | /users/:id | Get user by ID  |
| POST   | /users     | Create new user |
| PUT    | /users/:id | Update user     |
| DELETE | /users/:id | Delete user     |


###  Listings

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | /listings     | Get all listings   |
| GET    | /listings/:id | Get listing by ID  |
| POST   | /listings     | Create new listing |
| PUT    | /listings/:id | Update listing     |
| DELETE | /listings/:id | Delete listing     |

---

##  Data Models

### User

```ts
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "host" | "guest";
  avatar?: string;
  bio?: string;
}
```


### Listing

```ts
interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: "apartment" | "house" | "villa" | "cabin";
  amenities: string[];
  rating?: number;
  host: string;
}
```



##  Example Requests

### Create User

```http
POST /users
```

```json
{
  "name": "New User",
  "email": "new@gmail.com",
  "username": "newuser123",
  "phone": "0785934",
  "role": "guest"
}
```

---

### Create Listing

```http
POST /listings
```

```json
{
  "title": "Modern Apartment",
  "description": "Nice and clean",
  "location": "Kigali",
  "pricePerNight": 70,
  "guests": 3,
  "type": "apartment",
  "amenities": ["wifi", "kitchen"],
  "host": "johnny"
}
```

---

## ⚠️ Error Handling

| Status Code | Meaning                       |
| ----------- | ----------------------------- |
| 400         | Missing required fields       |
| 404         | Resource not found            |
| 201         | Resource created successfully |

---

##  Best Practices Used

* Separation of concerns (MVC pattern)
* Typed request bodies using TypeScript
* Guard clauses for error handling
* Modular routing with `express.Router`
* Clean, readable, and scalable code

---

##  Future Improvements

* Add validation (Zod / Joi)
* Connect to a real database (MongoDB / PostgreSQL)
* Add authentication (JWT)
* Pagination & filtering
* Logging middleware

---

##  Author

Built as part of a backend learning project to master:

* Node.js
* Express
* TypeScript
* REST API design

---

## 📄 License

This project is open-source and available under the MIT License.
