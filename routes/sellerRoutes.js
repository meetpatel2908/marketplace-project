const express = require("express");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const { authenticateUser } = require("../middleware/authMiddleware");
const path = require("path");

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
    destination: "public/uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

/* 📌 View all items uploaded by the seller */
router.get("/mysells", authenticateUser, async (req, res) => {
    if (req.user.role !== "SELLER") {
        return res.status(403).send("Unauthorized");
    }

    try {
        const products = await prisma.product.findMany({
            where: { sellerId: req.user.userId },
        });

        res.render("mysells", { products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
});

/* 📌 Update an item (GET form) */
router.get("/edit/:id", authenticateUser, async (req, res) => {
    if (req.user.role !== "SELLER") {
        return res.status(403).send("Unauthorized");
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (!product || product.sellerId !== req.user.userId) {
            console.log("Unauthorized: Product sellerId does not match userId");
            return res.status(403).send("Unauthorized");
        }

        res.render("editItem", { product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Error fetching product");
    }
});

/* 📌 Update an item (POST form submission) */
router.post("/edit/:id", authenticateUser, upload.single("image"), async (req, res) => {
    if (req.user.role !== "SELLER") {
        return res.status(403).send("Unauthorized");
    }

    try {
        const { name, price, condition, description, category } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updateData = { name, price: parseFloat(price), condition, description, category };
        if (imagePath) updateData.image = imagePath;

        await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
        });

        res.redirect("/mysells");
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
});

/* 📌 Delete an item */
router.post("/delete/:id", authenticateUser, async (req, res) => {
    if (req.user.role !== "SELLER") {
        return res.status(403).send("Unauthorized");
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (!product || product.sellerId !== req.user.userId) {
            return res.status(403).send("Unauthorized");
        }

        await prisma.product.delete({ where: { id: parseInt(req.params.id) } });

        res.redirect("/mysells");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
});

/* 📌 Sell a new item */
router.post("/sell", authenticateUser, upload.single("image"), async (req, res) => {
    if (req.user.role !== "SELLER") {
        console.error("Unauthorized access: User is not a seller.");
        return res.status(403).send("Unauthorized");
    }

    try {
        const { name, price, condition, description, category } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!req.user.id) {
            console.error("Error: Seller ID is missing!");
            return res.status(400).send("Error: Seller ID is required.");
        }

        await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                condition,
                description,
                category,
                image: imagePath,
                sellerId: req.user.id,
            }
        });

        console.log("Product added successfully!");
        res.redirect("/marketplace");
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send("Error adding product");
    }
});

/* 📌 Route to serve the sell page */
router.get("/sell", authenticateUser, (req, res) => {
    if (req.user.role !== "SELLER") {
        return res.status(403).send("Access Denied: Only sellers can sell items.");
    }
    res.render("sell", { role: req.user.role });
});

module.exports = router;
