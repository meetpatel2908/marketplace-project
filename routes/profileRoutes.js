const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateUser } = require("../middleware/authMiddleware");

router.use(authenticateUser);

// Show the edit profile page
router.get("/edit" ,async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, role: true }, // Fetch role along with other details
        });

        res.render("edit-profile", { user, role: req.user.role });
    } catch (error) {
        console.error("Error loading edit profile page:", error);
        res.status(500).send("Failed to load profile");
    }
});

router.get("/user-profile", authenticateUser, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            console.log("User not authenticated. Redirecting to login.");
            return res.redirect("/login");
        }

        const userId = req.user.userId;
        console.log("Fetching user profile for ID:", userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            console.log("User not found in database.");
            return res.status(404).send("User not found");
        }

        console.log("User data fetched:", user);
        res.render("user-profile", { user, role: user.role }); // ✅ Ensure role is passed

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send("Error fetching user profile");
    }
});


// Handle profile update



router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});





router.post("/update", authenticateUser , async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id; // Get logged-in user ID

        await prisma.user.update({
            where: { id: userId },
            data: { name, email },
        });

        res.redirect("/user-profile"); // Redirect back to profile page after update
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Failed to update profile");
    }
});

module.exports = router;
