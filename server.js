// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcryptjs");

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.log(err));

// // User Model
// const UserSchema = new mongoose.Schema({
//     name: String,
//     phone: String,
//     email: { type: String, unique: true, required: true },
//     password: { type: String, required: true },
//   });
  
//   const User = mongoose.model("User", UserSchema);
  
// // Signup Route
// app.post("/Signup", async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "User already exists" });

//     // Hash password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, phone, email, password: hashedPassword });
//     await newUser.save();
    
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Login API
// app.post("/Login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate inputs
//     if (!email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid email or password" });

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

//     res.status(200).json({ message: "Login successful" });

//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Reset Password Route
// app.post("/Reset", async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: "Password reset successful" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// User Model
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Signup Route
app.post("/Signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, phone, email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login API
app.post("/Login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reset Password Route
app.post("/Reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Logout API
app.post("/Logout", (req, res) => {
  // Clear the cookie
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logout successful" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
