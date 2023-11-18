const {WorkoutCategory, prismaClient } = require("../../../models/prismaClient");

//ENDPOINT: api/CF/CoachWeb/Delete/deleteOneCoach
const deleteOneCoach = async (req, res, next) => {

    let deleteQuery = prismaClient.cFCoach.delete({
        where:{
            id: req.body.coachID
        }
    });
    req.body.query = deleteQuery;
    req.body.returnMessage = "Deleted succesfully";
    req.body.failedMessage = "Failed to delete!";
    next();
}


//ENDPOINT: api/CF/CoachWeb/Delete/DELETEAllCoaches
const deleteAllCoaches = async (req, res, next) => {

    let deleteQuery = prismaClient.cFCoach.deleteMany({});
    req.body.query = deleteQuery;
    req.body.returnMessage = "Deleted succesfully";
    req.body.failedMessage = "Failed to delete!";
    next();
}

//ENDPOINT: api/CF/CoachWeb/Delete/deleteOneMovement
const deleteOneMovement = async (req, res, next) => {

    let deleteMovementQuery = prismaClient.cFMovement.deleteMany({
        where:{
            id: req.body.movementID
        }
    });

    req.body.query = deleteMovementQuery;
    req.body.returnMessage = "Deleted succesfully";
    req.body.failedMessage = "Failed to delete!";
    next();
}

//ENDPOINT: api/CF/CoachWeb/Delete/deleteWorkoutWithAllDetails
const deleteWorkoutWithAllDetails = async (req, res, next) => {


    let workoutResult
    try {
    workoutResult = await prismaClient.cFWorkout.findMany(
        {
            where:{
                id: req.body.workoutID
            },

            include:{
                workoutCategory:true,
                rounds:{ // Get all the roundsWithWorkout, order by orderIDX, include round
                    orderBy:{
                        orderIdx:'asc'
                    },
                    include:{
                        round: { //Get the round in each of rounds include measurements
                            include:{
                                measurements:{ // Get all the measurements, order by orderIdx, include measurement
                                    orderBy:{
                                        orderIdx: 'asc'
                                    },
                                    include:{ //Get the measurement that has reps/cals/other properties
                                         measurement: true
                                    }

                                }
                            }
                        }
                    }
                }
            }

        }
    );
    } catch (err) {
        console.log(err)
       return res.status(400).json({
            error: err.stack,
            result: "Failed to find Workout with given ID!"
        });


    }

    let allRounds = workoutResult[0].rounds;


    let allRoundIDs = []
    let allMeasurementIDs = []
    allRounds.map((roundData) => {

        allRoundIDs.push(roundData.roundID)
        let round = roundData.round

        let measurements = round.measurements
        measurements.map((measurement) => {
            allMeasurementIDs.push(measurement.measurementID)
        })

    });
    // res.status(200).json({
    //     result: {"rounds": allRoundIDs, "measurements": allMeasurementIDs},
    //     message: "Sucess"
    // });
    try {
        await prismaClient.cFMeasureMovement.deleteMany({
            where:{
                id:{in : allMeasurementIDs}
            }
        })
    }
    catch (err) {

        return res.status(400).json({
             error:err.stack,
             result: "Failed to delete measurements!"
            });

        }

        //Delete all of the existing rounds
        try {
            await prismaClient.cFRound.deleteMany({
                where:{
                    id:{in : allRoundIDs}
                }
            })
        }
        catch (err) {

            return res.status(400).json({
                 error:err.stack,
                 result: "Failed to delete rounds!"
                });

            }


            let deleteWorkoutResult;

            try {
               deleteWorkoutResult = await prismaClient.cFWorkout.delete({
                    where:{
                        id: req.body.workoutID
                    }
                })
            }
            catch (err) {

                 return res.status(400).json({
                     error:err.stack,
                     result: "Failed to delete workout!"
                    });

                }
    res.status(200).json({
        result: deleteWorkoutResult,
        message: "Sucessfully deleted"
    });


}
//ENDPOINT: api/CF/CoachWeb/Delete/deleteAllMovements
const deleteAllMovements = async (req, res, next) => {

    let deleteQuery = prismaClient.cFMovement.deleteMany({

    })

    req.body.query = deleteQuery;
    req.body.returnMessage = "Deleted succesfully";
    req.body.failedMessage = "Failed to delete!";
    next();
}


module.exports = {
    deleteOneCoach,
    deleteAllCoaches,
    deleteOneMovement,
    deleteWorkoutWithAllDetails,
    deleteAllMovements
}