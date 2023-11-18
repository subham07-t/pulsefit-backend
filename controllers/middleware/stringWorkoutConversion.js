params = {
  name: "WORKOUT TITLE - 1.1",
  numRounds: 3,
  runTime: 0,
  restTime: 0,
  visibility: false,
  benchMark: false,
  expectedCalories: 0,
  workoutType: "NOSCORE",
};

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
