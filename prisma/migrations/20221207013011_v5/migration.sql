/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `tags` on the `CFWorkout` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `WorkoutType_name_key` ON `WorkoutType`;

-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `CFWorkout` DROP COLUMN `tags`;
