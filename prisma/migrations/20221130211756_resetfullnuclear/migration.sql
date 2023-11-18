-- CreateTable
CREATE TABLE `MovementCategory` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coachID` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MovementCategory_name_coachID_key`(`name`, `coachID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutCategory` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coachID` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WorkoutCategory_name_coachID_key`(`name`, `coachID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingType` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coachID` VARCHAR(191) NOT NULL,
    `atheleteID` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TrainingType_name_key`(`name`),
    UNIQUE INDEX `TrainingType_coachID_key`(`coachID`),
    UNIQUE INDEX `TrainingType_atheleteID_key`(`atheleteID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutType` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coachID` VARCHAR(191) NOT NULL,
    `workoutID` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WorkoutType_name_key`(`name`),
    UNIQUE INDEX `WorkoutType_workoutID_key`(`workoutID`),
    UNIQUE INDEX `WorkoutType_name_coachID_key`(`name`, `coachID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppVersion` (
    `name` VARCHAR(255) NOT NULL,
    `iosVersion` VARCHAR(255) NULL,
    `androidVersion` VARCHAR(255) NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFCoach` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `timeZone` VARCHAR(191) NULL,
    `numberofTrainees` INTEGER NULL,
    `gender` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `costPerMonth` INTEGER NULL,
    `currency` VARCHAR(191) NULL,
    `imageKey` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL,
    `highlights` TEXT NULL,
    `bio` VARCHAR(191) NULL,

    UNIQUE INDEX `CFCoach_email_key`(`email`),
    INDEX `CFCoach_name_email_idx`(`name`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFMovement` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `videoURL` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `equipment` VARCHAR(191) NULL,
    `instructions` TEXT NULL,
    `visibilityAll` BOOLEAN NOT NULL DEFAULT false,
    `imageLink` VARCHAR(191) NULL,
    `audioCues` VARCHAR(191) NULL,
    `coachID` VARCHAR(191) NOT NULL,

    INDEX `CFMovement_name_tags_idx`(`name`, `tags`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFMeasureMovement` (
    `id` VARCHAR(255) NOT NULL,
    `movementName` VARCHAR(191) NOT NULL,
    `reps` INTEGER NOT NULL DEFAULT 0,
    `height` INTEGER NOT NULL DEFAULT 0,
    `heightUnits` ENUM('Inches', 'Feet', 'Centimeters', 'Meters') NOT NULL DEFAULT 'Inches',
    `weight` INTEGER NOT NULL DEFAULT 0,
    `weightUnits` ENUM('Pounds', 'Kilograms', 'poods', 'RepMaxFraction', 'BodyWeight', 'PickLoad') NOT NULL DEFAULT 'Pounds',
    `distance` INTEGER NOT NULL DEFAULT 0,
    `distanceUnits` ENUM('Meters', 'Kilometers', 'Feet', 'Yards', 'Miles', 'Inches') NOT NULL DEFAULT 'Meters',
    `duration` DATETIME(3) NOT NULL DEFAULT '2000-10-10T00:00:00+00:00',
    `calorie` INTEGER NOT NULL DEFAULT 0,
    `isMaxLoad` BOOLEAN NOT NULL DEFAULT false,
    `isMaxReps` BOOLEAN NOT NULL DEFAULT false,
    `movementID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFRoundsWithMeasurements` (
    `id` VARCHAR(255) NOT NULL,
    `orderIdx` INTEGER NOT NULL,
    `measurementID` VARCHAR(191) NOT NULL,
    `roundsID` VARCHAR(191) NOT NULL,

    INDEX `CFRoundsWithMeasurements_orderIdx_idx`(`orderIdx`),
    UNIQUE INDEX `CFRoundsWithMeasurements_orderIdx_measurementID_roundsID_key`(`orderIdx`, `measurementID`, `roundsID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFRound` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT ' ',
    `numRounds` INTEGER NOT NULL DEFAULT 1,
    `roundTime` DATETIME(3) NOT NULL DEFAULT '2000-10-10T00:00:00+00:00',
    `restTime` DATETIME(3) NOT NULL DEFAULT '2000-10-10T00:00:00+00:00',
    `repsVary` BOOLEAN NOT NULL DEFAULT false,
    `loadVary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFWorkoutsWithRounds` (
    `id` VARCHAR(255) NOT NULL,
    `orderIdx` INTEGER NOT NULL,
    `roundID` VARCHAR(191) NOT NULL,
    `workoutID` VARCHAR(191) NOT NULL,

    INDEX `CFWorkoutsWithRounds_orderIdx_idx`(`orderIdx`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFWorkout` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tags` VARCHAR(191) NULL,
    `numRounds` INTEGER NOT NULL DEFAULT 1,
    `runTime` INTEGER NOT NULL DEFAULT 0,
    `restTime` DATETIME(3) NOT NULL DEFAULT '2000-10-10T00:00:00+00:00',
    `visibility` BOOLEAN NOT NULL DEFAULT false,
    `benchMark` BOOLEAN NOT NULL DEFAULT false,
    `expectedCalories` INTEGER NULL DEFAULT 0,
    `coachID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFProgram` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tags` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `visibilityAll` BOOLEAN NOT NULL DEFAULT false,
    `coachID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFProgramsWithWorkouts` (
    `id` VARCHAR(255) NOT NULL,
    `orderIdx` INTEGER NOT NULL,
    `workoutID` VARCHAR(191) NOT NULL,
    `programID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFAthele` (
    `id` VARCHAR(255) NOT NULL,
    `height` VARCHAR(191) NULL,
    `weight` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `dateOfBirth` VARCHAR(191) NULL,
    `lastLoginTime` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `userImageKey` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `goal` VARCHAR(191) NULL,
    `trainedWithCoach` VARCHAR(191) NULL,
    `activityLevel` VARCHAR(191) NULL,
    `specialCircumstances` VARCHAR(191) NULL,
    `profession` VARCHAR(191) NULL,
    `daysPerWeek` INTEGER NULL,
    `fCMToken` VARCHAR(191) NULL,
    `timeZone` VARCHAR(191) NULL,
    `trailDate` DATETIME(3) NULL,
    `paymentStatus` VARCHAR(191) NULL,
    `subscriptionID` VARCHAR(191) NULL,
    `customerID` VARCHAR(191) NULL,
    `nextBillingDate` DATETIME(3) NULL,
    `frequency` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL,
    `coachID` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFAtheleWorkoutTracker` (
    `id` VARCHAR(255) NOT NULL,
    `atheleteID` VARCHAR(191) NOT NULL,
    `workoutAssignedID` VARCHAR(191) NOT NULL,
    `dateAssigned` DATETIME(3) NOT NULL,
    `finished` BOOLEAN NOT NULL,
    `timeToFinish` INTEGER NULL,
    `workoutFinishedID` VARCHAR(191) NULL,
    `dateFinished` DATETIME(3) NULL,
    `scoreTime` DATETIME(3) NULL,
    `scoreLoad` INTEGER NULL,
    `scoreReps` INTEGER NULL,
    `scoreRounds` INTEGER NULL,
    `difficultyLevel` ENUM('EASY', 'MODERATE', 'HEAVY', 'HARD') NULL,
    `feedback` VARCHAR(191) NULL,
    `rating` VARCHAR(191) NULL,

    INDEX `CFAtheleWorkoutTracker_dateAssigned_dateFinished_idx`(`dateAssigned`, `dateFinished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFAtheleProgramTracker` (
    `id` VARCHAR(255) NOT NULL,
    `atheleteID` VARCHAR(191) NOT NULL,
    `programAssignedID` VARCHAR(191) NOT NULL,
    `dateAssigned` DATETIME NOT NULL,
    `endDate` DATETIME NOT NULL,
    `programDuration` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CFAthelePerformanceStats` (
    `id` VARCHAR(255) NOT NULL,
    `atheleteID` VARCHAR(191) NOT NULL,
    `weeklyAdherence` INTEGER NOT NULL DEFAULT 0,
    `monthlyAdherence` INTEGER NOT NULL DEFAULT 0,
    `globalAdherence` INTEGER NOT NULL DEFAULT 0,
    `longestStreak` INTEGER NOT NULL DEFAULT 0,
    `longestStreakStartDate` DATETIME NULL,
    `longestStreakEndDate` DATETIME NULL,
    `currentStreak` INTEGER NOT NULL DEFAULT 0,
    `totalReps` INTEGER NOT NULL DEFAULT 0,
    `totalWorkouts` INTEGER NOT NULL DEFAULT 0,
    `totalDuration` INTEGER NOT NULL DEFAULT 0,
    `totalCalories` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `CFAthelePerformanceStats_atheleteID_key`(`atheleteID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CFMovementToMovementCategory` (
    `A` VARCHAR(255) NOT NULL,
    `B` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `_CFMovementToMovementCategory_AB_unique`(`A`, `B`),
    INDEX `_CFMovementToMovementCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProgReg` (
    `A` VARCHAR(255) NOT NULL,
    `B` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `_ProgReg_AB_unique`(`A`, `B`),
    INDEX `_ProgReg_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CFWorkoutToWorkoutCategory` (
    `A` VARCHAR(255) NOT NULL,
    `B` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `_CFWorkoutToWorkoutCategory_AB_unique`(`A`, `B`),
    INDEX `_CFWorkoutToWorkoutCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MovementCategory` ADD CONSTRAINT `MovementCategory_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutCategory` ADD CONSTRAINT `WorkoutCategory_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingType` ADD CONSTRAINT `TrainingType_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingType` ADD CONSTRAINT `TrainingType_atheleteID_fkey` FOREIGN KEY (`atheleteID`) REFERENCES `CFAthele`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutType` ADD CONSTRAINT `WorkoutType_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutType` ADD CONSTRAINT `WorkoutType_workoutID_fkey` FOREIGN KEY (`workoutID`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFMovement` ADD CONSTRAINT `CFMovement_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CFMeasureMovement` ADD CONSTRAINT `CFMeasureMovement_movementID_fkey` FOREIGN KEY (`movementID`) REFERENCES `CFMovement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFRoundsWithMeasurements` ADD CONSTRAINT `CFRoundsWithMeasurements_measurementID_fkey` FOREIGN KEY (`measurementID`) REFERENCES `CFMeasureMovement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFRoundsWithMeasurements` ADD CONSTRAINT `CFRoundsWithMeasurements_roundsID_fkey` FOREIGN KEY (`roundsID`) REFERENCES `CFRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFWorkoutsWithRounds` ADD CONSTRAINT `CFWorkoutsWithRounds_roundID_fkey` FOREIGN KEY (`roundID`) REFERENCES `CFRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFWorkoutsWithRounds` ADD CONSTRAINT `CFWorkoutsWithRounds_workoutID_fkey` FOREIGN KEY (`workoutID`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFWorkout` ADD CONSTRAINT `CFWorkout_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CFProgram` ADD CONSTRAINT `CFProgram_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CFProgramsWithWorkouts` ADD CONSTRAINT `CFProgramsWithWorkouts_workoutID_fkey` FOREIGN KEY (`workoutID`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFProgramsWithWorkouts` ADD CONSTRAINT `CFProgramsWithWorkouts_programID_fkey` FOREIGN KEY (`programID`) REFERENCES `CFProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAthele` ADD CONSTRAINT `CFAthele_coachID_fkey` FOREIGN KEY (`coachID`) REFERENCES `CFCoach`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleWorkoutTracker` ADD CONSTRAINT `CFAtheleWorkoutTracker_atheleteID_fkey` FOREIGN KEY (`atheleteID`) REFERENCES `CFAthele`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleWorkoutTracker` ADD CONSTRAINT `CFAtheleWorkoutTracker_workoutAssignedID_fkey` FOREIGN KEY (`workoutAssignedID`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleWorkoutTracker` ADD CONSTRAINT `CFAtheleWorkoutTracker_workoutFinishedID_fkey` FOREIGN KEY (`workoutFinishedID`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleProgramTracker` ADD CONSTRAINT `CFAtheleProgramTracker_atheleteID_fkey` FOREIGN KEY (`atheleteID`) REFERENCES `CFAthele`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAtheleProgramTracker` ADD CONSTRAINT `CFAtheleProgramTracker_programAssignedID_fkey` FOREIGN KEY (`programAssignedID`) REFERENCES `CFProgram`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CFAthelePerformanceStats` ADD CONSTRAINT `CFAthelePerformanceStats_atheleteID_fkey` FOREIGN KEY (`atheleteID`) REFERENCES `CFAthele`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CFMovementToMovementCategory` ADD CONSTRAINT `_CFMovementToMovementCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `CFMovement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CFMovementToMovementCategory` ADD CONSTRAINT `_CFMovementToMovementCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `MovementCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProgReg` ADD CONSTRAINT `_ProgReg_A_fkey` FOREIGN KEY (`A`) REFERENCES `CFMovement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProgReg` ADD CONSTRAINT `_ProgReg_B_fkey` FOREIGN KEY (`B`) REFERENCES `CFMovement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CFWorkoutToWorkoutCategory` ADD CONSTRAINT `_CFWorkoutToWorkoutCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `CFWorkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CFWorkoutToWorkoutCategory` ADD CONSTRAINT `_CFWorkoutToWorkoutCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `WorkoutCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
