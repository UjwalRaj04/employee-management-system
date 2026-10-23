const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")
const User = require("../models/User");

const registerUser = async (req, res) => {
  return res.status(403).json({
    message:
      "Public user registration is disabled. Register an organisation or request an invitation from your organisation administrator.",
  });
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.role !== "platformAdmin" && !user.organisationId) {
      return res.status(403).json({
        message: "Your account is not associated with an organisation",
      });
    }

    // Create JWT token
    const organisationId = user.organisationId
      ? user.organisationId.toString()
      : null;

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organisationId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organisationId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getProfile=(req,res)=>{
  res.status(200).json({
    message:"You are authenticated successfully",
    user:{
      id:req.user.id,
      name:req.user.name,
      email:req.user.email,
      role:req.user.role,
      organisationId: req.user.organisationId,
    },
  });
};
module.exports = {
  registerUser,loginUser,getProfile,
};