const {db} = require("../../models/database");
let randomstring = require("randomstring");
const {WorkoutCategory, prismaClient: prisma } = require("../../models/prismaClient");
const { read } = require("fs");
const { create } = require("domain");

let Test = 'Test'


//compulsory: name of workout, coach ID, tags  is must
//ENDPOINT: api/CF/CoachWeb/workout/addNewWorkoutNameCoach
const addNewWorkoutNameCoach = async (req, res, next) => {

    let query = prisma.cFWorkout.create({
        data:{
            name: req.body.name,
            workoutCategory: (req.body.workoutCategory),

            coach:{
                connect:req.body.coachID
            }
        }
    })
    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed";
    next();

}

//getallworkoutsByCoachID
//getworkoutbyCoachIDWorkoutID
//getWorkoutbyName
//DeleteWorkout -- Two deletions, entry in the workout table and all the rows in the WorkoutRounds then remove all Rounds in RoundMeasurements table

//compulsory: coachID
//ENDPOINT: api/CF/CoachWeb/workout/getAllWorkoutsByCoachID
const getAllWorkoutsByCoachID = async (req, res, next) => {

    if(!req?.body?.coachID) {
        return res.status(400).json({'message': 'Coach ID parameter is required.'});
    }
    let coachID = req.body.coachID;

    let query = prisma.cFWorkout.findMany({
        where:{coachID: coachID,},

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
    })

    req.body.query = query;
    req.body.returnMessage = "Sucess";
    req.body.failedMessage = "Failed";
    next();
}
//ENDPOINT: api/CF/CoachWeb/workout/getWorkoutByCoachIDWorkoutID
const getWorkoutByCoachIDWorkoutID = async (req, res, next) => {
    if(!req?.body?.coachID) {
        return res.status(400).json({'message': 'Coach ID parameter is required.'});
    }
    if(!req?.body?.workoutID) {
        return res.status(400).json({'message': 'Workout ID parameter is required.'});
    }

    let {coachID, workoutID} = req.body
    let query = prisma.cFWorkout.findMany({
        where:{
                AND: [{
                        coachID: coachID,
                    },
                    {
                        id: workoutID,
                    },
                ],
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
    })

    req.body.query = query;
    req.body.returnMessage = "Sucess";
    req.body.failedMessage = "Failed";
    next();


}

//compulsory:  coachID, searchString
const searchWorkoutByName = async (req, res, next) => {
    //either visibility all or matches coachID from movementDB
    //expects
    //coachID and search string

    let coachID = req.body.coachID;
    let searchPattern = req.body.searchString;
    const searchQuery = prisma.cFWorkout.findMany({
        where: {
            OR: [{
                    visibilityAll: {
                        equals: true,
                    },
                },
                {
                    coachID: {
                        equals: coachID,
                    },
                },
            ],
            AND: {
                name: {
                    contains: searchPattern,
                    mode: 'insensitive'
                },
            },
        },
    });

    req.body.query = searchQuery;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed";
    next();

}

/*compulsory: workoutID,
             programIDs to connect to the workout */
//ENDPOINT: api/CF/CoachWeb/workout/setWorkoutToPrograms
 const setWorkoutToPrograms = async (req, res, next) => {
    let programs;
    let workoutID = req.body.workoutID;
    if(req.body.programIDs.lenght == 1){
        programs = req.body.programIDs(0);
    }
    else {
        rounds = req.body.roundIDs;
    }

    let query = prisma.cFWorkout.update({
        where:{
            id: workoutID,
        },
        data:{
            programs:{
                connect:programs
            }
        }
    })

    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed";
    next();
}






//ENDPOINT: api/CF/CoachWeb/workout/getAllWorkouts
const getAllWorkouts = async (req, res, next) => {

    let query = prisma.cFWorkout.findMany({})
    req.body.query = query;
    req.body.returnMessage = "Sent results";
    req.body.failedMessage = "Failed";
    next();
}

//ENDPOINT: api/CF/CoachWeb/workout/deleteAllWorkouts
const deleteAllWorkouts = async (req, res, next) => {

    let query = prisma.cFWorkout.deleteMany({})
    req.body.query = query;
    req.body.returnMessage = "Sent results";
    req.body.failedMessage = "Failed";
    next();
}


//ENDPOINT: api/CF/CoachWeb/workout/deleteOneWorkout
const deleteOneWorkout = async (req, res, next) => {

    let query = prisma.cFWorkout.deleteMany({

        where:{
            id: req.body.workoutID
        }
    })
    req.body.query = query;
    req.body.returnMessage = "Sent results";
    req.body.failedMessage = "Failed";
    next();
}

module.exports = { addNewWorkoutNameCoach,
getAllWorkoutsByCoachID, getWorkoutByCoachIDWorkoutID, searchWorkoutByName,
 setWorkoutToPrograms,
 getAllWorkouts, deleteAllWorkouts, deleteOneWorkout}