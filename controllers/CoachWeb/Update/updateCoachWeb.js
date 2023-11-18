
const {WorkoutCategory, prismaClient } = require("../../../models/prismaClient");


//  ENDPOINT:  api/CF/CoachWeb/Update/NumberOfTrainees
const updateNumberofTrainees = async (req, res, next) => {

    let updateQuery = prismaClient.cFCoach.update({
    where: { id: req.body.coachID },
    data: { numberofTrainees: { increment: 1 } }
})

req.body.query = updateQuery;
req.body.returnMessage = "Updated the number of Atheletes";
req.body.failedMessage = "Failed to update the number of athelete "
next();

}

// ENDPOINT: api/CF/CoachWeb/Update/AnyDetails
const updateCoachDetails = async (req, res, next) => {
    // the values in details should match the name of colums in CFCoach
    let {coachID, ...details} = req.body;
    let updateQuery = prismaClient.cFCoach.update({
        where:{id: req.body.coachID},
        data: {
                details
        }
    });

    req.body.query = updateQuery;
    req.body.returnMessage = "Updated the coach details";
    req.body.failedMessage = "Failed to update the coach details "
    next();

}

//ENDPOINT: api/CF/coachWeb/Update/updateWorkoutWithAllDetails
const updateWorkoutWithAllDetails = async (req, res, next) => {


    let allMeasurementIDs = []
    const allMeasurements =req.body.allMeasurements
    allMeasurements.map((measurement) => {
        allMeasurementIDs.push(measurement.id)
    } );
    //Delete all of the existing measurements

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

        let allRounds = req.body.allRounds
        let allRoundIds = []
        allRounds.map(async (round) => {
            allRoundIds.push(round.roundID)
        });

        //Delete all of the existing rounds
        try {
            await prismaClient.cFRound.deleteMany({
                where:{
                    id:{in : allRoundIds}
                }
            })
        }
        catch (err) {

            return res.status(400).json({
                 error:err.stack,
                 result: "Failed to delete rounds!"
                });

            }


    let {
        workoutRounds,
        workoutID,
        ...workoutInfo
    } = req.body.workout

    workoutInfo = workoutInfo.workoutInfo
    let {
        workoutCategory,
        ...info
    } = workoutInfo
    //Delete the workout
    try {
        await prismaClient.cFWorkout.delete({
            where:{
                id:workoutID
            }
        })
    }
    catch (err) {

        return res.status(400).json({
             error:err.stack,
             result: "Failed to delete workout!"
            });

        }


    //Create all measurements into the table.
    try {
        await prismaClient.cFMeasureMovement.createMany({

            data: req.body.allMeasurements,
        });
    } catch (err) {

       return res.status(400).json({
            error:err.stack,
            result: "Failed to create measurements!"
        });

    }



    // create all round and attach measurments created in the above qwuerly
    allRounds.map(async (round) => {
        let {
            roundMeasurements,
            roundID,
            roundInfo
        } = round;

        try {
            await prismaClient.cFRound.create({

                data: {
                    id: roundID,
                    ...roundInfo,
                    measurements: {
                        createMany: {
                            data: roundMeasurements
                        }
                    }

                }

            })
        } catch (err) {
            console.log(err)
           return res.status(400).json({
                error: err.stack,
                result: "Failed to create round!"
            });

        }


    })




    console.log(workoutInfo, info)
    try {


        if(workoutCategory) {

        resultWorkout = await prismaClient.cFWorkout.create({
            data: {
            id:workoutID,
            ...info,
            rounds: {
                createMany: {
                    data: workoutRounds
                }
            },
            workoutCategory: {
                connect: workoutCategory
            }
        }
        })
    }
    else {
        resultWorkout = await prismaClient.cFWorkout.create({
            data: {
            id:workoutID,
            ...info,
            rounds: {
                createMany: {
                    data: workoutRounds
                }
            },
        }
        })
    }
    } catch (err) {
        console.log(err)
       return res.status(400).json({
            error: err.stack,
            result: "Failed to create Workout!"
        });


    }

    res.status(200).json({
        result: resultWorkout
    });
}



module.exports = {
    updateNumberofTrainees,
    updateCoachDetails,
    updateWorkoutWithAllDetails
}