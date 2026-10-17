
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Student = require("./models/Student");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// Home API
app.get("/", (req, res) => {
  res.send("Student Management System API is running!");
});

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Please log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "Login configuration is missing on the server.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      secret,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

// AUTHENTICATION MIDDLEWARE
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to access student records.",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Server authentication is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

// Protect every student API below this line
app.use("/api/students", verifyToken);

// GET ALL STUDENTS
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    console.error("Fetch students error:", error.message);
    return res.status(500).json({
      message: "Could not fetch student records.",
    });
  }
});

// ADD STUDENT
app.post("/api/students", async (req, res) => {
  try {
    const { name, rollNumber, email, course } = req.body;

    if (
      !name?.trim() ||
      !rollNumber?.trim() ||
      !email?.trim() ||
      !course?.trim()
    ) {
      return res.status(400).json({
        message: "Name, roll number, email and course are required.",
      });
    }

    const student = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim(),
      course: course.trim(),
    });

    return res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This roll number is already in use.",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
});

// UPDATE STUDENT
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, rollNumber, email, course } = req.body;

    if (
      !name?.trim() ||
      !rollNumber?.trim() ||
      !email?.trim() ||
      !course?.trim()
    ) {
      return res.status(400).json({
        message: "All student fields are required.",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        email: email.trim(),
        course: course.trim(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This roll number is already in use.",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE STUDENT
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.json({
      message: "Student deleted successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid student ID.",
    });
  }
});

// START SERVER
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in the .env file.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();
