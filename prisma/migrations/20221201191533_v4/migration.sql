/*
  Warnings:

  - You are about to alter the column `longestStreakStartDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `longestStreakEndDate` on the `CFAthelePerformanceStats` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `dateAssigned` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endDate` on the `CFAtheleProgramTracker` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `CFAtheleProgramTracker` DROP FOREIGN KEY `CFAtheleProgramTracker_atheleteID_fkey`;

-- DropForeignKey
ALTER TABLE `CFAtheleProgramTracker` DROP FOREIGN KEY `CFAtheleProgramTracker_programAssignedID_fkey`;

-- AlterTable
ALTER TABLE `CFAthelePerformanceStats` MODIFY `longestStreakStartDate` DATETIME NULL,
    MODIFY `longestStreakEndDate` DATETIME NULL;

-- AlterTable
ALTER TABLE `CFAtheleProgramTracker` MODIFY `dateAssigned` DATETIME NOT NULL,
    MODIFY `endDate` DATETIME NOT NULL;

-- AddForeignKey
ALTER TABLE `CFAtheleProgramTracker` ADD CONSTRAINT `CFAtheleProgramTracker_atheleteID_fkey` FOREIGN KEY (`atheleteID`) REFERENCES `CFAthele`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleProgramTracker` ADD CONSTRAINT `CFAtheleProgramTracker_programAssignedID_fkey` FOREIGN KEY (`programAssignedID`) REFERENCES `CFProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
