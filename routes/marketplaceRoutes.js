const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/marketplace", authenticateUser, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { seller: true }
        });

        res.render("marketplace", {
            products,
            role: req.user.role // ✅ No session, use authenticated user role
        });

    } catch (error) {
        console.error("Error fetching marketplace:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
