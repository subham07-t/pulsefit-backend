// ROUTE 1
/**
 * @swagger
 * /api/profileinfo:
 *   get:
 *     description: Get user related info
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User details (JSON)
 *
 */
// ROUTE 2
/**
 * @swagger
 * /api/login:
 *   post:
 *     description: Post user info to DB
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *      - name: userName
 *        description: Enter the username *
 *        required: true
 *        type: string
 *      - name: email
 *        description: Enter the useremail *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 3
/**
 * @swagger
 * /api/profileinfo:
 *   post:
 *     description: Post user info to DB
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *      - name: dateOfBirth
 *        description: Enter the age or DOB *
 *        required: true
 *        type: string
 *      - name: weight
 *        description: Enter the weight *
 *        required: true
 *        type: string
 *      - name: height
 *        description: Enter the height *
 *        required: true
 *        type: string
 *      - name: userName
 *        description: Enter the username *
 *        required: true
 *        type: string
 *      - name: gender
 *        description: Enter the gender
 *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 4
/**
 * @swagger
 * /api/userstats:
 *   get:
 *     description: Get user related stats in profile screen
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: Total Reps , Total Challenges, Total Workouts, Total Duration (JSON)
 *
 */
// ROUTE 5
/**
 * @swagger
 * /api/storeprofileimages:
 *   post:
 *     description: Post user image to DB
 *     parameters:
 *      - name: imageUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 6
/**
 * @swagger
 * /api/profileimages:
 *   get:
 *     description: Get user profile image
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User decoded image URL
 *
 */
// ROUTE 7
/**
 * @swagger
 * /api/unjoinchallenge:
 *   post:
 *     description: Unjoin from a challenge
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *      - name: challengeUUID
 *        description: Enter the challengeUUID to unjoin *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 8
// /**
//  * @swagger
//  * /api/userprofilestats:
//  *   get:
//  *     description: Get user stats to display in profile screen
//  *     parameters:
//  *      - name: userUUID
//  *        description: Enter the Store UserId *
//  *        required: true
//  *        type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *         result: User related stats
//  *
//  */
// ROUTE 9
/**
 * @swagger
 * /api/hostedchallenges:
 *   post:
 *     description: Post challenge info to DB
 *     parameters:
 *      - name: name
 *        description: Enter the challenge name *
 *        required: true
 *        type: string
 *      - name: startDate
 *        description: Enter the startDate *
 *        required: true
 *        type: date
 *      - name: endDate
 *        description: Enter the endDate *
 *        required: true
 *        type: date
 *      - name: exercisesUUID
 *        description: Enter the exercises array *
 *        required: true
 *        type: string
 *      - name: rewards
 *        description: Enter the rewards in BTOA format*
 *        required: true
 *        type: string
 *      - name: type
 *        description: Enter the type *
 *        required: true
 *        type: string
 *      - name: challengeDuration
 *        description: Enter the challengeDuration in seconds
 *
 *        required: true
 *        type: integer
 *      - name: creatorName
 *        description: Enter the creatorName from store
 *        required: true
 *        type: string
 *      - name: creatorUUID
 *        description: Enter the creatorUUID from store *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 10
/**
 * @swagger
 * /api/hostedchallenges:
 *   get:
 *     description: Get all the details of a challenge
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: Challenge details
 *
 */
// ROUTE 11
/**
 * @swagger
 * /api/newchallenges:
 *   get:
 *     description: Get all the details of a challenge
 *     parameters:
 *      - name: userUUID
 *        description: Enter the userUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: Challenges the user is able to join
 *
 */
// ROUTE 12
/**
 * @swagger
 * /api/activeuserchallenges:
 *   get:
 *     description: Get all the details of a challenge
 *     parameters:
 *      - name: userUUID
 *        description: Enter the userUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: Challenges the user is able to participate
 *
 */

// ROUTE 13
/**
 * @swagger
 * /api/completeduserchallenges:
 *   get:
 *     description: Get all the details of a challenge
 *     parameters:
 *      - name: userUUID
 *        description: Enter the userUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: Challenges the user has completed in the past
 *
 */
// ROUTE 14
/**
 * @swagger
 * /api/joinedchallenges:
 *   post:
 *     description: Post challenge info to DB
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *      - name: challengeUUID
 *        description: Enter the challengeUUID the user has to join *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 15
/**
 * @swagger
 * /api/challengeprogress:
 *   post:
 *     description: Post challenge progress info to DB. Push after every movement
 *     parameters:
 *      - name: userUUID
 *        description: Enter the userUUID*
 *        required: true
 *        type: string
 *      - name: date
 *        description: Enter the date*
 *        required: true
 *        type: date
 *      - name: exerciseName
 *        description: Enter the exerciseName *
 *        required: true
 *        type: string
 *      - name: reps
 *        description: Enter the reps of the exercise*
 *        required: true
 *        type: integer
 *      - name: time
 *        description: Enter the duration of the activity for time based movements*
 *        required: true
 *        type: integer
 *      - name: challengeExercises
 *        description: Enter the number of exercises in the challenge*
 *        required: true
 *        type: integer
 *      - name: exerciseDuration
 *        description: Enter the duration of the activity*
 *        required: true
 *        type: integer
 *     responses:
 *       200:
 *         description: Success
 */

// ROUTE 16
/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     description: Get all the details of a challenge
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: UserName,Reps and UserUUID
 *
 */
// ROUTE 17
/**
 * @swagger
 * /api/mystatsinfo:
 *   get:
 *     description: Get all the details for mystats page in challenge screen
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID*
 *        required: true
 *        type: string
 *      - name: userUUID
 *        description: Enter the userUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result:   graphData, exercisesData,
 *
 */
// ROUTE 18
/**
 * @swagger
 * /api/storechallengeimagewithkey:
 *   post:
 *     description: Post challenge info to DB
 *     parameters:
 *      - name: imageUUID
 *        description: Enter the challengeUUID *
 *        required: true
 *        type: string
 *      - name: imageKey
 *        description: Enter the image key for the challenge*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 */
// ROUTE 19
/**
 * @swagger
 * /api/challengeparticipants:
 *   get:
 *     description: Get all the number of participants in the challenge
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID*
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result:   graphData, exercisesData,
 *
 */
// ROUTE 20
/**
 * @swagger
 * /api/:
 *   get:
 *     description: Home route for all the APIs
 *     responses:
 *       200:
 *         description: HTML
 *
 *
 */
// ROUTE 21
/**
 * @swagger
 * /api/challengejoincheck:
 *   get:
 *     description: Check whether an user has joined a challenge or not
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID
 *        required: true
 *        type: string
 *      - name: userUUID
 *        description: Enter the userUUID
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result:  boolean,
 *
 */
// ROUTE 22
/**
 * @swagger
 * /api/userrank:
 *   get:
 *     description: Get the user rank for a particular challenge
 *     parameters:
 *      - name: challengeUUID
 *        description: Enter the challengeUUID
 *        required: true
 *        type: string
 *      - name: userUUID
 *        description: Enter the userUUID
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result:   number,
 *
 */

/**
 * @swagger
 * /api/authtrainer:
 *   get:
 *     description: See whether the trainer credentials are vaild or not
 *     parameters:
 *      - name: trainerUUID
 *        description: Enter the pulse.fit code given to trainer
 *        required: true
 *        type: string
 *      - name: trainerEmail
 *        description: Enter the email shared with pulse.fit
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description:  authorize -true
 *         authorize:   true,
 *
 */

/**
 * @swagger
 * /api/activetrainees:
 *   get:
 *     description: Details of all the trainees under a particular trainer
 *     parameters:
 *      - name: trainerUUID
 *        description: Enter the pulse.fit code given to trainer
 *        required: true
 *        type: string
 *      - name: trainerEmail
 *        description: Enter the email shared with pulse.fit
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description:  authorize -true
 *         authorize:   true,
 *
 */

/**
 * @swagger
 * /api/inactive:
 *   get:
 *     description: Details of all the inactive trainees under a particular trainer
 *     parameters:
 *      - name: trainerUUID
 *        description: Enter the pulse.fit code given to trainer
 *        required: true
 *        type: string
 *      - name: trainerEmail
 *        description: Enter the email shared with pulse.fit
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description:  authorize -true
 *         authorize:   true,
 *
 */

/**
 * @swagger
 * /api/traineeinfo:
 *   get:
 *     description: Get user related info
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User details (JSON)
 *
 */

/**
 * @swagger
 * /api/traineeprofileimage:
 *   get:
 *     description: Get user profile image
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User decoded image URL
 *
 */

/**
 * @swagger
 * /api/traineecurrentweekmodules:
 *   get:
 *     description: Get current week modules planned
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User details (JSON)
 *
 */

/**
 * @swagger
 * /api/traineepastweekmodules:
 *   get:
 *     description: Get past week modules
 *     parameters:
 *      - name: userUUID
 *        description: Enter the Store UserId *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Success
 *         result: User details (JSON)
 *
 */

/**
 * @swagger
 * /api/traineedetailspage:
 *   get:
 *     description: Get current, and past week workouts and plan static metadata
 *     parameters:
 *      - name: userUUID
 *        description: Enter the userUUID *
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: returns currentweekmodules(JSON) pastweekmodules(JSON) planStaticData(JSON) in result object
 *
 */

/**
 * @swagger
 * /api/getnotes:
 *   get:
 *     description: Get all the created notes for the client
 *     parameters:
 *      - name: userUUID
 *        required: true
 *        type: string
 *      - name: trainerUUID
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: returns result object
 *
 */

/**
 * @swagger
 * /api/addnote:
 *   post:
 *     description: Add a new note for the client
 *     parameters:
 *      - name: userUUID
 *        required: true
 *        type: string
 *      - name: trainerUUID
 *        required: true
 *        type: string
 *      - name: note
 *        required: true
 *        type: string
 *      - name: date
 *        description: use "YYYY-MM-DD" format
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: returns result object
 *
 */

/**
 * @swagger
 * /api/updatenote:
 *   post:
 *     description: Update an existing note
 *     parameters:
 *      - name: primaryKey
 *        required: true
 *        type: string
 *      - name: note
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: returns result object
 *
 */

/**
 * @swagger
 * /api/deletenote:
 *   post:
 *     description: Delete an existing note
 *     parameters:
 *      - name: primaryKey
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: returns result object
 *
 */
// active user badges
// inactive user badges for report and profile
// earned badges
// exercises
// workouts routes
// completed workouts -> account
