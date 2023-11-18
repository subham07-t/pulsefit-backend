

//const movementParametersToString = async (req, res, next) => {

   let  weightDisplayUnits = {
        "Pounds" : 'LBS',
        "Kilograms" : 'KGS',
        "poods" : 'PODS',
        "RepMaxFraction": '%1RM',
        "BodyWeight": '% BW',
        "PickLoad" : 'LBS'
    }

    let heightDisplayUnits = {
        "Inches" : "Inch",
        "Feet": "Ft",
        "Centimeters" : 'cm',
        "Meters": 'm'
    }

    let distanceDisplayUnits=  {
        "Meters" : 'm',
        "Kilometers": "KM",
        "Feet": 'Ft',
        "Yards" :'Yds',
        "Miles" : 'mi',
        "Inches" : 'Inch'
    }

    params = {
        "movementName": "BURPEE",
        "reps": {},
        "height": {},
        "heightUnits": "Inches",
        "weight": {},
        "weightUnits": "Pounds",
        "distance": 0,
        "distanceUnits": "Meters",
        "duration": 0,
        "calorie": 0,
        "isMaxLoad": false,
        "isMaxReps": true,
    }
    let measurementString = ``
    // if(isMaxLoad) {
    //     measurementString = `1 RM ${movementName} ${weight} ${weightUNITS} ${height} ${heightUNITS}`
    // }
    // else if(isMaxReps) {
    //     measurementString = `MAX REPS ${movementName} ${weight} ${weightUNITS} ${height} ${heightUNITS}`
    // }
    // else {
    //     measurementString = `${reps} ${duration} ${durationUNITSstring} ${distance} ${distanceUNITS} ${calorie} ${calorieUNITS} ${movementName} ${weight} ${weightUNITS} ${height} ${heightUNITS} `
    // }


    if (params.isMaxReps) {
        measurementString += `MAX REPS`
    }


    if(params.reps && params.reps != 0) {
        measurementString += `${params.reps}`

    }

    if (params.isMaxLoad) {
        measurementString += ` RM`
    }


    if(params.duration && params.duration != 0) {
        let durationString = new Date(params.duration  * 1000).toISOString().substring(14, 19)
        if(params.duration  < 60) {
            durationString = ` ${params.duration} Sec`
        }

        measurementString += ` ${durationString}`
    }

    if(params.distance && params.distance != 0) {
        measurementString += ` ${params.distance} ${distanceDisplayUnits[params.distanceUnits]}`

    }
    if(params.calorie && params.calorie != 0) {
        measurementString += ` ${params.calorie} Cal`

    }

    measurementString += ` ${params.movementName}`
    if(params.weight) {

        measurementString += ` ${params.weight} ${weightDisplayUnits[params.weightUnits]}`
    }

    if(params.height) {
        measurementString += ` ${params.height} ${heightDisplayUnits[params.heightUnits]}`

    }

    console.log(measurementString)


//}