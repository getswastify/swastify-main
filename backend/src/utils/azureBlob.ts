import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "profile-pictures"; // Set up a container in Azure for profile pictures

export const uploadToAzureBlob = async (buffer: Buffer, filename: string, mimeType: string): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(String(connectionString));
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique blob name
  const blobName = `${Date.now()}-${filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    // Return the public URL of the uploaded file
    const blobUrl = blockBlobClient.url;
    return blobUrl;
  } catch (error) {
    console.error('Error uploading to Azure Blob Storage:', error);
    throw new Error("Failed to upload image to Azure Blob.");
  }
};
