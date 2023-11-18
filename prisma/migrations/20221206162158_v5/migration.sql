/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `workoutID` on the `WorkoutType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `WorkoutType` DROP FOREIGN KEY `WorkoutType_workoutID_fkey`;

-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `CFWorkout` ADD COLUMN `workoutTypeID` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WorkoutType` DROP COLUMN `workoutID`;

-- AddForeignKey
ALTER TABLE `CFWorkout` ADD CONSTRAINT `CFWorkout_workoutTypeID_fkey` FOREIGN KEY (`workoutTypeID`) REFERENCES `WorkoutType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
