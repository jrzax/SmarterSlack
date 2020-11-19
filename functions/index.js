const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "CHANGE ME",
  authDomain: "smarter-teams-in-slack.firebaseapp.com",
  databaseURL: "https://smarter-teams-in-slack.firebaseio.com",
  projectId: "smarter-teams-in-slack",
  storageBucket: "smarter-teams-in-slack.appspot.com",
  messagingSenderId: "962397678883",
  appId: "1:962397678883:web:13b2cbd41ee28b11b2f096",
  measurementId: "G-6D38KCBDHW",
};

admin.initializeApp(firebaseConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
//Parse request.body to find USERID
// pull from db.collection("Users").doc(USERID) to get existing numMessages
//db.collection("Users").doc(USERID).add({numMessages: ##})

const db = admin.firestore();


exports.AlphaDomination = functions.https.onRequest(
  async (request, response) => {

    const usersRef = db.collection("users");
    const channelsRef = db.collection("channels");
    const pottywords = ["butthead", "crap", "stupid"];

    if (request) {
      functions.logger.log("NEW RUN STARTS HERE");
      // functions.logger.log("Here's the request:", request.body);
      if (request.body.event.subtype == "bot_message") {
        return;
      } else {
        let userID = request.body.event.user; //get user id from sent message
        let channelName = request.body.event.channel; //new doc being created for new channel
        
        //BAD LANGUAGE STUFF
        let message = request.body.event.text;
        let badWordsCount = 0;
        for (let i = 0; i < pottywords.length; i++) {
          if (message.match(pottywords[i])) {
            badWordsCount += 1;
          } 
        }
        const userRef = db.collection("users").doc(userID);
        userRef.get().then((docSnapshot) => {
          if (docSnapshot.exists) {
            userRef.update({
              numMessages: admin.firestore.FieldValue.increment(1),
              numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
            })
          } else {
            userRef
            .set({ numMessages: 0, numBadWords: badWordsCount });
          }
        })

        const channelRef = db.collection("channels").doc(channelName);
        await channelRef.get().then((docSnapshot) => {
          if (docSnapshot.exists) {
            channelRef.update({
              numMessages: admin.firestore.FieldValue.increment(1)
            })
          } else {
            channelRef
            .set({ numMessages: 1 });
          }
        })

        response.status(200).send(request.body);
      }
    } else {
      throw response.status(500);
    }
  }
);

 // console.log("Document data:", doc.data());
          // axios
          //   .post("CHANGE ME", {
          //     text: `Im a bot with a message. The last message user id is: ${userID}`,
          //   })
          //   .then((res) => {
          //     functions.logger.log(`statusCode: ${res.statusCode}`);
          //     functions.logger.log(res);
          //   })
          //   .catch((error) => {
          //     functions.logger.log(error);
          //   });