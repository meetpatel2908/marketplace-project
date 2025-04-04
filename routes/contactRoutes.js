const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Serve the Contact Page
router.get("/contact", authenticateUser, (req, res) => {
    res.render("contact", { user: req.user, success: null });  // ✅ Add success variable
});

// Handle Contact Form Submission (POST)
router.post("/contact", authenticateUser, async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const userRole = req.user.role; // ✅ Get user role from authentication

        await prisma.message.create({
            data: {
                name,
                email,
                message,
                userRole: userRole.toUpperCase() // Convert role to uppercase for consistency
            }
        });

        res.render("contact", { user: req.user, success: "Your message has been sent to the admin." });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).send("Error submitting message");
    }
});


module.exports = router;
