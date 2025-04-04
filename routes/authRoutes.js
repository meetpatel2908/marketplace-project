const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { Role } = require("@prisma/client");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware"); // Import  authenticateUser = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.use(cookieParser()); // Middleware to parse cookies

// Render Registration Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.send("This user already exists.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role.toUpperCase(), // Convert role to lowercase
            },
        });

        // Redirect to login page
        return res.redirect("/login");

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send("An error occurred.");
    }
});



// Render Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Handle Login with Role Verification
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role }, // Include user details
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" }); // Add sameSite: "lax"
// Secure: false for development
  res.redirect("/dashboard");
});


router.get("/dashboard", authenticateUser, (req, res) => {
    res.render("dashboard", { user: req.user, role: req.user.role });
});


// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

router.get("/user-profile", authenticateUser ,(req, res) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        prisma.user.findUnique({ where: { id: decoded.userId } })
            .then(user => {
                if (user) {
                    res.render("user-profile", { user });
                } else {
                    res.redirect("/login");
                }
            });
    } catch (error) {
        res.redirect("/login");
    }
});




module.exports = router;
