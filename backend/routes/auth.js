const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserRepository } = require("../repositories");
const auth = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123!@#";

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const role = email.toLowerCase().includes("admin") ? "admin" : "user";

    const user = await UserRepository.create(email, hash, name || "", role);
    const userId = user.id || user._id;

    jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            email: user.email,
            name: user.name || "",
            avatar: user.avatar || "",
            role: user.role,
            createdAt: user.created_at,
          },
        });
      },
    );
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userId = user.id || user._id;

    jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: userId,
            email: user.email,
            name: user.name || "",
            avatar: user.avatar || "",
            role: user.role,
            createdAt: user.created_at,
          },
        });
      },
    );
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user.id || user._id;
    res.json({
      id: userId,
      email: user.email,
      name: user.name || "",
      avatar: user.avatar || "",
      role: user.role,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error("Auth-me check error:", err.message);
    res.status(500).send("Server error");
  }
});

router.put("/profile", auth, async (req, res) => {
  const { name, avatar } = req.body;

  try {
    const updated = await UserRepository.updateProfile(
      req.user.id,
      name,
      avatar,
    );
    if (!updated) {
      return res.status(404).json({ message: "User profile not found" });
    }
    const userId = updated.id || updated._id;
    res.json({
      id: userId,
      email: updated.email,
      name: updated.name || "",
      avatar: updated.avatar || "",
      role: updated.role,
      created_at: updated.created_at,
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
