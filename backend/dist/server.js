"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = require("./routes/auth.routes");
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const profile_route_1 = require("./routes/profile.route");
const dashboard_route_1 = require("./routes/dashboard.route");
const availability_route_1 = require("./routes/availability.route");
// import { appointmentRoutes } from './routes/appointment.route';
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
// CORS setup
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://app.swastify.life'],
    credentials: true
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({
        message: "Running",
        IP: req.ip
    });
});
app.use("/auth", auth_routes_1.authRoutes);
app.use("/profile", profile_route_1.profileRoutes);
app.use("/dashboard", dashboard_route_1.dashboardRoutes);
// app.use("/patient", appointmentRoutes);
app.use("/availability", availability_route_1.availabilityRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
