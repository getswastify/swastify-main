"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./routes/auth.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS setup
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true // if you're using cookies or auth headers
}));
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({
        message: "Running"
    });
});
app.use("/auth", auth_routes_1.authRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
