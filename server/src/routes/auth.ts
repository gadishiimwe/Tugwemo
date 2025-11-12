import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Ad from "../models/Ad";
import { authenticateToken } from "../middlewares/auth";

const router = express.Router();

// ==============================
// 🔐 ADMIN LOGIN
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Only allow super_admin or moderator to log in here
    const admin = await User.findOne({
      email,
      role: { $in: ["super_admin", "moderator"] },
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      role: admin.role,
      email: admin.email,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 👤 USER REGISTRATION
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({
      name,
      email,
      password, // hashed by model pre-save hook
      role: "user",
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 🔑 USER LOGIN
// ==============================
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "user" });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({ message: "User login successful", token });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 👤 PROFILE (PROTECTED)
// ==============================
router.get("/profile", authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 📢 PUBLIC ADS ENDPOINTS
// ==============================
router.get("/ads", async (req, res) => {
  try {
    const now = new Date();
    const ads = await Ad.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
        { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
      ],
    }).sort({ createdAt: -1 });

    // Count impressions
    for (const ad of ads) {
      ad.impressions += 1;
      await ad.save();
    }

    res.json({ ads });
  } catch (error) {
    console.error("Get ads error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/ads/:adId/click", async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    ad.clicks += 1;
    await ad.save();
    res.json({ message: "Click tracked" });
  } catch (error) {
    console.error("Track ad click error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
