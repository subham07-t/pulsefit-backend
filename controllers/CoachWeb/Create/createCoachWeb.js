/*
FILE FOR ALL CREATE QUERIES FOR COACH BACKEND
*/

const {
    WorkoutCategory,
    prismaClient
} = require("../../../models/prismaClient");
const {
    read
} = require("fs");
const {
    create
} = require("domain");

// ENDPOINT: api/CF/CoachWeb/Create/addNewCoach

const addNewCoach = async (req, res, next) => {
    data = req.body.data
    const addCoachQuery = prismaClient.CFCoach.create({
        data: data
    })

    req.body.query = addCoachQuery;
    req.body.returnMessage = "Added New coach";
    req.body.failedMessage = "Failed to add new coach"
    next();

}


// ENDPOINT: api/CF/CoachWeb/Create/addNewAthelete

const addNewAthelete = async (req, res, next) => {
    data = req.body.data

    const addAtheleteQuery = prismaClient.cFAthele.create({
        data: data
    })

    req.body.query = addAtheleteQuery;
    req.body.returnMessage = "Added New Athelete";
    req.body.failedMessage = "Failed to add new athelte"
    next();
}


//ENDPOINT: api/CF/coachWeb/Create/createManyMovements
const createManyMovements = async (req, res, next) => {

    let data = req.body
    let query = prismaClient.cFMovement.createMany({

        data: data,
        skipDuplicates: true,
    });

    req.body.query = query;
    req.body.returnMessage = "Insertion Done";
    req.body.failedMessage = "Message failed"
    next()
}


//ENDPOINT: api/CF/coachWeb/Create/pushExistingProgram
const pushExistingProgram = async (req, res, next) => {
    console.log(req.body.TrainerUUID)
    let query = prismaClient.cFProgram.create({
        data: {
            name: req.body.PlanName,
            id: req.body.PrimaryKey,
            coachID: req.body.TrainerUUID,
            programAssigmentTracker: {
                create: {
                    athelete: {
                        connect: {
                            id: req.body.UserUUID
                        }
                    },
                    dateAssigned: req.body.StartDate,
                    endDate: req.body.EndDate,
                    programDuration: req.body.Duration,
                    isActive: req.body.IsActive

                },
            }
        }
    });



    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed!"
    next();
}
//ENDPOINT: api/CF/coachWeb/Create/AddWorkoutWithAllDetails
const addWorkoutWithAllDetails = async (req, res, next) => {

    let allMeasurementIDs = []
    const allMeasurements = req.body.allMeasurements
    allMeasurements.map((measurement) => {
        allMeasurementIDs.push(measurement.id)
    });
    //Delete all of the existing measurements

    try {
        await prismaClient.cFMeasureMovement.deleteMany({
            where: {
                id: {
                    in: allMeasurementIDs
                }
            }
        })
    } catch (err) {

        console.log({
            error: err.stack,
            result: "Failed to delete measurements!"
        });

    }
    //Create all measurements into the table.
    try {
        await prismaClient.cFMeasureMovement.createMany({

            data: req.body.allMeasurements,
            skipDuplicates: true
        });
    } catch (err) {

        return res.status(400).json({
            error: err,
            result: "Failed to create measurements!"
        });

    }


    let allRounds = req.body.allRounds
    // create all round and attach measurments created in the above qwuerly
    allRounds.map(async (round) => {
        let {
            roundMeasurements,
            roundID,
            roundInfo
        } = round;

        try {
            await prismaClient.cFRound.upsert({
                where: {
                    id: roundID
                },
                update: {
                    id: roundID,
                    ...roundInfo,
                    measurements: {
                        createMany: {
                            data: roundMeasurements
                        }
                    }

                },
                create: {
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


    let {
        workoutRounds,
        ...workoutInfo
    } = req.body.workout

    workoutInfo = workoutInfo.workoutInfo
    let {
        workoutCategory,
        ...info
    } = workoutInfo

    console.log(workoutInfo, info)
    try {


        if (workoutCategory) {

            resultWorkout = await prismaClient.cFWorkout.create({
                data: {
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
        } else {
            resultWorkout = await prismaClient.cFWorkout.create({
                data: {
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


/*
TODO:
1.Create Ravi as a coach, UUID email and password. Note it down. Write login query
2. Add MovementCategoreis, WorkoutCategories, WorkoutTypes to get/create APIS.
3. Insert Ravis movement library to movements Table. API to fetch all of them
4. API to push workouts. Define FIELDS very well in the doc the exact body requrest needs to be received.
5. Movement parameters to String conversion
6. Workout parameters to String conversion
*/

//ENDPOINT: api/CF/coachWeb/Create/addBatchTagsCategories
const addBatchTagsCategoriesRavi = async (req, res, next) => {

    let movementcategoryNames = [
        'Bodybuilding',
        'Conditioning',
        'Gymnastics',
        'Mixed Modal',
        'Olympic Weightlifting',
        'Powerlifting',
        'Strength',
        'Strength and Conditioning',
        'OLY',
        'METCON',
        'Hypertrophy',
        'Core'
    ]

    movementcategoryNames.filter(async (movmentCategory) => {
        try {
            await prismaClient.movementCategory.create({
                data: {
                    name: movmentCategory,
                    coach: {
                        connect: {
                            id: req.body.coachID
                        }
                    }
                }
            });
        } catch (err) {
            return res.status(400).json({
                error: err.stack,
                failedMessage: "Adding Movement Categories Failed!"
            });
        }

        try {
            await prismaClient.workoutCategory.create({
                data: {
                    name: movmentCategory,
                    coach: {
                        connect: {
                            id: req.body.coachID
                        }
                    }
                }
            })
        } catch (err) {
            return res.status(400).json({
                error: err.stack,
                failedMessage: "Adding Workout Categories Failed!"
            });
        }





    })



    // let workoutTypes = [
    //     'AMRAP',
    //     'EMOM',
    //     'RFT',
    //     'LOAD',
    //     'QUALITY',
    //     'NOSCORE'
    // ]

    // workoutTypes.filter(async (workoutType) => {
    //     try {
    //         await prismaClient.workoutType.create({
    //             data: {
    //                 name: workoutType,
    //                 coach: {
    //                     connect: {
    //                         id: req.body.coachID
    //                     }
    //                 }
    //             }
    //         });
    //     } catch (err) {
    //      return   res.status(400).json({
    //             error: err.stack,
    //             failedMessage: "Adding Workout Types Failed!"
    //         });
    //     }


    // });


    res.status(200).json({
        returnMessage: "Successly inserted",
        result: [],
    });


}
//ENDPOINT: api/CF/coachWeb/Create/addMultipleMovementCategories
/*
{
"movementcategoryNames": [],
"coachID":
}
*/
const addMultipleMovementCategories = async (req, res, next) => {

    let movementcategoryNames = req.body.movementcategoryNames

    movementcategoryNames.filter(async (movmentCategory) => {
        try {
            await prismaClient.movementCategory.create({
                data: {
                    name: movmentCategory,
                    coach: {
                        connect: {
                            id: req.body.coachID
                        }
                    }
                }
            });
        } catch (err) {
            return res.status(400).json({
                error: err.stack,
                failedMessage: "Adding Workout Types Failed!"
            });
        }


    });

    res.status(200).json({
        returnMessage: "Successly inserted",
        result: [],
    });
}


//ENDPOINT: api/CF/coachWeb/Create/addMultipleWorkoutCategories
/*
{
"workoutCategoryNames": [],
"coachID":
}
*/
const addMultipleWorkoutCategories = async (req, res, next) => {

    let workoutCategoryNames = req.body.workoutCategoryNames

    workoutCategoryNames.filter(async (workoutCategoryName) => {

        try {
            await prismaClient.workoutCategory.create({
                data: {
                    name: workoutCategoryName,
                    coach: {
                        connect: {
                            id: req.body.coachID
                        }
                    }
                }
            });
        } catch (err) {
            return res.status(400).json({
                error: err.stack,
                failedMessage: "Adding Workout Categories Failed!"

            });
        }


    });

    res.status(200).json({
        returnMessage: "Successly inserted",
        result: [],
    });

}
//ENDPOINT: api/CF/coachWeb/Create/addMultipleWorkoutTypes
/*
{
"workoutTypeNames": [],
"coachID":
}
*/
const addMultipleWorkoutTypes = async (req, res, next) => {
    let workoutTypeNames = req.body.workoutTypeNames

    workoutTypeNames.filter(async (workoutType) => {
        try {
            await prismaClient.workoutType.create({
                data: {
                    name: workoutType,
                    coach: {
                        connect: {
                            id: req.body.coachID
                        }
                    }
                }
            });
        } catch (err) {
            return res.status(400).json({
                error: err.stack,
                failedMessage: "Adding Workout Types Failed!"
            });
        }



    });

    res.status(200).json({
        returnMessage: "Successly inserted Workout Types",
        result: [],
    });

}

//ENDPOINT: api/CF/coachWeb/Create/addMovement

const addMovement = async (req, res, next) => {


    let {
        coachID,
        category,
        ...info
    } = req.body


    let query;

    if (category) {
        query = prismaClient.cFMovement.create({
            data: {
                ...info,
                coach: {
                    connect: {
                        id: coachID
                    }
                },
                category: {
                    connect: category
                }
            }
        })
    } else {
        query = prismaClient.cFMovement.create({
            data: {
                ...info,
                coach: {
                    connect: {
                        id: coachID
                    }
                },
            }
        })
    }

    req.body.query = query;
    req.body.returnMessage = "Added New Movement";
    req.body.failedMessage = "Failed to add new movement"
    next();


}

//ENDPOINT:api/CF/coachWeb/Create/createManyMeasurements
const createManyMeasurements = async (req, res, next) => {

    let query = prismaClient.cFMeasureMovement.createMany({

        data: req.body.measurements,
    });

    req.body.query = query;
    req.body.returnMessage = "Insertion Done";
    next()
}

//ENDPOINT:api/CF/coachWeb/Create/createWorkoutWithUser
const createWorkoutWithUser = async (req, res, next) => {

    let results = await prismaClient.cFAthele.findMany({
        where: {
            id: req.body.UserUUID,
        },
        include: {
            assignedprogramTracking: {
                include: {
                    programAssigned: true,
                }
            }
        }
    });

    if (results.length == 0) {
        console.log("herer")
        return res.status(200).send({
            meassage: "User Not found",
            result: []
        })
    }
    //console.log(results[0].assignedprogramTracking.length)
    if (results[0].assignedprogramTracking.length == 0) {
        console.log("herer")
        return res.status(200).send({
            meassage: "no coach assigned in programs assigned probably not active user",
            result: []
        })
    }

    let coachID = results[0].assignedprogramTracking[0].programAssigned.coachID
    //let coachEmail =results[0].assignedprogramTracking[0].programAssigned.coach.email
    let programAssignedID = results[0].assignedprogramTracking[0].programAssignedID
    console.log('heree222')
    //console.log(coachID, coachEmail)
    let workoutQuery = prismaClient.cFWorkout.upsert({

        where: {
            id: req.body.PrimaryKey,
        },
        update: {
            name: req.body.Name,
            expectedCalories: req.body.Calories,
            runTime: req.body.ModuleDuration,
            coach: {
                connect: {
                    id: coachID
                }
            },
            assignedWorkoutTracker: {
                create: {
                    athelete: {
                        connect: {
                            id: req.body.UserUUID,
                        }
                    },
                    dateAssigned: req.body.ModuleDate,
                    finished: req.body.Complete,
                    feedback: req.body.Feedback,
                    rating: req.body.Rating,
                    timeToFinish: req.body.Time
                }
            },
        },
        create: {
            id: req.body.PrimaryKey,
            name: req.body.Name,
            expectedCalories: req.body.Calories,
            runTime: req.body.ModuleDuration,
            coach: {
                connect: {
                    id: coachID
                }
            },
            assignedWorkoutTracker: {
                create: {
                    athelete: {
                        connect: {
                            id: req.body.UserUUID,
                        }
                    },
                    dateAssigned: req.body.ModuleDate,
                    finished: req.body.Complete,
                    feedback: req.body.Feedback,
                    rating: req.body.Rating,
                    timeToFinish: req.body.Time
                }
            },
        },
    });

    req.body.query = workoutQuery;
    req.body.returnMessage = "Success";
    next()

}

//ENDPOINT:api/CF/coachWeb/Create/createNewRoundwithMeasurementsWokrout
const createNewRoundwithMeasurementsWokrout = async (req, res, next) => {

    console.log(req.body)
    measurements = req.body.measurements;
    workout = req.body.workout
    let query = prismaClient.cFRound.create({
        data: {
            measurements,
            workout
        }
    });

    req.body.query = query;
    req.body.returnMessage = "Success";
    next();
}

module.exports = {
    addNewCoach,
    addWorkoutWithAllDetails,
    addBatchTagsCategoriesRavi,
    addMultipleWorkoutCategories,
    addMultipleMovementCategories,
    addMultipleWorkoutTypes,
    addMovement,
    addNewAthelete,
    pushExistingProgram,
    createManyMovements,
    createManyMeasurements,
    createWorkoutWithUser,
    createNewRoundwithMeasurementsWokrout
}