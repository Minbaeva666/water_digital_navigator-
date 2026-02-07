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


console.log(process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_ORIGIN,
            'http://localhost:5173',
            'http://localhost:3000',
            'http://192.168.84.86',
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
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
app.use("/api/expert-videos", expertVideoRoutes);
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/api/contact", contactRoutes);
app.use("/api/helpdesk", helpdeskRoutes);



app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
