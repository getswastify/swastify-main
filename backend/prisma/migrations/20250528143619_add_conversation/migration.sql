/*
  Warnings:

  - You are about to drop the `ConversationMemory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ConversationMemory";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userId_key" ON "Conversation"("userId");
