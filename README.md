# 🚀 Fairlios – Smart Expense Splitter  

Fairlios is a full-stack web application that helps friends and groups split expenses fairly.  
It is built with **Node.js, Express, MongoDB (Mongoose), EJS, and Bootstrap**.  

---

## 📖 Features  

- 👤 **User Authentication** – Register, login, and manage sessions
- 📧 **JWT-based Email Verification** – Secure email links generated with JWT tokens for registered account confirmation
- 🔑 **Secure Passwords** – User passwords are hashed using bcrypt
- 🍪 **JWT Authentication** – Uses JSON Web Tokens stored in cookies for secure auth
- ⚡ **Flash Messages** – Success and error messages displayed using express-session
- 👥 **Groups** – Create groups and invite members through Unique Code
- 💸 **Expenses** – Add expenses with title, amount, and note
- 🔀 **Auto-Split** – Fairly divides expenses among group members
- 📝 **Validation** – Mongoose schema validation for data integrity
- 📑 **Pagination** – Navigate through large lists of expenses
- 🔒 **Unique Constraints** – Prevent duplicate users and members
- 🖨️ **Print Feature** – Generate downloadable/printable PDFs
- 🌦️ **Weather API Integration** – Displays real-time weather info on the dashboard using a third-party API
- 🌍 **User IP Detection** – Fetches and displays the user’s IP address via external API (Axios)
- 📱 **Twilio SMS Alerts** – Send SMS notifications for contact form (to admin number)
- 📄 **PDF Reports** – Generate detailed expense reports using html-pdf-node
- 🛡️ **Security Enhancements** – Middleware protections with Helmet.js and Rate Limiting to prevent abuse
- 🔗 **Axios API Fetching** – Used for integrating external services (Weather, Currency, IP info, etc.)

---

## 🛠️ Tech Stack  

- **Backend**: Node.js, Express
- **Frontend**: EJS Templates, Bootstrap 5
- **Database**: MongoDB with Mongoose ODM
- **Auth & Security**: bcrypt, JSON Web Tokens (JWT), cookie-parser, express-session, connect-flash, Helmet, Rate Limiter
- **Other Tools**: Nodemon (dev), dotenv, Puppeteer / html-pdf-node, Axios, Twilio  