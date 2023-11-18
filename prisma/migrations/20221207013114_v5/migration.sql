/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Made the column `workoutTypeID` on table `CFWorkout` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CFWorkout` DROP FOREIGN KEY `CFWorkout_workoutTypeID_fkey`;

-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `CFWorkout` MODIFY `workoutTypeID` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `CFWorkout` ADD CONSTRAINT `CFWorkout_workoutTypeID_fkey` FOREIGN KEY (`workoutTypeID`) REFERENCES `WorkoutType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
