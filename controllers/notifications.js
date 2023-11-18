module.exports = (app, db, inDevMode, admin) => {
  const CronJob = require("cron").CronJob;
  const dailyNotificationISTForModule = () => {
    let sqlQuery = `SELECT Users.UserName, Users.FCMToken, Users.TimeZone,Programs.Name FROM Users,Programs WHERE Users.UserUUID = Programs.UserUUID AND Programs.ModuleDate=CURDATE() AND Programs.Complete = 0 AND INSTR(Users.TimeZone, 'Asia') > 0`;

    db.query(sqlQuery, async (err, result) => {
      if (err) {
        console.log(err, "line 168 trainers");
      }

      if (result.length > 0) {
        result.map(async (userDetails) => {
          let message = {
            token: userDetails.FCMToken,
            //   tokens: fcmToken,
            notification: {
              title: `Hello ${userDetails.UserName}`,
              body: `Let's crush your ${userDetails.Name} workout today!`,
            },
          };
          // console.log(message, "IND")
          await admin.messaging().send(message);
        });
      } else {
        return;
      }
    });
  };

  const dailyNotificationUSAForModule = () => {
    let sqlQuery = `SELECT Users.UserName, Users.FCMToken, Users.TimeZone,Programs.Name FROM Users,Programs WHERE Users.UserUUID = Programs.UserUUID AND Programs.ModuleDate=CURDATE() AND Programs.Complete = 0 AND INSTR(Users.TimeZone, 'America') > 0`;

    db.query(sqlQuery, async (err, result) => {
      if (err) {
        console.log(err, "line 168 trainers");
      }

      if (result.length > 0) {
        result.map(async (userDetails) => {
          let message = {
            token: userDetails.FCMToken,
            //   tokens: fcmToken,
            notification: {
              title: `Hello ${userDetails.UserName}`,
              body: `Let's crush your ${userDetails.Name} workout today!`,
            },
          };
          // console.log(message, "USA")
          await admin.messaging().send(message);
        });
      } else {
        return;
      }
    });
  };

  app.post("/api/addfcmtoken", (req, res) => {
    let params = {
      UserUUID: req.body.userUUID,
      FCMToken: req.body.fcmToken,
      TimeZone: req.body.timeZone,
    };
    let sqlQuery = `UPDATE Users SET FCMToken=?, TimeZone = ? WHERE UserUUID = ?`;
    db.query(
      sqlQuery,
      [params.FCMToken, params.TimeZone, params.UserUUID],
      (err, result) => {
        if (err) {
          res.status(400).json({ result: false });
          throw err;
        }
        console.log(result, params, "line 75 notifications");
        res.status(200).json({ status: "Success", result });
      }
    );
  });

  app.get("/api/sendnotifications", async (req, res) => {
    //   await admin.messaging().sendMulticast(message);
    dailyNotificationUSAForModule();
    dailyNotificationISTForModule();
    res.status(200).json({ status: "Success" });
    // await admin.messaging().send(message);
  });
  // ACTUAL
  new CronJob(
    "00 30 09 * * *",
    () => dailyNotificationISTForModule(),

    undefined,
    true,
    "Asia/Kolkata"
  );

  new CronJob(
    "00 00 22 * * *",
    () => dailyNotificationUSAForModule(),
    undefined,
    true,
    "Asia/Kolkata"
  );

  // TEST
  // new CronJob(
  //   "00 39 11 * * *",
  //   () => dailyNotificationISTForModule(),

  //   undefined,
  //   true,
  //   "Asia/Kolkata"
  // );

  // new CronJob(
  //   "00 39 11 * * *",
  //   () => dailyNotificationUSAForModule(),
  //   undefined,
  //   true,
  //   "Asia/Kolkata"
  // );

  app.get("/api/sendmanualnotification", async (req, res) => {
    //   await admin.messaging().sendMulticast(message);
    let message = {
      token: req.body.token,
      //   tokens: fcmToken,
      notification: {
        title: `Hello There`,
        body: `Let's crush your workout today!`,
        // meta: {
        //   ScreenName: "WorkoutExpanded",
        //   Name: "exerciseModule.Name",
        //   Level: null,
        //   DesignedBy: "planMetaData.TrainerName",
        //   Duration: "exerciseModule.ModuleDuration",
        //   ImageKey:
        //     "https://pulsefitpublicimages.s3-accelerate.amazonaws.com/gymworkout.jpg",
        //   Tags: "CrossFit",
        //   ExercisesUUID:  [
        //     {

        //         "exercise": "MyB4IFJvdW5kcyAKNSB4IFB1bGwgVXBzCjEwIHggUHVzaCBVcHMKMTUgeCBTcXVhdHMgCg==",
        //         "type":"AMRAP"
        //     },
        //        {

        //         "exercise": "MyB4IFJvdW5kcyAKNSB4IFB1bGwgVXBzCjEwIHggUHVzaCBVcHMKMTUgeCBCdXJwZWVzCjEwMCBYIEx1bmdlcyAK",
        //         "type":"EMOM"
        //     },

        //   {

        //         "exercise": "MTAgeCBSb3VuZHMgCjUgeCBQdWxsIFVwcwoxMCB4IFB1c2ggVXBzCjE1IHggQnVycGVlcwoxMDAgWCBMdW5nZXMgCg==",
        //         "type":"RFT"
        //     },

        //     {

        //         "exercise": "MyB4IFJvdW5kcyAKNSB4IFB1bGwgVXBzCjEwIHggUHVzaCBVcHMKMTUgeCBTcXVhdHMgCg==",
        //         "type":"Quality"
        //     }

        // ],
        //   WorkoutUUID: "exerciseModule.PrimaryKey",
        //   IsComplete: 0,
        //   CompletedExercises: null,
        //   CompletedDuration: null,
        //   Calories: 0,
        //   SkippedExercises: null,
        // },
      },
    };
    // console.log(message, "USA")
    let response = await admin.messaging().send(message);
    res.status(200).json({ status: response });
    // await admin.messaging().send(message);
  });
};
