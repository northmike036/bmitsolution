/*
  Warnings:

  - Made the column `agentName` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rent` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `screenshot` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Post" ALTER COLUMN "agentName" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "rent" SET NOT NULL,
ALTER COLUMN "screenshot" SET NOT NULL;
