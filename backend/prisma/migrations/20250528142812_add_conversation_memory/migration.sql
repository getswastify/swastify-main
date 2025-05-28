/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Conversation";

-- CreateTable
CREATE TABLE "ConversationMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryData" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMemory_pkey" PRIMARY KEY ("id")
);
