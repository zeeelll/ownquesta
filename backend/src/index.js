require('dotenv').config();  // ← add this as line 1

// Server start
const app = require("./app");
const connectDB = require("./config/database");
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
