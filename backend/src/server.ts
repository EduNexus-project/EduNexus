import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import academicRoutes from "./routes/academicRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import requestRoutes from "./routes/requestRoutes";
import anomalyRoutes from "./routes/anomalyRoutes";
import aiRoutes from "./routes/aiRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { getCampusBlocks, getAnalyticsOverview, getAuditLogs } from "./controllers/campusController";
import {
  getClasses,
  getClassById,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  getTeacherById,
  getTeacherClasses,
  getParents,
  getMarksByStudent,
  updateSubjectMark,
} from "./controllers/academicController";
import { errorHandler } from "./middleware/errorMiddleware";
import { optionalProtect } from "./middleware/authMiddleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Request logging for audit & debugging
app.use((req, _res, next) => {
  if (!req.path.startsWith("/api/health")) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "EduNexus Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Primary REST APIs
app.use("/api/auth", authRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/attendance/corrections", requestRoutes); // alias
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// Direct aliases matching REST requirements
// Classes
app.get("/api/classes", optionalProtect, getClasses);
app.get("/api/classes/:id", optionalProtect, getClassById);

// Students
app.get("/api/students", optionalProtect, getStudents);
app.get("/api/students/:id", optionalProtect, getStudentById);
app.post("/api/students", optionalProtect, createStudent);
app.put("/api/students/:id", optionalProtect, updateStudent);
app.delete("/api/students/:id", optionalProtect, deleteStudent);

// Teachers
app.get("/api/teachers", optionalProtect, getTeachers);
app.get("/api/teachers/:id", optionalProtect, getTeacherById);
app.get("/api/teachers/:id/classes", optionalProtect, getTeacherClasses);

// Parents
app.get("/api/parents", optionalProtect, getParents);

// Marks
app.get("/api/marks/:studentId", optionalProtect, getMarksByStudent);
app.put("/api/marks/:studentId", optionalProtect, updateSubjectMark);

// Campus 3D & Analytics
app.get("/api/campus/blocks", optionalProtect, getCampusBlocks);
app.get("/api/analytics/overview", optionalProtect, getAnalyticsOverview);
app.get("/api/audit", optionalProtect, getAuditLogs);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EduNexus Academic ERP Backend running on http://localhost:${PORT}`);
});

export default app;
