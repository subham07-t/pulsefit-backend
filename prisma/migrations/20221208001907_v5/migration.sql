/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `workoutTypeID` on the `CFWorkout` table. All the data in the column will be lost.
  - You are about to drop the `WorkoutType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CFWorkout` DROP FOREIGN KEY `CFWorkout_workoutTypeID_fkey`;

-- DropForeignKey
ALTER TABLE `WorkoutType` DROP FOREIGN KEY `WorkoutType_coachID_fkey`;

-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `CFWorkout` DROP COLUMN `workoutTypeID`,
    ADD COLUMN `workoutType` ENUM('ARMAP', 'EMOM', 'RFT', 'LOAD', 'QUALITY', 'NOSCORE') NOT NULL DEFAULT 'NOSCORE';

-- DropTable
DROP TABLE `WorkoutType`;
