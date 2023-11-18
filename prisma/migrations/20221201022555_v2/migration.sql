/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `height` on the `CFMeasureMovement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `distance` on the `CFMeasureMovement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `calorie` on the `CFMeasureMovement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `CFMeasureMovement` MODIFY `height` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `distance` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `calorie` DOUBLE NOT NULL DEFAULT 0;
