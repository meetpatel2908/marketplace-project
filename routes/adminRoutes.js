const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken"); // <-- Add this at the top!
const {authenticateUser} = require("../middleware/authMiddleware");


const prisma = new PrismaClient();
const router = express.Router();

function isAdmin(req, res, next) {
    console.log("Checking admin access...");
    console.log("Cookies:", req.cookies); // Check if token exists

    const token = req.cookies.token;
    if (!token) {
        console.log("No token found, redirecting to login.");
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Show decoded token

        // Ensure role is exactly "admin"
        if (!decoded.role || decoded.role !== "ADMIN") {
            console.log("User is not admin. Access Denied.");
            return res.status(403).send("Access Denied");
        }

        req.user = decoded;
        console.log("Admin verified. Proceeding...");
        next();
    } catch (error) {
        console.log("Token verification failed:", error);
        return res.redirect("/login");
    }
}




router.get("/dashboard", isAdmin, (req, res) => {
    res.render("dashboard", { role: req.user.role }); // Pass role to the template
});


// Route to view all users (buyers)
router.get("/admin/users", isAdmin, async (req, res) => {
    const users = await prisma.user.findMany({ where: { role: "USER" } });
    res.render("admin-users", { users });
});

// Route to view all sellers
router.get("/admin/sellers", isAdmin, async (req, res) => {
    const sellers = await prisma.user.findMany({ where: { role: "SELLER" } });
    res.render("admin-sellers", { sellers });
});

// Route to delete a user or seller
router.post("/admin/delete-user", isAdmin, async (req, res) => {
    const { id } = req.body;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.redirect("/admin/users"); // Or "/admin/sellers" based on context
});

router.get("/admin/messages/users", async (req, res) => {
    const messages = await prisma.message.findMany({ where: { userRole: "USER" } });
    res.render("admin-messages", { messages, userType: "Users" });
});

router.get("/admin/messages/sellers", async (req, res) => {
    const messages = await prisma.message.findMany({ where: { userRole: "SELLER" } });
    res.render("admin-messages", { messages, userType: "Sellers" });
});


module.exports = router;
