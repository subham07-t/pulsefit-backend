

params = {"name": "",
"numRounds": 1,
"roundTime": 0,
"restTime": 0,
"repsVary": false,
"loadVary": false
}


let roundTitle = ``

if (params.name && params.name != "") {

    roundTitle = params.name
}

let RoundString2 = ``
if (params.numRounds > 1) {

    WorkoutString2 = `${params.numRounds} Rounds`
}

let RoundString3 = ``

if(params.roundTime > 0) {
    let runTimeString = new Date(params.roundTime  * 1000).toISOString().substring(14, 19)

    runTimeString += ' min'
    if(params.roundTime  < 60) {
        runTimeString = ` ${params.roundTime} Sec`
    }

    RoundString3 = runTimeString + ' AMRAP'
}

let RoundRestString = ``

if(params.restTime > 0) {
    let restTimeString = new Date(params.restTime  * 1000).toISOString().substring(14, 19)

    restTimeString += ' min'
    if(params.runTime  < 60) {
        restTimeString = ` ${params.restTime} Sec`
    }

    RoundRestString = restTimeString + " Rest Time"

}