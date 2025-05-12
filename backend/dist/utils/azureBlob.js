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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToAzureBlob = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "profile-pictures"; // Set up a container in Azure for profile pictures
const uploadToAzureBlob = (buffer, filename, mimeType) => __awaiter(void 0, void 0, void 0, function* () {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(String(connectionString));
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create a unique blob name
    const blobName = `${Date.now()}-${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        yield blockBlobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: { blobContentType: mimeType },
        });
        // Return the public URL of the uploaded file
        const blobUrl = blockBlobClient.url;
        return blobUrl;
    }
    catch (error) {
        console.error('Error uploading to Azure Blob Storage:', error);
        throw new Error("Failed to upload image to Azure Blob.");
    }
});
exports.uploadToAzureBlob = uploadToAzureBlob;
