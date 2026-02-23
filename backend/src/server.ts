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
import expertVideoRoutes from "./routes/expertVideo.routes";
import path from "path";
import contactRoutes from "./routes/contact.routes";
import helpdeskRoutes from "./routes/helpdesk.routes";
import { securityHeadersMiddleware } from "./middlewares/securityHeaders";
import logger from "./config/loggerConfig";

const app = express();
const PORT = process.env.PORT || 3001;

const buildAllowedOrigins = () => {
    const allowed = [process.env.CLIENT_ORIGIN].filter(Boolean) as string[];
    if (process.env.NODE_ENV !== 'production') {
        allowed.push('http://localhost:5173', 'http://localhost:3001');
    }
    return allowed;
};

const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true;
    return buildAllowedOrigins().includes(origin);
};

// Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && !isAllowedOrigin(origin)) {
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('[CORS BLOCKED]', { origin, path: req.originalUrl, method: req.method });
        }
        res.status(403).json({ error: 'CORS not allowed' });
        return;
    }
    next();
});

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(securityHeadersMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/expert-videos", expertVideoRoutes);
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/api/contact", contactRoutes);
app.use("/api/helpdesk", helpdeskRoutes);



app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);
});
