const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
const moment = require('moment');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://notifly-dbce7.firebaseio.com"
});

exports.createAdminAccount = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        const schedules = [
            {
              id: Math.floor(Math.random()*(999-100+1)+100).toString(),
              title: 'default'
            }
        ];
        const settings = {
            startTime: '8:00 am',
            endTime: '6:00 pm',
            maxScheduledTime: '2',
            maxChangeTime: '3',
            maxEvents: '1',
            timeSplit: '15'
        }

        admin.database().ref(`/users/${uid}`).set({ schedules, settings }).then(response => {
            res.status(200).json('Success');
        })
        .catch((err) => {
            res.status(200).json('Error');
        });
    })
});

exports.updateAdminSchedule = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        const body = req.body;
        const { schedules } = body;
        admin.database().ref(`/users/${uid}`).update({ schedules }).then(response => {
            res.status(200).json('Success');
        })
        .catch((err) => {
            res.status(200).json('Error');
        });
    })
});

exports.updateAdminSettings = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        const body = req.body;
        const { settings } = body;
        admin.database().ref(`/users/${uid}`).update({ settings }).then(response => {
            res.status(200).json('Success');
        })
        .catch((err) => {
            res.status(200).json('Error');
        });
    })
});

exports.updateUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const userUid = req.query.uid;
        const body = req.body;
        const { user, adminUid } = body;
        admin.database().ref(`/users/${adminUid}/settings/users/${userUid}`).update({ language: user.language, userEmail: user.userEmail, userName: user.userName, userPhoneNumber: user.userPhoneNumber }).then(response => {
            res.status(200).json('Success');
        })
        .catch((err) => {
            res.status(200).json('Error');
        });
    })
});

exports.createUserAccount = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        const body = req.body;
        const { adminUid, userName, userEmail, userPhoneNumber, language } = body;
        admin.database().ref(`/users/${adminUid}/settings/users/${uid}`).set({ userName, userEmail, userPhoneNumber, language }).then(response => {
            res.status(200).json('Success');
        }).catch((err) => {
            res.status(200).json('Error');
        });
    })  
});

exports.notifications = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.database().ref(`/users/`).once('value').then(snapshot => {
            const users = snapshot.val();
            const usersKeys = Object.keys(users);
            for(let i = 0; i < usersKeys.length; i++){
                const userKey = usersKeys[i]
                const user = users[userKey];
                const schedules = user.schedules;
                for(let j = 0; j < schedules.length; j++){
                    const schedule = schedules[j];
                    const events = schedule.events;
                    for(k = 0; k < events.length; k++){
                        const event = events[k];
                        const eventStartTime = new Date(event.start);
                        const currentDate = new Date();
                        const maxStartTime = new Date();
                        maxStartTime.setMinutes(currentDate.getMinutes() + 60);
                        if(schedule.title !== event.createdBy && currentDate <= eventStartTime && maxStartTime >= eventStartTime && (event.notificationSent === undefined || !event.notificationSent)) {
                            admin.database().ref(`/users/${userKey}/schedules/${j}/events/${k}`).update({ notificationSent: true }).then(() => {
                                console.log('send email');
                            });
                        }
                        else if (schedule.title !== event.createdBy && currentDate > eventStartTime) {
                            admin.database().ref(`/users/${userKey}/schedules/${j}/events/${k}`).update({ notificationSent: false }).then(() => {
                                console.log('reset');
                            });
                        }
                    }
                }
            }
            res.status(200).json('Success');
        });
    })
});