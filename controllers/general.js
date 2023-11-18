module.exports = (app, swaggerUI, swaggerDocs, inDevMode, db) => {
  const fs = require("fs");
  const path = require("path");
  const handlebars = require("handlebars");
  // const { google } = require("googleapis");
  // const { OAuth2 } = google.auth;
  // const credentials = require("../services/credentials.json");
  // const { client_secret, client_id, redirect_uris, refreshToken } =
  //   credentials.web;
  const { emailConfig } = require("../models/emailConfig");
  let { sendAwsEmail } = require("../models/awsS3");

  // const OAuth2Client = new OAuth2(client_id, client_secret);

  // OAuth2Client.setCredentials({
  //   refresh_token: refreshToken,
  // });

  // const calendar = google.calendar({ version: "v3", auth: OAuth2Client });

  app.get("/api/", (req, res) => {
    return res.render("index.html");
  });

  app.get("/api/privacy-policy", (req, res) => {
    return res.render("policy.html");
  });

  app.get("/api/success", (req, res) => {
    return res.render("success.html");
  });

  app.get("/api/appversion", async (req, res) => {
    let getAppVersionQuery = `SELECT * FROM AppVersion`;

    await db.query(getAppVersionQuery, (err, result) => {
      if (err) {
        res.status(400).send("<h1>Failure to push</h1>");
        throw err;
      }

      res.status(200).json({
        result: {
          ios: result[0].IOSVERSION,
          android: result[0].ANDROIDVERSION,
        },
      });
    });

    // }
  });
  // // SQLquery

  app.post("/api/appversion", (req, res) => {
    let params = {
      Name: "AppVersion",
      iOSversion: req.body.iOSversion,
      androidVersion: req.body.androidVersion,
    };
    let sqlQuery = `INSERT INTO AppVersion (Name, IOSVERSION, ANDROIDVERSION) VALUES (? , ? , ?) ON DUPLICATE KEY UPDATE IOSVERSION=?, ANDROIDVERSION=?`;

    db.query(
      sqlQuery,
      [
        params.Name,
        params.iOSversion,
        params.androidVersion,
        params.iOSversion,
        params.androidVersion,
      ],
      async (err, result) => {
        if (err) {
          res.status(400).send("<h1>Failure to fetch</h1>");
          throw err;
        }

        res.status(200).send({ result: "Updated" });
      }
    );
  });

  app.get("/api/canceled", (req, res) => {
    return res.render("cancel.html");
  });
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

  app.post("/api/signupemail", (req, res) => {
    let userDetails = {
      userName: req.body.userName,
      email: [req.body.email, "support@pulse.fit"],
      date: req.body.date,
      time: req.body.time,
    };
    const filePath = path.join(__dirname, "../views/userEmailTemplate.html");
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      Username: userDetails.userName,
      Date: userDetails.date,
      Time: userDetails.time,
    };

    const htmlToSend = template(replacements);

    const subject = `Welcome to pulse.fit`;
    const emailAddress = userDetails.email;
    sendAwsEmail(subject, emailAddress, htmlToSend)
      .then((success) => res.status(200).json({ status: "success" }))
      .catch((err) => res.status(400).json({ status: err }));
  });

  app.post("/api/booktrainerslot", (req, res) => {
    let eventDetails = {
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      summary: req.body.summary,
      location: req.body.location,
      description: req.body.description,
      timeZone: req.body.timeZone,
      userEmail: req.body.userEmail,
      trainerEmail: req.body.trainerEmail,
    };

    const event = {
      summary: eventDetails.summary,
      location: eventDetails.location,
      description: eventDetails.description,
      // start: {
      //   dateTime: "2021-09-27T09:00:00-07:00",
      //   timeZone: "America/Los_Angeles",
      // },
      // end: {
      //   dateTime: "2021-09-27T10:00:00-07:00",
      //   timeZone: "America/Los_Angeles",
      // },

      start: {
        dateTime: eventDetails.startTime,
        timeZone: eventDetails.timeZone,
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: eventDetails.timeZone,
      },

      attendees: [
        { email: eventDetails.userEmail },
        { email: eventDetails.trainerEmail },
        { email: "support@pulse.fit" },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `${Math.random() * 100 + Math.floor(Math.random() * 500)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    // calendar.events.insert(
    //   {
    //     calendarId: "primary",
    //     resource: event,
    //   },
    //   (err, event) => {
    //     if (err) {
    //       res.status(400).json({ error: err });
    //       return;
    //     }
    //     res.status(200).json({ status: event });
    //   }
    // );

    console.log("Pause, line 130 general");
  });

  app.post("/api/traineesignupmail", (req, res) => {
    let trainerDetails = {
      trainerName: req.body.trainerName,
      email: req.body.email,
      date: req.body.date,
      time: req.body.time,
    };

    let userDetails = {
      userName: req.body.userName,
      gender: req.body.gender,
      age: req.body.age,
      height: req.body.height,
      weight: req.body.weight,
      goal: req.body.goal,
      profession: req.body.profession,
      activityLevel: req.body.activityLevel,
      specialCircumstances: req.body.specialCircumstances,
      daysPerWeek: req.body.daysPerWeek,
      personalCoaching: req.body.personalCoaching,
      timeZone: req.body.timeZone,
    };

    const filePath = path.join(
      __dirname,
      "../views/emailToTrainerPostSignUp.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      Trainer: trainerDetails.trainerName,
      Date: trainerDetails.date,
      Time: trainerDetails.time,
      UserName: userDetails.userName,
      Gender: userDetails.gender,
      Age: userDetails.age,
      Height: userDetails.height,
      Weight: userDetails.weight,
      Goal: userDetails.goal,
      Profession: userDetails.profession,
      ActivityLevel: userDetails.activityLevel,
      SpecialCircumstances: userDetails.specialCircumstances,
      Days: userDetails.daysPerWeek,
      PersonalCoaching: req.body.personalCoaching,
      TimeZone: userDetails.timeZone,
    };

    const htmlToSend = template(replacements);

    const subject = `Yay! We found you a new trainee`;
    const emailAddress = [trainerDetails.email, "coach@pulse.fit"];
    sendAwsEmail(subject, emailAddress, htmlToSend)
      .then((success) => res.status(200).json({ status: "success" }))
      .catch((err) => res.status(400).json({ status: err }));
  });

  // app.get("/api/uploadchallenges", (req, res) => {
  //   return  res.render("challenges/challengeupload.html");
  // });

  const checkDateTime = (dateTime) => {
    let date = new Date(dateTime);
    if (Date.now() - date <= 5 * 60 * 1000) {
      return true;
    } else {
      return false;
    }
  };
  const updatePostWorkoutLog = (postWorkoutLog, email) => {
    let sqlQueryToUpdate = `UPDATE Trainers SET Postworkoutlog = ? WHERE Email = ?`;
    db.query(sqlQueryToUpdate, [postWorkoutLog, email], (err, result) => {
      if (err) {
        return err;
      }
    });
  };
  const sendPostWorkoutEmail = (email, userName, replacements) => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(
        __dirname,
        "../views/postWorkoutEmailToTrainer.html"
      );
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const htmlToSend = template(replacements);
      const subject = `Workout report for ${userName}`;
      const emailAddress = [email, "coach@pulse.fit"];
      sendAwsEmail(subject, emailAddress, htmlToSend)
        .then((success) => resolve(success))
        .catch((err) => reject(err));
    });
  };

  app.post("/api/postworkoutemail", (req, res) => {
    let sqlQuery = `SELECT * FROM Trainers WHERE Email=?`;
    let trainerDetails = {
      trainerName: req.body.trainerName,
      email: req.body.email,
      date: req.body.date,
    };

    let userDetails = {
      userName: req.body.userName,
      startTime: req.body.startTime,
      actualDuration: req.body.actualDuration,
      plannedDuration: req.body.plannedDuration,
      actualDone: req.body.actualDone,
      plannedExercises: req.body.plannedExercises,
      skippedExercise: req.body.plannedExercises - req.body.actualDone,
      completedExercisesList: req.body.completedExercisesList,
      skippedExercisesList: req.body.skippedExercisesList,
    };

    const replacements = {
      Trainer: trainerDetails.trainerName,
      Date: trainerDetails.date,
      Time: trainerDetails.time,
      UserName: userDetails.userName,
      StartTime: userDetails.startTime,
      ActualDuration: userDetails.actualDuration,
      PlannedDuration: userDetails.plannedDuration,
      ActualDone: userDetails.actualDone,
      PlannedExercises: userDetails.plannedExercises,
      ExerciseSkipped: userDetails.skippedExercise,
      SkippedExercises: userDetails.skippedExercisesList,
      CompletedExercises: userDetails.completedExercisesList,
    };

    db.query(sqlQuery, trainerDetails.email, (err, [result]) => {
      if (err) {
        res.status(400).send("<h1>Failure to fetch the trainer Details</h1>");
        throw err;
      }
      let sendNewEmail = false;
      let usersData = [];

      let currDate = new Date();
      if (result.Postworkoutlog) {
        usersData = JSON.parse(result.Postworkoutlog);
        let userLogData = usersData.find(
          (data) => data.userName === userDetails.userName
        );
        if (!userLogData) {
          sendNewEmail = true;
          usersData = [
            ...usersData,
            { userName: userDetails.userName, dateTime: currDate },
          ];
        } else {
          if (!checkDateTime(userLogData.dateTime)) {
            sendNewEmail = true;
            const index = usersData.findIndex(
              (item) => item.userName == userDetails.userName
            );
            usersData[index].dateTime = currDate;
          }
        }
      } else {
        sendNewEmail = true;
        usersData = [
          ...usersData,
          { userName: userDetails.userName, dateTime: currDate },
        ];
      }

      if (sendNewEmail) {
        updatePostWorkoutLog(JSON.stringify(usersData), trainerDetails.email);
        sendPostWorkoutEmail(
          trainerDetails.email,
          userDetails.userName,
          replacements
        )
          .then(() => res.status(200).json({ status: "success" }))
          .catch((err) => res.status(400).json({ status: err }));
      } else {
        res.status(400).send("repeating the email for the same username");
      }
    });
  });

  const sendTraineeEmail = (detail) => {
    return new Promise(function (resolve, reject) {
      let trainerDetails = {
        trainerName: detail.trainerName,
        userEmail: detail.userEmail,
        userName: detail.userName,
        trainerEmail: detail.trainerEmail,
        trainerURL: detail.trainerURL,
      };

      const filePath = path.join(__dirname, "../views/addTrainee.html");
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        UserName: trainerDetails.userName,
        TrainerName: trainerDetails.trainerName,
        TrainerURL: trainerDetails.trainerURL,
      };

      const htmlToSend = template(replacements);
      const subject = `${trainerDetails.userName} you are invited to join ${trainerDetails.trainerName} coaching program`;
      const emailAddress = [
        trainerDetails.userEmail,
        trainerDetails.trainerEmail,
      ];
      sendAwsEmail(subject, emailAddress, htmlToSend)
        .then((success) => resolve(success))
        .catch((err) => reject(err));
    });
  };
  app.post("/api/addtraineeemail", (req, res) => {
    const details = req.body;
    Promise.all(
      details.map(async (detail) => {
        await sendTraineeEmail(detail);
      })
    )
      .then(() => res.status(200).json({ status: "success" }))
      .catch((err) => {
        res.status(400).json({ status: err });
      });
  });

  const endOfDayForTrainers = () => {
    let sqlQuery = `SELECT ProgramsStaticData.TrainerEmail, ProgramsStaticData.TrainerName, ProgramsStaticData.UserName FROM ProgramsStaticData,Programs WHERE ProgramsStaticData.UserUUID = Programs.UserUUID AND Programs.ModuleDate=CURDATE() AND Programs.Complete = 0`;
    db.query(sqlQuery, async (err, result) => {
      if (err) {
        console.log(err, "line 168 trainers");
      }

      if (result.length > 0) {
        result.map((programData) => {
          let trainerDetails = {
            trainerName: programData.TrainerName,
            email: programData.TrainerEmail,
          };

          let userDetails = {
            userName: programData.UserName,
          };
          let senderDetails = {
            email: "support@pulse.fit",
          };
          const filePath = path.join(
            __dirname,
            "../views/noWorkoutEmailToTrainer.html"
          );
          const source = fs.readFileSync(filePath, "utf-8").toString();
          const template = handlebars.compile(source);
          const replacements = {
            Trainer: trainerDetails.trainerName,
            UserName: userDetails.userName,
          };

          const htmlToSend = template(replacements);

          const subject = `Your trainee ${userDetails.userName} missed a workout`;
          const emailAddress = [trainerDetails.email, "coach@pulse.fit"];
          sendAwsEmail(subject, emailAddress, htmlToSend)
            .then((success) => res.status(200).json({ status: "success" }))
            .catch((err) => res.status(400).json({ status: err }));
        });
      } else {
        console.log("No data");
        return;
      }
    });
  };

  const weeklyOnceForTrainers = () => {
    // let sqlQuery = `SELECT * FROM Programs WHERE WEEK(ModuleDate)=WEEK(CURDATE()) ORDER BY ModuleDate ASC`;

    let sqlQuery = `SELECT UserUUID, SUM(Complete), COUNT(ModuleDate) FROM Programs WHERE WEEK(ModuleDate)=WEEK(SUBDATE(CURDATE(),1)) GROUP BY UserUUID`;
    db.query(sqlQuery, async (err, result) => {
      if (err) {
        console.log(err, "line 168 trainers");
      }
      if (result.length > 0) {
        result.map((weeklySummary) => {
          let sqlQueryForProgramMetaData = `SELECT TrainerName, TrainerEmail,UserName From ProgramsStaticData WHERE UserUUID = ? AND IsActive=?`;

          db.query(
            sqlQueryForProgramMetaData,
            [weeklySummary.UserUUID, true],
            async (err, resultFromProgramStaticData) => {
              let todayDate = new Date();
              let dateVal = new Date();
              let startDate = new Date(dateVal.setDate(dateVal.getDate() - 7));
              let trainerDetails = {
                trainerName: resultFromProgramStaticData[0].TrainerName,
                email: resultFromProgramStaticData[0].TrainerEmail,
                date: todayDate.toISOString().slice(0, 10),
                startDate: startDate.toISOString().slice(0, 10),
              };

              let userDetails = {
                userName: resultFromProgramStaticData[0].UserName,
              };

              let senderDetails = {
                email: "support@pulse.fit",
              };
              const filePath = path.join(
                __dirname,
                "../views/weeklyWorkoutSummary.html"
              );
              const source = fs.readFileSync(filePath, "utf-8").toString();
              const template = handlebars.compile(source);
              const replacements = {
                TrainerName: trainerDetails.trainerName,
                UserName: userDetails.userName,
                StartDate: trainerDetails.StartDate,
                EndDate: trainerDetails.date,
                PlannedWorkoutDays: weeklySummary["COUNT(ModuleDate)"],
                ActualWorkoutDays: weeklySummary["SUM(Complete)"],
                AdherenceVal: Math.floor(
                  (weeklySummary["SUM(Complete)"] * 100) /
                    weeklySummary["COUNT(ModuleDate)"]
                ),
                TodayDate: trainerDetails.date,
              };

              const htmlToSend = template(replacements);
              const subject = `Your trainee ${userDetails.userName} weekly report`;
              const emailAddress = [trainerDetails.email, "ram.n@pulse.fit"];
              sendAwsEmail(subject, emailAddress, htmlToSend)
                .then((success) => res.status(200).json({ status: "success" }))
                .catch((err) => res.status(400).json({ status: err }));
            }
          );
        });
      } else {
        console.log("No data");
        return;
      }
    });
  };

  const CronJob = require("cron").CronJob;
  // PUSH THIS TO TRAINER AT END OF THE DAY

  // RUNS EVERY 1 SECOND
  // const job = new CronJob("*/10 * * * * *", function () {
  //   const d = new Date();
  //   endOfDayForTrainers();
  //   // console.log("Every Second:", d); //Write custom function
  // });

  // RUNS AT 8 PM IST
  new CronJob(
    "00 00 20 * * *",
    function () {
      endOfDayForTrainers();
    },
    undefined,
    true,
    "America/Los_Angeles"
  );

  // RUNS AT 5 PM IST
  //   new CronJob("00 16 16 * * *", function() {
  //     endOfDayForTrainers();
  // }, undefined, true, "Asia/Kolkata");

  // job.start();

  // RUNS AT 10 AM ON SUNDAY
  new CronJob(
    "00 00 10 * * SUN",
    () => weeklyOnceForTrainers(),
    undefined,
    true,
    "Asia/Kolkata"
  );
};

{
  /* <div
class="u-row-container"
style="padding: 0px; background-color: transparent"
>
<div
  class="u-row"
  style="
    margin: 0 auto;
    min-width: 320px;
    max-width: 600px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    background-color: transparent;
  "
>
  <div
    style="
      border-collapse: collapse;
      display: table;
      width: 100%;
      background-color: transparent;
    "
  >
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
 
    <!--[if (mso)|(IE)]><td align="center" width="292" style="background-color: #ffffff;width: 292px;padding: 0px 10px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
    <div
    
      style="                     
        vertical-align: top;
      "
    >
      <div
        style="
          background-color: #ffffff;
          width: 100% !important;
          border-radius: 0px;
          -webkit-border-radius: 0px;
          -moz-border-radius: 0px;
        "
      >
        <!--[if (!mso)&(!IE)]><!-->
        <div
          style="
            padding: 0px 10px 0px 0px;
            border-top: 0px solid transparent;
            border-left: 0px solid transparent;
            border-right: 0px solid transparent;
            border-bottom: 0px solid transparent;
            border-radius: 0px;
            -webkit-border-radius: 0px;
            -moz-border-radius: 0px;
          "
        >
          <!--<![endif]-->
 
          <table
            style="font-family: 'Cabin', sans-serif"
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            border="0"
          >
            <tbody>
              <tr>
                <td
                  style="
                    overflow-wrap: break-word;
                    word-break: break-word;
                    padding: 10px 1px 10px 20px;
                    font-family: 'Cabin', sans-serif;
                  "
                  align="left"
                >
                  <div
                    style="
                      line-height: 180%;
                      text-align: left;
                      word-wrap: break-word;
                    "
                  >
                 
                  <ul>
                    {{#each CompletedExercises}}
                        <li><strong
                          ><span
                            style="
                              font-size: 16px;
                              line-height: 28.8px;
                              color: #ff9800;
                              margin-right: 20px;
                            "
                            >
                            {{ this.exercise }}
                            </span
                          ></strong> <span style="font-size: 14px; margin-right: 10px; font-weight: 900">Reps : </span><strong
                          ><span
                            style="
                              font-size: 16px;
                              line-height: 28.8px;
                              color: #ff9800;
                              margin-right: 20px;
                            "
                            >
                            {{this.reps}}
                            </span
                          ></strong>
<span style="font-size: 14px; margin-right: 10px; font-weight: 900">Weight : </span><strong
><span
style="
font-size: 16px;
line-height: 28.8px;
color: #ff9800;
margin-right: 20px;
"
>
{{this.weights}}
</span
></strong>
 
<span style="font-size: 14px; margin-right: 10px;">{{this.weightUnits}}</span>
 
<span style="font-size: 14px; margin-right: 10px; font-weight: 900">Duration : </span><strong
<strong
><span
style="
font-size: 16px;
line-height: 28.8px;
color: #ff9800;
margin-right: 20px;
"
>
{{this.duration}}
</span
></strong>
<span style="font-size: 14px">Seconds</span> </li>
                    {{/each}}
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!--[if (!mso)&(!IE)]><!-->
        </div>
        <!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
    <!--[if (mso)|(IE)]><td align="center" width="104" style="background-color: #ffffff;width: 104px;padding: 0px 0px 0px 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
  
 
<div
class="u-row-container"
style="padding: 0px; background-color: transparent"
>
<div
  class="u-row"
  style="
    margin: 0 auto;
    min-width: 320px;
    max-width: 600px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    background-color: transparent;
  "
>
  <div
    style="
      border-collapse: collapse;
      display: table;
      width: 100%;
      background-color: transparent;
    "
  >
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
 
    <!--[if (mso)|(IE)]><td align="center" width="600" style="background-color: #ffffff;width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
    <div
      class="u-col u-col-100"
      style="
        max-width: 320px;
        min-width: 600px;
        display: table-cell;
        vertical-align: top;
      "
    >
      <div
        style="
          background-color: #ffffff;
          width: 100% !important;
          border-radius: 0px;
          -webkit-border-radius: 0px;
          -moz-border-radius: 0px;
        "
      >
        <!--[if (!mso)&(!IE)]><!-->
        <div
          style="
            padding: 0px;
            border-top: 0px solid transparent;
            border-left: 0px solid transparent;
            border-right: 0px solid transparent;
            border-bottom: 0px solid transparent;
            border-radius: 0px;
            -webkit-border-radius: 0px;
            -moz-border-radius: 0px;
          "
        >
          <!--<![endif]-->
 
          <table
            style="font-family: 'Cabin', sans-serif"
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            border="0"
          >
            <tbody>
              <tr>
                <td
                  style="
                    overflow-wrap: break-word;
                    word-break: break-word;
                    padding: 10px 10px 10px 55px;
                    font-family: 'Cabin', sans-serif;
                  "
                  align="left"
                >
                  <div
                    style="
                      line-height: 140%;
                      text-align: center;
                      word-wrap: break-word;
                    "
                  >
                    <p
                      style="
                        font-size: 14px;
                        line-height: 140%;
                        text-align: center;
                      "
                    >
                      <span
                        style="
                          font-size: 14px;
                          line-height: 19.6px;
                        "
                        ><strong
                          ><span
                            style="
                              font-size: 18px;
                              line-height: 25.2px;
                              color: #040f2e;
                            "
                            >Skipped Exercises:</span
                          ></strong
                        >
                      </span>
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!--[if (!mso)&(!IE)]><!-->
        </div>
        <!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>
</div>
 
<div
class="u-row-container"
style="padding: 0px; background-color: transparent"
>
<div
  class="u-row"
  style="
    margin: 0 auto;
    min-width: 320px;
    max-width: 600px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    background-color: transparent;
  "
>
  <div
    style="
      border-collapse: collapse;
      display: table;
      width: 100%;
      background-color: transparent;
    "
  >
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
 
    <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px 10px 0px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
    <div
      class="u-col u-col-50"
      style="
        max-width: 320px;
        min-width: 300px;
        display: table-cell;
        vertical-align: top;
      "
    >
      <div
        style="
          background-color: #ffffff;
          width: 100% !important;
          border-radius: 0px;
          -webkit-border-radius: 0px;
          -moz-border-radius: 0px;
        "
      >
        <!--[if (!mso)&(!IE)]><!-->
        <!-- <div
          style="
            padding: 0px 10px 0px 0px;
            border-top: 0px solid transparent;
            border-left: 0px solid transparent;
            border-right: 0px solid transparent;
            border-bottom: 0px solid transparent;
            border-radius: 0px;
            -webkit-border-radius: 0px;
            -moz-border-radius: 0px;
          "
        >
          <!--<![endif]-->
 
          <table
            style="font-family: 'Cabin', sans-serif"
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            border="0"
          >
            <tbody>
              <tr>
                <td
                  style="
                    overflow-wrap: break-word;
                    word-break: break-word;
                    padding: 10px 1px 10px 20px;
                    font-family: 'Cabin', sans-serif;
                  "
                  align="left"
                >
                  <div
                    style="
                      line-height: 180%;
                      text-align: left;
                      word-wrap: break-word;
                    "
                  >
                  <ul>
                    {{#each SkippedExercises}}
                        <li style="font-size: 14px;">{{ this.exercise }}</li>
                    {{/each}}
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!--[if (!mso)&(!IE)]><!-->
        </div> -->
        <!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
    <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px 0px 0px 10px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
 
    <!--[if (mso)|(IE)]></td><![endif]-->
    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
  </div>
</div>
</div> */
}
