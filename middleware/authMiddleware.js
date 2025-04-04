const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            console.log("No token found. Redirecting to login.");
            return res.redirect("/login");
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            console.log("Invalid token. Redirecting to login.");
            return res.redirect("/login");
        }

        // Fetch user from DB and attach to req.user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            console.log("User not found in database. Redirecting to login.");
            return res.redirect("/login");
        }

        req.user = user; // ✅ Attach user to request
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.redirect("/login");
    }
};


const authorizeRole = (role) => {
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).send("Access Denied");
      }
      next();
    };
  };
  module.exports = { authenticateUser };