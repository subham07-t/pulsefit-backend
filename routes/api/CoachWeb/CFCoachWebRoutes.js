const express = require("express");
const router = express.Router();
const CreateCoachWebCtrl = require("../../../controllers/CoachWeb/Create/createCoachWeb");
const UpdateCoachWebCtrl = require("../../../controllers/CoachWeb/Update/updateCoachWeb");
const ReadCoachWebCtrl = require("../../../controllers/CoachWeb/Read/readCoachWeb");
const DeleteCoachWebCtrl = require("../../../controllers/CoachWeb/Delete/deleteCoachWeb");
const programCtrl = require("../../../controllers/CoachWeb/CFProgramCtrl");
const workoutCtrl = require("../../../controllers/CoachWeb/CFWorkoutCtrl");
const {
  QueryResutls,
} = require("../../../controllers/middleware/sendPrismaQuery");

//WORKOUT TABLE ROUTES
router
  .route("/CoachWeb/workout/addNewWorkout")
  .post([workoutCtrl.addNewWorkoutNameCoach, QueryResutls]);
router
  .route("/CoachWeb/workout/getAllWorkoutsByCoachID")
  .get([workoutCtrl.getAllWorkoutsByCoachID, QueryResutls]);
router
  .route("/CoachWeb/workout/getWorkoutByCoachIDWorkoutID")
  .get([workoutCtrl.getWorkoutByCoachIDWorkoutID, QueryResutls]);
router
  .route("/CoachWeb/workout/searchWorkoutByName")
  .get([workoutCtrl.searchWorkoutByName, QueryResutls]);
router
  .route("/CoachWeb/workout/setWorkoutToPrograms")
  .post([workoutCtrl.setWorkoutToPrograms, QueryResutls]);
router
  .route("/CoachWeb/workout/getAllWorkouts")
  .get([workoutCtrl.getAllWorkouts, QueryResutls]);
router
  .route("/CoachWeb/workout/deleteAllWorkouts")
  .post([workoutCtrl.deleteAllWorkouts, QueryResutls]);
router
  .route("/CoachWeb/workout/deleteOneWorkout")
  .post([workoutCtrl.deleteOneWorkout, QueryResutls]);

router
  .route("/CoachWeb/program/addNewProgram")
  .post([programCtrl.addNewProgram, QueryResutls]);
router
  .route("/CoachWeb/program/pushExistingProgram")
  .post([programCtrl.pushExistingProgram, QueryResutls]);
router
  .route("/CoachWeb/program/getAllPrograms")
  .get([programCtrl.getAllPrograms, QueryResutls]);
router
  .route("/CoachWeb/program/getAllProgramsByCoachID")
  .get([programCtrl.getAllProgramsByCoachID, QueryResutls]);
router
  .route("/CoachWeb/program/getProgramByCoachIDProgramID")
  .get([programCtrl.getProgramByCoachIDProgramID, QueryResutls]);
router
  .route("/CoachWeb/program/searchProgramByName")
  .get([programCtrl.searchProgramByName, QueryResutls]);
router
  .route("/CoachWeb/program/addWorkoutsToProgram")
  .post([programCtrl.addWorkoutsToProgram, QueryResutls]);
router
  .route("/CoachWeb/program/getProgramWorkoutsbyCoachIDProgramID")
  .get([programCtrl.getProgramWorkoutsbyCoachIDProgramID, QueryResutls]);

//ALL CREATE FOLDER CONTROLLER ROUTES
router
  .route("/CoachWeb/Create/addNewCoach")
  .post([CreateCoachWebCtrl.addNewCoach, QueryResutls]);
router
  .route("/coachWeb/Create/AddWorkoutWithAllDetails")
  .post(CreateCoachWebCtrl.addWorkoutWithAllDetails);
router
  .route("/coachWeb/Create/addMovement")
  .post([CreateCoachWebCtrl.addMovement, QueryResutls]);
router
  .route("/coachWeb/Create/addBatchTagsCategoriesRavi")
  .post(CreateCoachWebCtrl.addBatchTagsCategoriesRavi);
router
  .route("/CoachWeb/Create/addNewAthelete")
  .post([CreateCoachWebCtrl.addNewAthelete, QueryResutls]);
router
  .route("/CoachWeb/Create/createManyMovements")
  .post([CreateCoachWebCtrl.createManyMovements, QueryResutls]);
router
  .route("/CoachWeb/Create/createManyMeasurements")
  .post([CreateCoachWebCtrl.createManyMeasurements, QueryResutls]);
router
  .route("/coachWeb/Create/createWorkoutWithUser")
  .post([CreateCoachWebCtrl.createWorkoutWithUser, QueryResutls]);
router
  .route("/CoachWeb/Create/createNewRoundwithMeasurementsWokrout")
  .post([
    CreateCoachWebCtrl.createNewRoundwithMeasurementsWokrout,
    QueryResutls,
  ]);
router
  .route("/CoachWeb/Create/pushExistingProgram")
  .post([CreateCoachWebCtrl.pushExistingProgram, QueryResutls]);

// ALL UPDATE FOLDER CONTROLLER ROUTES
router
  .route("/CoachWeb/Update/NumberOfTrainees")
  .post([UpdateCoachWebCtrl.updateNumberofTrainees, QueryResutls]);
router
  .route("/CoachWeb/Update/AnyDetails")
  .post([UpdateCoachWebCtrl.updateCoachDetails, QueryResutls]);
router
  .route("/CoachWeb/Update/UpdateWorkoutWithAllDetails")
  .post([UpdateCoachWebCtrl.updateWorkoutWithAllDetails]);

// ALL READING/GET DATA FOLDER CONTROLLER ROUTES. SHOULD BE ALL GET CALLS
router
  .route("/CoachWeb/Get/TrainerProfiles")
  .get(ReadCoachWebCtrl.getTrainerProfiles);
router
  .route("/CoachWeb/Get/getWorkoutWithAllDetails")
  .post([ReadCoachWebCtrl.getWorkoutWithAllDetails]);
router
  .route("/CoachWeb/Get/getAllCoaches")
  .get([ReadCoachWebCtrl.getAllCoaches, QueryResutls]);
router
  .route("/CoachWeb/Get/oneCoachProfile")
  .get([ReadCoachWebCtrl.oneCoachProfile, QueryResutls]);
router
  .route("/CoachWeb/Get/AtheleteInfo")
  .get([ReadCoachWebCtrl.getAtheleteInfo, QueryResutls]);
router
  .route("/CoachWeb/Get/getAheleteProfileImage")
  .get(ReadCoachWebCtrl.getAtheleteProfileImage);
router
  .route("/CoachWeb/Get/getAtheleteDetailsPage")
  .get(ReadCoachWebCtrl.getAtheleteDetailsPage);
router.route("/CoachWeb/Get/AuthCoach").get(ReadCoachWebCtrl.authTrainer);
router
  .route("/CoachWeb/Get/getAllWorkoutCategories")
  .get([ReadCoachWebCtrl.getAllWorkoutCategories, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllWorkoutTypes")
  .get([ReadCoachWebCtrl.getAllWorkoutTypes, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllMovementCategories")
  .get([ReadCoachWebCtrl.getAllMovementCategories, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllMovements")
  .post([ReadCoachWebCtrl.getAllMovements, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllCategories")
  .get([ReadCoachWebCtrl.getAllCategories, QueryResutls]);
router
  .route("/CoachWeb/Get/getWorkoutsOneCoach")
  .post([ReadCoachWebCtrl.getWorkoutsOneCoach, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllAtheletes")
  .get([ReadCoachWebCtrl.getAllAtheletes, QueryResutls]);
router
  .route("/CoachWeb/Get/getAllAtheletesOneCoach")
  .post([ReadCoachWebCtrl.getAllAtheletesOneCoach, QueryResutls]);
router
  .route("/CoachWeb/Get/findByNameMovement")
  .get([ReadCoachWebCtrl.findByNameMovement, QueryResutls]);

//ALL DELETE CONTROLLER ROUTES
router
  .route("/CoachWeb/Delete/deleteOneCoach")
  .post([DeleteCoachWebCtrl.deleteOneCoach, QueryResutls]);
router
  .route("/CoachWeb/Delete/DELETEAllCoaches")
  .post([DeleteCoachWebCtrl.deleteAllCoaches, QueryResutls]);
router
  .route("/CoachWeb/Delete/deleteOneMovement")
  .post([DeleteCoachWebCtrl.deleteOneMovement, QueryResutls]);
router
  .route("/CoachWeb/Delete/deleteWorkoutWithAllDetails")
  .post([DeleteCoachWebCtrl.deleteWorkoutWithAllDetails]);
router
  .route("/CoachWeb/Delete/deleteAllMovements")
  .post([DeleteCoachWebCtrl.deleteAllMovements, QueryResutls]);

module.exports = router;
