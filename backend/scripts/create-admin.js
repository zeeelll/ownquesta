// Create an admin user (or promote an existing one).
// Run from backend/:  ADMIN_PASSWORD='<strong password>' node scripts/create-admin.js admin@example.com "Admin Name"
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function createAdmin(email, name) {
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.error('Usage: ADMIN_PASSWORD="<8+ chars>" node scripts/create-admin.js <email> ["Name"]');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = "admin";
      await existing.save();
      console.log(`✅ ${email} already existed and is now an admin`);
    } else {
      await User.create({
        name: name || "Admin",
        email,
        password: await bcrypt.hash(password, 10),
        role: "admin",
        provider: "local",
      });
      console.log(`✅ Admin created: ${email}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(process.argv[2], process.argv[3]);
