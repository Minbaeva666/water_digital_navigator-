import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import registerRoutes from "./routes/registration.routes";
import authRoutes from "./routes/auth.routes";
import inputRoutes from "./routes/input.routes";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes";
import {errorHandler} from "./middlewares/errorHandler";
import digitalSolutionsRoutes from "./routes/digitalSolutions.routes";
import usersRoutes from "./routes/users.routes";
import organizationsRoutes from "./routes/organizations.routes";
import taxonomyNodesRoutes from "./routes/taxonomyNodes.routes";
import appOptionsRoutes from "./routes/appOptions.routes";
import publicPdfRoutes from "./routes/publicPdf.routes";
import { PDF_DIR } from './config/pdf-dir';

console.log(process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
    });
});

app.use("/api/users", usersRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/input", inputRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/digital-solutions", digitalSolutionsRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/taxonomyNodes", taxonomyNodesRoutes);
app.use("/api/app-options", appOptionsRoutes);
app.use("/api/public-pdf", publicPdfRoutes);
app.use("/api/pdf",
    (req, res, next) => { next(); },
    express.static(PDF_DIR, { index: false, fallthrough: false })
);


app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
