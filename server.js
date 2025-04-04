// server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const sellerRoutes = require("./routes/sellerRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const cartRoutes = require("./routes/cartRoutes");
const profileRoutes = require("./routes/profileRoutes"); 
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); 
const contactRoutes = require("./routes/contactRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");


const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/cart", cartRoutes);
app.use("/profile", profileRoutes);
app.use("/", authRoutes);
app.use(adminRoutes);
app.use("/", contactRoutes);
app.use("/", checkoutRoutes);

app.use("/", sellerRoutes);
app.use("/", marketplaceRoutes);
// Set to `true` if using HTTPS

app.get("/", (req, res) => {
    res.render("register");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Prisma schema update (Add role field)
// Run "npx prisma migrate dev --name add-role"
/*
model User {
    id       Int    @id @default(autoincrement())
    name     String
    email    String @unique
    password String
    role     String @default("user") // Can be 'admin', 'seller', or 'user'
}
*/
