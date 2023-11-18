const { read } = require("fs");
const {
  WorkoutCategory,
  prismaClient,
} = require("../../../models/prismaClient");
let btoa = require("btoa");
const encode = (data) => {
  let str = data.reduce((a, b) => {
    return a + String.fromCharCode(b);
  }, "");
  return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
};
let randomstring = require("randomstring");
let { uploads3, s3Bucket } = require("../../../models/awsS3");
const { startOfWeek, endOfWeek } = require("date-fns");

//ENDPOINT: "/api/CF/CoachWeb/Get/TrainerProfiles"
const getTrainerProfiles = async (req, res, next) => {
  let maleTrainers;

  try {
    maleTrainers = await prismaClient.cFCoach.findMany({
      where: {
        AND: [{ gender: "Male" }, { isActive: true }],
      },
      take: 4,
      orderBy: numberofTrainees,
    });
  } catch (err) {
    res.status(400).json({ result: false });
  }

  let updatedMaleTrainers = [];

  maleTrainers.map((trainer) => {
    if (trainer.highlights != null) {
      let val = {
        ...trainer,
        Highlights: JSON.parse(trainer.highlights),
      };
      updatedMaleTrainers.push(val);
    } else {
      updatedMaleTrainers.push(trainer);
    }
  });

  let femaleTrainers;
  //GET FEMAEL TRAINER
  try {
    femaleTrainers = await prismaClient.cFCoach.findMany({
      where: {
        AND: [{ gender: "Female" }, { isActive: true }],
      },
      take: 4,
      orderBy: numberofTrainees,
    });
  } catch (err) {
    res.status(400).json({ result: false });
    throw err;
  }

  let updatedFemaleTrainers = [];

  femaleTrainers.map((trainer) => {
    if (trainer.highlights != null) {
      let val = {
        ...trainer,
        Highlights: JSON.parse(trainer.highlights),
      };
      updatedFemaleTrainers.push(val);
    } else {
      updatedFemaleTrainers.push(trainer);
    }
  });

  let finalResult = [...updatedFemaleTrainers, ...updatedMaleTrainers];

  res.status(200).json({ result: finalResult });
};

//ENDPOINT: "/api/CF/CoachWeb/Get/oneCoachProfile"
const oneCoachProfile = async (req, res, next) => {
  let trainerQuery = prismaClient.cFCoach.findUnique({
    where: {
      id: req.body.coachID,
    },
  });
  req.body.query = trainerQuery;
  req.body.returnMessage = "All Trainer/Coach Details";
  req.body.failedMessage = "Failed to fetch Trainers or Coach ";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/getAllCoaches
const getAllCoaches = async (req, res, next) => {
  let allCoachesQuery = prismaClient.cFCoach.findMany({});

  req.body.query = allCoachesQuery;
  req.body.returnMessage = "All Trainer/Coach Details";
  req.body.failedMessage = "Failed to fetch Trainers or Coach ";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/getAllAtheletes
const getAllAtheletes = async (req, res, next) => {
  let allAtheletesQuery = prismaClient.cFAthele.findMany({});

  req.body.query = allAtheletesQuery;
  req.body.returnMessage = "All Athelete Details";
  req.body.failedMessage = "Failed to fetch Athelete ";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/getAllAtheletesOneCoach
const getAllAtheletesOneCoach = async (req, res, next) => {
  let allAtheletesQuery = prismaClient.cFCoach.findMany({
    where: {
      id: req.body.coachID,
    },
    include: {
      atheletes: true,
    },
  });

  req.body.query = allAtheletesQuery;
  req.body.returnMessage = "All Athelete Details for a Coach";
  req.body.failedMessage = "Failed to fetch Athelete ";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/findByNameMovement
const findByNameMovement = async (req, res, next) => {
  //either visibility all or matches coachID from movementDB
  //expects
  //coachID and search string
  let coachID;
  if (req.body.coachID == undefined) {
    coachID = "adfadf";
  } else coachID = req.body.coachID;

  let searchPattern = req.body.searchString;
  const searchQuery = prismaClient.cFMovement.findMany({
    where: {
      OR: [
        {
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
          equals: searchPattern,
        },
      },
    },
    include: {
      category: true,
    },
  });
  req.body.query = searchQuery;
  req.body.returnMessage = "Found Movement";
  req.body.failedMessage = "Failed to execute search query";
  next();
};

const getWorkoutStrings = (params) => {
  let workoutTitleString = ``;

  if (params.name) {
    workoutTitleString = params.name;
  }

  let WorkoutString1 = ``;
  if (params.workoutType == "RFT") {
    WorkoutString1 = "For Time: ";
  }
  let WorkoutString2 = ``;
  if (params.numRounds > 1) {
    WorkoutString2 = `${params.numRounds} Rounds`;
  }

  let WorkoutString3 = ``;

  if (params.runTime > 0 && params.workoutType) {
    let runTimeString = new Date(params.duration * 1000)
      .toISOString()
      .substring(14, 19);

    runTimeString += " min";
    if (params.runTime < 60) {
      runTimeString = ` ${params.runTime} Sec`;
    }

    if (params.workoutType == "AMRAP") {
      WorkoutString3 = runTimeString + " AMRAP";
    } else if (params.workoutType == "EMOM") {
      WorkoutString3 = runTimeString + " EMOM";
    } else {
      WorkoutString3 = "Time Cap: " + runTimeString;
    }
  }

  let restString = ``;

  if (params.restTime > 0) {
    let restTimeString = new Date(params.duration * 1000)
      .toISOString()
      .substring(14, 19);

    restTimeString += " min";
    if (params.runTime < 60) {
      restTimeString = ` ${params.runTime} Sec`;
    }

    restString = restTimeString + " Rest Time";
  }

  return [WorkoutString1, WorkoutString2, WorkoutString3, restString];
};
const getRoundStrings = (params) => {
  let roundTitle = ``;

  if (params.name && params.name != "") {
    roundTitle = params.name;
  }

  let RoundString2 = ``;
  if (params.numRounds > 1) {
    RoundString2 = `${params.numRounds} Rounds`;
  }

  let RoundString3 = ``;

  if (params.roundTime > 0) {
    let runTimeString = new Date(params.roundTime * 1000)
      .toISOString()
      .substring(14, 19);

    runTimeString += " min";
    if (params.roundTime < 60) {
      runTimeString = ` ${params.roundTime} Sec`;
    }

    RoundString3 = runTimeString + " AMRAP";
  }

  let RoundRestString = ``;

  if (params.restTime > 0) {
    let restTimeString = new Date(params.restTime * 1000)
      .toISOString()
      .substring(14, 19);

    restTimeString += " min";
    if (params.runTime < 60) {
      restTimeString = ` ${params.restTime} Sec`;
    }

    RoundRestString = restTimeString + " Rest Time";
  }

  return [roundTitle, RoundString2, RoundString3, RoundRestString];
};

//ENDPOINT: api/CF/CoachWeb/Get/getWorkoutWithAllDetails
const getWorkoutWithAllDetails = async (req, res, next) => {
  console.log(req.body.workoutID);
  let workoutQuery;
  try {
    workoutQuery = await prismaClient.cFWorkout.findMany({
      where: {
        id: req.body.workoutID,
      },

      include: {
        workoutCategory: true,
        rounds: {
          // Get all the roundsWithWorkout, order by orderIDX, include round
          orderBy: {
            orderIdx: "asc",
          },
          include: {
            round: {
              //Get the round in each of rounds include measurements
              include: {
                measurements: {
                  // Get all the measurements, order by orderIdx, include measurement
                  orderBy: {
                    orderIdx: "asc",
                  },
                  include: {
                    //Get the measurement that has reps/cals/other properties
                    measurement: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.stack, failedMessage: "Failed to get workout!" });
  }

  if (workoutQuery.length == 0) {
    return res.status(200).json({
      workout: workoutQuery,
      message: "Workout Not Found!",
    });
  }

  workout_params = {
    name: workoutQuery.name,
    numRounds: workoutQuery.numRounds,
    runTime: workoutQuery.runTime,
    restTime: workoutQuery.restTime,
    workoutType: workoutQuery.workoutType,
  };

  let workoutString = getWorkoutStrings(workout_params);

  let rounds = [];
  if (workoutQuery.rounds) {
    rounds = workoutQuery.rounds;
  }

  let roundStrings = [];

  if (rounds.length > 0) {
    rounds.map((roundInfo) => {
      let round = roundInfo.round;
      round_params = {
        name: round.name,
        roundTime: round.roundTime,
        numRounds: round.numRounds,
        restTime: round.restTime,
      };

      let roundInfoString = getRoundStrings(round_params);
      roundStrings.push(roundInfoString);
    });
  }

  res.status(200).json({
    workout: workoutQuery,
    workoutStrings: workoutString,
    roundStrings: roundStrings,
    message: "Sucess",
  });
};
//ENDPOINT: api/CF/CoachWeb/Get/authCoach
/*

{
    "email":
    "coachID"
}

*/
const authTrainer = async (req, res, next) => {
  let authResult;
  console.log(req.body);
  try {
    authResult = await prismaClient.cFCoach.findMany({
      where: {
        AND: [{ email: req.body.email }, { id: req.body.coachID }],
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ result: false, failedMessage: "Failed on finding Coach!" });
  }

  if (authResult && authResult.length > 0) {
    res.status(200).json({ authorize: true });
  } else {
    res.status(200).json({ authorize: false });
  }
};

//ENDPOINT: api/CF/CoachWeb/Get/AtheleteInfo
const getAtheleteInfo = async (req, res, next) => {
  let query = prismaClient.cFAthele.findUnique({
    where: {
      id: req.body.atheleteID,
    },
  });

  req.body.query = query;
  req.body.returnMessage = "Found Athelete";
  req.body.failedMessage = "Failed to get Athelete";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/AheleteProfileImage
const getAtheleteProfileImage = async (req, res, next) => {
  let result;

  try {
    result = await prismaClient.cFAthele.findFirst({
      where: {
        id: req.body.atheleteID,
      },
      select: {
        userImageKey: true,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err, failedMessage: "Failed to find User" });
  }
  if (result.userImageKey != null) {
    let s3params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: JSON.parse(JSON.stringify(result))[0].userImageKey,
    };
    s3Bucket.getObject(s3params, function (err, data) {
      if (err) {
        return res
          .status(400)
          .send({
            error: err.stack,
            failedMessage: "Failed to get S3Bucked object",
          });
      }
      let imageResult = "data:image/jpeg;base64," + encode(data.Body); //decode the URL

      res.status(200).json({
        returnMessage: "Successly retrieved S3 user image",
        result: imageResult,
      });
    });
  } else {
    res.status(200).json({
      returnMessage: "Successly retrieved S3 DEFAULT user image",
      result:
        "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/AppImages/assets/detailScreen/sportsman.png",
    });
  }
};
//ENDPOINT: api/CF/CoachWeb/Get/AtheleteDetailsPage
const getAtheleteDetailsPage = async (req, res, next) => {
  let currentweekmodules = [];
  let pastweekmodules = [];
  let planStaticData = {};
  let futureWeekModules = [];

  var currDate = new Date();
  let startDate = startOfWeek(currDate);
  let endDate = endOfWeek(currDate);

  let currentQuery = prismaClient.cFAtheleProgramTracker.findMany({
    where: {
      AND: [
        { atheleteID: req.body.atheleteID },
        {
          dateAssigned: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    orderBy: {
      dateAssigned: "asc",
    },
    include: {
      workoutAssigned: true,
      workoutFinished: true,
    },
  });

  currentQuery
    .then((result) => {
      let updatedResult = [];
      if (result.length > 0) {
        result.map((item, index) => {
          item = {
            ...item,
            workoutAssigned: item.workoutAssigned,
            workoutFinished: item.workoutFinished,
          };
          updatedResult.push(item);
          // ImageKey
        });
        currentweekmodules = updatedResult;
        // console.log(result,"line 74")
      } else {
        currentweekmodules = [];
      }
    })
    .catch((err) => {
      res.status(400).send({
        error: err.stack,
        failedMessage: "Failed to fetch Athelete Current workouts!",
      });
    });

  let pastQuery = prismaClient.cFAtheleProgramTracker.findMany({
    where: {
      AND: [
        { atheleteID: req.body.atheleteID },
        {
          dateAssigned: {
            lt: currDate,
          },
        },
      ],
    },
    orderBy: {
      dateAssigned: "desc",
    },
    include: {
      workoutAssigned: true,
      workoutFinished: true,
    },
  });

  pastQuery
    .then((result) => {
      let updatedResult = [];
      if (result.length > 0) {
        result.map((item, index) => {
          item = {
            ...item,
            workoutAssigned: item.workoutAssigned,
            workoutFinished: item.workoutFinished,
          };
          updatedResult.push(item);
          // ImageKey
        });
        pastweekmodules = updatedResult;
        // console.log(result,"line 74")
      } else {
        pastweekmodules = [];
      }
    })
    .catch((err) => {
      res.status(400).send({
        error: err.stack,
        failedMessage: "Failed to fetch Athelete workouts!",
      });
    });

  let futureQuery = prismaClient.cFAtheleProgramTracker.findMany({
    where: {
      AND: [
        { atheleteID: req.body.atheleteID },
        {
          dateAssigned: {
            gt: currDate,
          },
        },
        {
          dateAssigned: {
            gt: endDate,
          },
        },
      ],
    },
    orderBy: {
      dateAssigned: "asc",
    },
    include: {
      workoutAssigned: true,
      workoutFinished: true,
    },
  });

  futureQuery
    .then((result) => {
      let updatedResult = [];
      if (result.length > 0) {
        result.map((item, index) => {
          item = {
            ...item,
            workoutAssigned: item.workoutAssigned,
          };
          updatedResult.push(item);
          // ImageKey
        });
        futureWeekModules = updatedResult;
        // console.log(result,"line 74")
      } else {
        futureWeekModules = [];
      }
    })
    .catch((err) => {
      res.status(400).send({
        error: err.stack,
        failedMessage: "Failed to fetch Athelete future workouts!",
      });
    });

  let programsQuery = prismaClient.cFAtheleProgramTracker.findMany({
    where: {
      AND: [{ atheleteID: req.body.atheleteID }, { isActive: true }],
    },
    include: {
      programAssigned: true,
    },
  });

  programsQuery
    .then((result) => {
      let val = result[0];
      let options = { year: "numeric", month: "short", day: "numeric" };
      let endsInDate = new Date(val.endDate);
      let today = new Date();
      let startDateMain = new Date(val.dateAssigned);
      let startDateEdit = new Date(val.dateAssigned);
      let daysDiff = (today - startDateEdit) / (1000 * 60 * 60 * 24 * 7);

      let dateFromDaysDiff = startDateEdit.setDate(
        startDateEdit.getDate() + Math.round(daysDiff) * 7
      );

      let nextCheckinDaysVal = new Date(dateFromDaysDiff);

      planStaticData = {
        startDate: startDateMain.toLocaleString("en-US", options),
        endDate: endsInDate.toLocaleString("en-US", options),
        nextCheckInDate: nextCheckinDaysVal.toLocaleString("en-US", options),
        planName: val.programAssigned.name,
      };
      res.status(200).json({
        result: {
          planStaticData,
          pastweekmodules,
          currentweekmodules,
          futureWeekModules,
        },
      });
    })
    .catch((err) => {
      res.status(400).send({
        error: err.stack,
        failedMessage: "Failed to fetch Programs for the Athelete!",
      });
    });
};

//ENDPOINT: api/CF/CoachWeb/Get/getAllMovementCategories
/*
{
    "coachID":
}
*/
const getAllMovementCategories = async (req, res, next) => {
  let query = prismaClient.movementCategory.findMany({
    where: {
      coachID: req.body.coachID,
    },
  });

  req.body.query = query;
  req.body.returnMessage = "All movmement categories";
  req.body.failedMessage = "Failed to get movement categories";
  next();
}; // END getAllMovementCategories

//ENDPOINT: api/CF/CoachWeb/Get/getAllWorkoutCategories
/*
{
    "coachID":
}
*/
const getAllWorkoutCategories = async (req, res, next) => {
  let query = prismaClient.workoutCategory.findMany({
    where: {
      coachID: req.body.coachID,
    },
  });

  req.body.query = query;
  req.body.returnMessage = "All wokrout categories";
  req.body.failedMessage = "Failed to get workout categories";
  next();
}; // END getAllWorkoutCategories

//ENDPOINT: api/CF/CoachWeb/Get/getAllWorkoutTypes
/*
{
    "coachID":
}
*/
const getAllWorkoutTypes = async (req, res, next) => {
  let query = prismaClient.workoutType.findMany({
    where: {
      coachID: req.body.coachID,
    },
  });

  req.body.query = query;
  req.body.returnMessage = "All wokrout types";
  req.body.failedMessage = "Failed to get workout types";
  next();
}; // END getAllWorkoutCategories

//ENDPOINT: api/CF/CoachWeb/Get/getAllCategories
/*
{
    "coachID":
}
*/
const getAllCategories = async (req, res, next) => {
  let movementCategory;

  try {
    movementCategory = await prismaClient.movementCategory.findMany({
      where: {
        coachID: req.body.coachID,
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({
        error: err.stack,
        failedMessage: "Failed on fetching movemnent Categories!",
      });
  }

  let workoutCategory;

  try {
    workoutCategory = await prismaClient.workoutCategory.findMany({
      where: {
        coachID: req.body.coachID,
      },
    });
  } catch (err) {
    return res
      .status(400)
      .json({
        error: err.stack,
        failedMessage: "Failed on fetching workout Categories!",
      });
  }

  // let workoutType;

  // try {
  //     workoutType = await prismaClient.workoutType.findMany({
  //     where:{
  //         coachID: req.body.coachID
  //     }
  // });
  // }
  // catch(err) {
  // return res.status(400).json({ error: err.stack,
  //  failedMessage: "Failed on fetching workout Types!" });

  // }

  let finalResult = {
    movementCatregories: movementCategory,
    workoutCategories: workoutCategory,
  };

  res.status(200).json({
    result: finalResult,
    returnMessage: "Sucessfully gathered all types and categories",
  });
};

//ENDPOINT: api/CF/CoachWeb/Get/getAllMovements
/*
{
    "coachID":
}
*/
const getAllMovements = async (req, res, next) => {
  if (req.body.coachID == undefined) {
    coachID = "adfadf";
  }
  const allMovementsQuery = prismaClient.cFMovement.findMany({
    where: {
      OR: [
        {
          visibilityAll: {
            equals: true,
          },
        },
        {
          coachID: {
            equals: req.body.coachID,
          },
        },
      ],
    },
  });
  req.body.query = allMovementsQuery;
  req.body.returnMessage = "All movements";
  req.body.failedMessage = "Failed to get all movements";
  next();
};

//ENDPOINT: api/CF/CoachWeb/Get/getWorkoutsOneCoach
/*
{
    "coachID":
}
*/
const getWorkoutsOneCoach = async (req, res, next) => {
  console.log(req.body.coachID);
  let workoutQuery = prismaClient.cFCoach.findMany({
    where: {
      id: req.body.coachID,
    },

    include: {
      workouts: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  req.body.query = workoutQuery;
  req.body.returnMessage = "Workout successfully retireived";
  req.body.failedMessage = "Failed to fetch the workout";
  next();
};

module.exports = {
  getTrainerProfiles,
  getAllCoaches,
  getWorkoutWithAllDetails,
  oneCoachProfile,
  authTrainer,
  getAtheleteInfo,
  getAtheleteProfileImage,
  getAtheleteDetailsPage,
  getAllMovementCategories,
  getAllWorkoutCategories,
  getAllWorkoutTypes,
  getAllMovements,
  getAllCategories,
  getWorkoutsOneCoach,
  getAllAtheletes,
  getAllAtheletesOneCoach,
  findByNameMovement,
};
