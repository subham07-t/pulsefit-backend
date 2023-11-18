const {db} = require("../../models/database");
let randomstring = require("randomstring");
const { prismaClient: prisma } = require("../../models/prismaClient");

let Test = 'Test'


//compulsory: name, coachID
//ENDPOINT: api/CF/CoachWeb/program/addNewProgram
const addNewProgram = async (req, res, next) => {
    let query = prisma.cFProgram.create({
        data:{
            name:req.body.name,
            coach:{
                connect:req.body.coachID,
            },
        },
    })

    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed";
    next();
}

//ENDPOINT: api/CF/CoachWeb/program/getAllProgramsByCoachID
const getAllProgramsByCoachID = async (req, res, next) => {

    if(!req?.body?.coachID) {
        return res.status(400).json({'message': 'Coach ID parameter is required.'});
    }
    let coachID = req.body.coachID;

    let query = prisma.cFProgram.findMany({
        where:{coachID: coachID,},
        include:{
            programAssigmentTracker: true
        }
    })

    req.body.query = query;
    req.body.returnMessage = "Sucess";
    req.body.failedMessage = "Failed";
    next();

}
//ENDPOINT: api/CF/CoachWeb/program/getProgramByCoachIDProgramID
const getProgramByCoachIDProgramID = async (req, res, next) => {
    if(!req?.body?.coachID) {
        return res.status(400).json({'message': 'Coach ID parameter is required.'});
    }
    if(!req?.body?.programID) {
        return res.status(400).json({'message': 'Workout ID parameter is required.'});
    }

    let {coachID, programID} = req.body
    let query = prisma.cFProgram.findMany({
        where:{
                AND: [{
                        coachID: coachID,
                    },
                    {
                        id: programID,
                    },
                ],
            },
    })

    req.body.query = query;
    req.body.returnMessage = "Sucess";
    req.body.failedMessage = "Failed";
    next();

}

//ENDPOINT: api/CF/CoachWeb/program/searchProgramByName
const searchProgramByName = async (req, res, next) => {
    //either visibility all or matches coachID from movementDB
    //expects
    //coachID and search string
    let coachID = req.body.coachID;
    let searchPattern = req.body.searchString;
    const searchQuery = prisma.cFProgram.findMany({
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
    req.body.failedMessage = "Failed"
    next();

}


/*Compulsory: programID
            : workoutIDs [] to add to program*/
//ENDPOINT: api/CF/CoachWeb/program/addWorkoutsToProgram
const addWorkoutsToProgram = async (req, res, next) => {
    let workouts;
    let programID = req.body.programID;
    if(req.body.workoutIDs.length === 1){
        workouts = req.body.workoutIDs(0);
    }
    else {
        workouts = req.body.workoutIDs;
    }

    let query = prisma.cFProgram.update({
        where:{
            id: programID,
        },
        data:{
            workouts:{
                connect:workouts
            }
        }
    })

    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed"
    next();
}

//A program is 100/200s of workout long in a seqence
/*TODO: A complex transactional query where you have to return only set of workouts.
        - First query will get all 200 or 300s of workout IDS.
        -Second query will get user the result from previous to cut out a given ragne like [20 50]
        - Using the rangem, send one more query query the full workouts on the workout table for that range. Max 30
        -Then return the result. range query
    */
//FIXME: Not a fix but assumption that workouts come in order that are connected.
//
//compulsory: all the programIDs in an [] for which all workouts are requested


//ENDPOINT: api/CF/CoachWeb/program/getProgramWorkoutsbyCoachIDProgramID
const getProgramWorkoutsbyCoachIDProgramID = async (req, res, next) => {
    if(!req?.body?.programIDs) {

        return res.status(400).json({'message': 'programIDs parameter is required.'});
    }
    if(!req?.body?.coachID) {

        return res.status(400).json({'message': 'Coach ID parameter is required.'});
    }
    let programIDs = req.body.programIDs;
    let coachID = req.body.coachID;
    let query = prisma.cFProgram.findMany({
        where:{
            AND: [
                    {
                        id: { in: programIDs, },
                    },
                    {
                        coachID:coachID,
                    },
            ],
        },

        include:{
            workouts:true
        }

    })

    req.body.query = query;
    req.body.returnMessage = "Success";
    req.body.failedMessage = "Failed"
    next();
}

const getFullProgramWorkouts = async (req, res, next) => {


}
//ENDPOINT: api/CF/CoachWeb/program/getAllPrograms
const getAllPrograms = async (req, res, next) => {
    let query = prisma.cFProgram.findMany({

        include:{
            programAssigmentTracker: true
        }

    })

    req.body.query = query;
    req.body.returnMessage = "Success";
    next();
}


const pushExistingProgram = async (req, res, next) => {
    console.log(req.body.TrainerUUID)
    let query = prisma.cFProgram.create({
        data: {
            name:req.body.PlanName,
            id:req.body.PrimaryKey,
            coachID:req.body.TrainerUUID,
            programAssigmentTracker:{
                create:{
                    athelete: {connect : {id: req.body.UserUUID }} ,
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
    req.body.failedMessage = "Failed"
    next();
}


module.exports = {
    addNewProgram, getAllProgramsByCoachID,
    getProgramByCoachIDProgramID, searchProgramByName,
    addWorkoutsToProgram, getProgramWorkoutsbyCoachIDProgramID, pushExistingProgram, getAllPrograms

}