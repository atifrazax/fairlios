const router = require("express").Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const userController = require("../controllers/user.controller");
const expenseController = require("../controllers/expense.controller");
const groupController = require("../controllers/group.controller");
// User Routes
router.get("/register", userController.registerPage);
router.post("/register", userController.registerUser);
router.get("/login", userController.loginPage);
router.post("/login", userController.loginUser);
router.get('/', isLoggedIn, userController.dashboard); // Dashboard
router.get('/profile', isLoggedIn, userController.profilePage);
router.post('/profile', isLoggedIn, userController.updateProfile);
router.get('/about', (req, res) => res.render("about"));
router.get('/logout', userController.logout);
router.get('/verify/:token', userController.emailVerification);
// Expense Routes
router.get("/expense/group-detail/:code", isLoggedIn, expenseController.groupDetail);
router.get("/expense/group-detail/print/:code", isLoggedIn, expenseController.groupDetailPrint); // Print Friendly
router.post("/expense/add/:code", isLoggedIn, expenseController.addExpense);
router.post("/expense/delete/:id", isLoggedIn, expenseController.deleteExpense); 
// Group Routes
router.post("/group/new", isLoggedIn, groupController.newGroup); // add new group
router.post("/group/delete/:code", isLoggedIn, groupController.deleteGroup); //used POST method as ejs-render doesn't support DELETE, PUT
// Contact Routes
router.post("/contact", userController.contact);




// Error handling
router.use((req, res) => res.status(404).render("404")); // 404
// 500 & rest
router.use( (err, req, res, next) => {
    // console.error(err);
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).render('oops', { message, status });
});

module.exports = router;
