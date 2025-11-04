import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

import { connectDB } from "./config/database";
import { seedSuperAdmin } from "./utils/seedSuperAdmin";

// Route files
import authRoutes from "./routes/auth";
import artworkRoutes from "./routes/artworks";
import contactRoutes from "./routes/contact";
import categoryRoutes from "./routes/categories";
import adminRoutes from "./routes/admin";
// import artistRoutes from './routes/artist';

// Load env vars
dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
// OR, if using credentials (cookies, auth headers):
// app.use(cors({ origin: true, credentials: true }));

// Serve static files from /public/artworks
app.use("/artworks", express.static(path.join(__dirname, "public/artworks")));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
// app.use('/api/artist', artistRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();

    // Seed super admin
    await seedSuperAdmin();

    const server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: any, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
