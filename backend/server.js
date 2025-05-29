import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from 'url';
import emailRoutes from "./routes/email.route.js";
import { sendWelcomeEmail, verifyEmailConfig } from "./lib/nodeMailer.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: "500mb"}));

//routes

app.use("/api", emailRoutes)

app.listen(PORT, async () => {
    console.log(`Server running on port: ${PORT}`);
})

