const User = require("../models/User");

// GET or CREATE user
const loginUser = async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }

  if (username.trim().length < 2 || username.trim().length > 30) {
    return res
      .status(400)
      .json({ error: "Username must be 2-30 characters" });
  }

  try {
    // Try to find existing user
    let user = await User.findOne({ username: username.trim() });

    // If not found, create new user
    if (!user) {
      user = await User.create({
        username: username.trim(),
      });
      console.log(`✓ New user created: ${user.username}`);
    } else {
      console.log(`✓ User logged in: ${user.username}`);
    }

    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate username - race condition
      console.log("Race condition: Username already taken");
      const existingUser = await User.findOne({
        username: username.trim(),
      });
      return res.json(existingUser);
    }
    console.error("Error logging in user:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};

module.exports = { loginUser };
