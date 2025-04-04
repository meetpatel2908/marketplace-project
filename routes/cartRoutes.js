
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateUser } = require("../middleware/authMiddleware");

// Middleware to protect cart routes
router.use(authenticateUser);

// Add item to cart
router.post("/add", authenticateUser, async (req, res) => {
    try {
        let { productId, quantity } = req.body;
        const userId = req.user.id;

        // Convert productId and quantity to integers
        productId = parseInt(productId, 10);
        quantity = parseInt(quantity, 10);

        if (isNaN(productId) || isNaN(quantity)) {
            return res.status(400).json({ error: "Invalid productId or quantity" });
        }

        console.log("Received request to add to cart:", { userId, productId, quantity });

        // Check if the product already exists in the user's cart
        const existingCartItem = await prisma.cart.findFirst({
            where: { userId, productId }
        });

        if (existingCartItem) {
            // ✅ Update the existing quantity instead of creating a new row
            await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity }
            });

        } else {
            // ❇ If item is not in cart, create a new entry
            await prisma.cart.create({
                data: { userId, productId, quantity }
            });
        }

        console.log("Item added to cart!");
        res.redirect("/cart"); // ✅ Redirect to the cart page
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});



  
// ✅ Allow everyone to view cart data (for sidebar)
router.get("/data", async (req, res) => {
    try {
        const userId = req.user.id;
    
        const cart = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }, // ✅ Include product details
        });
    
        // 🔥 Remove items where product is null (orphaned cart items)
        const validCart = cart.filter(item => item.product !== null);
    
        res.json(validCart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Failed to fetch cart", details: error.message });
    }
    
});
  
// Remove item from cart
router.delete("/remove/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid cart item ID" });
    }

    const deletedItem = await prisma.cart.deleteMany({
      where: { id, userId },
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    console.log("Removed item from cart:", deletedItem);
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Failed to remove item", details: error.message });
  }
});

// Get user cart
router.get("/", authenticateUser ,  async (req, res) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;  // ✅ Get user role
      const cart = await prisma.cart.findMany({
        where: { userId },
        include: { product: true },
      });
  
      console.log("Cart fetched for user:", userId, "Role:", role);
      res.render("cart", { cart, role });  // ✅ Pass role to EJS
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart", details: error.message });
    }
  });
  

// Update quantity
router.put("/update/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);
    const userId = req.user.id;

    if (isNaN(id) || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: "Invalid cart item ID or quantity" });
    }

    const updatedCart = await prisma.cart.updateMany({
      where: { id, userId },
      data: { quantity },
    });

    if (updatedCart.count === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    console.log("Updated cart quantity:", updatedCart);
    res.json(updatedCart);
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ error: "Failed to update quantity", details: error.message });
  }
});

// ✅ Remove item from cart (redirect to cart instead of JSON response)
router.post("/remove/:id", authenticateUser, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = req.user.id;

        if (isNaN(id)) {
            return res.status(400).send("Invalid cart item ID");
        }

        const deletedItem = await prisma.cart.deleteMany({
            where: { id, userId },
        });

        if (deletedItem.count === 0) {
            return res.status(404).send("Item not found in cart");
        }

        console.log("Removed item from cart:", deletedItem);
        res.redirect("/cart"); // ✅ Redirects back to cart
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).send("Failed to remove item");
    }
});

// ✅ Update quantity (redirect to cart instead of JSON response)
router.post("/update/:id", authenticateUser, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const quantity = parseInt(req.body.quantity);
        const userId = req.user.id;

        if (isNaN(id) || isNaN(quantity) || quantity < 1) {
            return res.status(400).send("Invalid cart item ID or quantity");
        }

        const updatedCart = await prisma.cart.updateMany({
            where: { id, userId },
            data: { quantity },
        });

        if (updatedCart.count === 0) {
            return res.status(404).send("Cart item not found");
        }

        console.log("Updated cart quantity:", updatedCart);
        res.redirect("/cart"); // ✅ Redirects back to cart
    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).send("Failed to update quantity");
    }
});

router.get("/count", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        res.json({ cartCount, cartItems });
    } catch (error) {
        console.error("Error fetching cart count:", error);
        res.status(500).json({ error: "Failed to fetch cart count" });
    }
});



module.exports = router;
