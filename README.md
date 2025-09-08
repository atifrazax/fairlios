# 🚀 Fairlios – Smart Expense Splitter  

Fairlios is a full-stack web application that helps friends and groups split expenses fairly.  
It is built with **Node.js, Express, MongoDB (Mongoose), EJS, and Bootstrap**.  

---

## 📖 Features  

- 👤 **User Authentication** – Register, login, and manage sessions  
- 🔑 **Secure Passwords** – User passwords are hashed using **bcrypt**  
- 🍪 **JWT Authentication** – Uses **JSON Web Tokens** stored in cookies for secure auth  
- ⚡ **Flash Messages** – Success and error messages displayed using **express-session**  
- 👥 **Groups** – Create groups and invite members  
- 💸 **Expenses** – Add expenses with title, amount, and note  
- 🔀 **Auto-Split** – Fairly divides expenses among group members  
- 📝 **Validation** – Mongoose schema validation for data integrity  
- 📑 **Pagination** – Navigate through large lists of expenses  
- 🔒 **Unique Constraints** – Prevent duplicate users and members  

---

## 🛠️ Tech Stack  

- **Backend:** Node.js, Express  
- **Frontend:** EJS Templates, Bootstrap 5  
- **Database:** MongoDB with Mongoose ODM  
- **Auth & Security:** bcrypt, JSON Web Tokens (JWT), cookie-parser, express-session, connect-flash  
- **Other Tools:** Nodemon (dev), dotenv  

---

## ⚙️ Installation & Setup  

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/atifrazax/fairlios.git
cd fairlios
