"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorsTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("langchain/tools");
exports.getDoctorsTool = new tools_1.DynamicStructuredTool({
    name: "get_available_doctors",
    description: "Fetch a list of doctors available based on a specific specialization",
    schema: zod_1.z.object({
        specialization: zod_1.z.string().describe("The medical specialization to filter doctors by"),
    }),
    func: (_a) => __awaiter(void 0, [_a], void 0, function* ({ specialization }) {
        // Simulate API call
        const doctors = [
            { name: "Dr. Strange", specialization: "cardiology" },
            { name: "Dr. Banner", specialization: "psychiatry" },
        ];
        const result = doctors.filter((doc) => doc.specialization.toLowerCase().includes(specialization.toLowerCase()));
        return JSON.stringify(result.length ? result : "No doctors found.");
    }),
});
