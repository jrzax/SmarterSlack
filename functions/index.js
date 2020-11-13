const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkPViosTHWG15Jo5hxyYsQZ6O8RtupZYM",
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
exports.BadLanguage = functions.https.onRequest((request, response) => {
  const pottywords = ["butthead", "crap", "stupid"];
  if (request) {
    functions.logger.log("Here's the request:", request.body);
    console.log("A request");
    response.status(200).send(request.body);
    if (request.body.event.subtype == "bot_message") {
      return;
    } else {
      let message = request.body.event.text;
      for (let i = 0; i < pottywords.length; i++) {
        if (message.match(pottywords[i])) {
          axios
            .post("CHANGE ME", {
              text: `Rude word ${pottywords[i]} detected. Please consider using kinder language.`,
            })
            .then((res) => {
              functions.logger.log(`statusCode: ${res.statusCode}`);
              functions.logger.log(res);
            })
            .catch((error) => {
              functions.logger.log(error);
            });
          return;
        }
      }
    }
  } else {
    throw response.status(500);
  }
});

//Parse request.body to find USERID
// pull from db.collection("Users").doc(USERID) to get existing numMessages
//db.collection("Users").doc(USERID).add({numMessages: ##})

const db = admin.firestore();
const usersRef = db.collection("users");
exports.AlphaDomination = functions.https.onRequest(
  async (request, response) => {
    if (request) {
      functions.logger.log("NEW RUN STARTS HERE");
      functions.logger.log("Here's the request:", request.body);
      response.status(200).send(request.body);
      if (request.body.event.subtype == "bot_message") {
        return;
      } else {
        let userID = request.body.event.user; //get user id from sent message
        const userRef = db.collection("users").doc(userID);
        const doc = await userRef.get();

        if (!doc.exists) {
          console.log("No such document!");
          await usersRef.doc(userID).set({ numMessages: 1 });
        } else {
          await userRef.update({
            numMessages: admin.firestore.FieldValue.increment(1),
          });
          console.log("Document data:", doc.data());
          axios
            .post("CHANGE ME", {
              text: `Im a bot with a message. The last message user id is: ${userID}`,
            })
            .then((res) => {
              functions.logger.log(`statusCode: ${res.statusCode}`);
              functions.logger.log(res);
            })
            .catch((error) => {
              functions.logger.log(error);
            });
          return;
        }
      }
    } else {
      throw response.status(500);
    }
  }
);
