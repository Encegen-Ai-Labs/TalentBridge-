const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const studentRoutes = require("./routes/student.routes");
app.use("/api/student", studentRoutes);

const companyRoutes = require("./routes/company.routes");
app.use("/api/company", companyRoutes);

const jobRoutes = require("./routes/job.routes");
app.use("/api/jobs", jobRoutes);

const applicationRoutes = require("./routes/application.routes");
app.use("/api/applications", applicationRoutes);

const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
// Warn if JWT secret is not configured
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Login will fail until a JWT secret is configured.');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});