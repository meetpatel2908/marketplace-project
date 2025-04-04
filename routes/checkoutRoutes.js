const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateUser } = require("../middleware/authMiddleware");

// 🚀 Shipment Form Route
router.get("/shipment", authenticateUser, (req, res) => {
    res.render("shipment", { user: req.user }); // ✅ Pass user data
});


// 🚀 Payment Selection Route
router.post('/checkout/payment', async (req, res) => {
    const { userId, address, city, pincode, landmark, phone } = req.body;

    if (!userId) {
        return res.status(400).send("User ID is required.");
    }

    try {
        // Check if shipment already exists for the user
        const existingShipment = await prisma.shipment.findUnique({
            where: { userId: parseInt(userId) }
        });

        let shipment;
        if (existingShipment) {
            // Update existing shipment
            shipment = await prisma.shipment.update({
                where: { userId: parseInt(userId) },
                data: { address, city, pincode, landmark, phone }
            });
        } else {
            // Create new shipment
            shipment = await prisma.shipment.create({
                data: {
                    userId: parseInt(userId),
                    address,
                    city,
                    pincode,
                    landmark,
                    phone
                }
            });
        }

        console.log("Shipment Saved:", shipment);
        res.redirect('/checkout/payment-method'); // ✅ Redirect to the payment selection page

    } catch (error) {
        console.error("Error saving shipment:", error);
        res.status(500).send("Error processing shipment.");
    }
});

// 🚀 Payment Selection Page
router.get("/checkout/payment-method", authenticateUser, (req, res) => {
    res.render("payment"); // ✅ Matches your actual file name
});

router.get("/checkout/payment/:method", authenticateUser, (req, res) => {
    const { method } = req.params;
    res.render("payment-method", { method });
});


// 🚀 Order Completion Route
router.post("/complete", authenticateUser, async (req, res) => {
    const order = {
        userId: req.user.id, // ✅ Use req.user.id from `authenticateUser`
        shipment: req.body.shipmentDetails, // Get shipment from frontend
        paymentDetails: req.body, // Store payment details
        status: "Pending",
    };

    try {
        await prisma.order.create({ data: order });
        res.redirect("/order-confirmation");
    } catch (err) {
        res.status(500).send("Error processing order");
    }
});

module.exports = router;
