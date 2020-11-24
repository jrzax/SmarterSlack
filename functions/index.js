const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "Change Me (Get From Firebase project settings)",
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
    var today = new Date();

    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    const pottywords = ["butthead", "crap", "stupid"];

    if (request) {
      functions.logger.log("NEW RUN STARTS HERE");
      functions.logger.log("Here's the request:", request.body);
      if (request.body.event.subtype == "bot_message") {
        response.status(200).send(request.body)
        return;
      } else {
        functions.logger.log(request)
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

        functions.logger.log(today)

        //This function is now a beast. First we set userRef to be the document in the users collection
        // with this current userID
        const userRef = db.collection("users").doc(userID);

        //We then check to see if the user's history collection has a document with todays date
        // oof, I know. Check the firestore to see the structure
        userRef.collection('history').where('date', '==', today).get().then((querySnapshot) => {
          let found = false
          //Looping through matching documents. there should only be one
          querySnapshot.forEach((doc) => {
            found = true
            //updating daily message total
            userRef.collection('history').doc(doc.id).update({
              numMessages: admin.firestore.FieldValue.increment(1),
              numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
            })

            //updating total user message total
            userRef.update({
              numMessages: admin.firestore.FieldValue.increment(1),
              numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
            })
          });

          //If there are no documents with the matching day, the user hasn't messaged on that day
          // OR the user doesn't exist
          if (!found) {
            //We need to get the user document to see if it exists
            userRef.get().then((snapshot) => {

              //Testing to see if the user exists
              if (snapshot.exists) {
                //User exists, update add a document for a new day, update total counts
                userRef.collection('history').add({
                  numMessages: 1, numBadWords: badWordsCount, date: today
               })
               userRef.update({
                 numMessages: admin.firestore.FieldValue.increment(1),
                 numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
               })
              } else {
                functions.logger.log("no user")
                //user is not found, we need to make a new one, initializing counts
                userRef.set({
                  numMessages: 1,
                  numBadWords: badWordsCount
                })
                //now adding a document for new day in user's history collection
                userRef
                  .collection('history')
                  .add({ numMessages: 1, numBadWords: badWordsCount, date: today });
              }
            })
          }
        }).catch((error) => {
          functions.logger.log(error)
        })

        //This Literally repeats the same code done above, the only difference is this time
        // we use channelRef, to change where we are looking in firebase
        const channelRef = db.collection("channels").doc(channelName);
        channelRef.collection('history').where('date', '==', today).get().then((querySnapshot) => {
          let found = false
          querySnapshot.forEach((doc) => {
            found = true
            channelRef.collection('history').doc(doc.id).update({
              numMessages: admin.firestore.FieldValue.increment(1),
              numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
            })
            channelRef.update({
              numMessages: admin.firestore.FieldValue.increment(1),
              numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
            })
          });
          if (!found) {
            channelRef.get().then((snapshot) => {
              //Testing to see if the channel exists
              if (snapshot.exists) {
                channelRef.collection('history').add({
                  numMessages: 1, numBadWords: badWordsCount, date: today
               })
               channelRef.update({
                 numMessages: admin.firestore.FieldValue.increment(1),
                 numBadWords: admin.firestore.FieldValue.increment(badWordsCount)
               })
              } else {
                //channel is not found, we need to make a new one
                functions.logger.log("no channel")
                channelRef.set({
                  numMessages: 1,
                  numBadWords: badWordsCount
                })
                channelRef
                  .collection('history')
                  .add({ numMessages: 1, numBadWords: badWordsCount, date: today });
              }
            })
          }
        }).catch((error) => {
          functions.logger.log(error)
        })

        response.status(200).send(request.body);
      }
    } else {
      throw response.status(500);
    }
  }
);

exports.SmartReport = functions.https.onRequest(
  async (request, response) => {
    if (request){
      functions.logger.log("Here's the request:", request.body)
      console.log("A request")

      const usersRef = db.collection('users')

      let result_numMessages = {}
      let result_badWords = {}

      await usersRef.get().then(querySnapshot => {

        // let result = {userID: [10, 9]}
        // result[userId][0]
        // to get userId result[0]
        querySnapshot.forEach((doc) => {
          let data = doc.data()
          result_numMessages[doc.id] = data.numMessages
          result_badWords[doc.id] = data.numBadWords
        });

      }).catch((error) => {
        functions.logger.log(error)
        result = false
      })

      var keyValues_badWords = []
      for (var key in result_numMessages) {
        keyValues_badWords.push([ key, result_badWords[key]])}

      var keyValues_numMessages = []
      for (var key in result_numMessages) {
        keyValues_numMessages.push([ key, result_numMessages[key]])}

      // console.log(keyValues_numMessages)
      // console.log(keyValues_badWords)


      keyValues_badWords.sort(function compare(kv1, kv2) {
        return kv2[1] - kv1[1]})
      let new_text = '*Bad Words Ranking: *';
      for (var i=0; i<keyValues_badWords.length; i++)
        {
          new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_badWords[i][0]) + '>' + ' has ' + String(keyValues_badWords[i][1]) + ' messages with foul language';
        }


      keyValues_numMessages.sort(function compare(kv1, kv2) {
        return kv2[1] - kv1[1]})
      new_text = new_text + '\n' + '\n' + '*Alpha Domination Ranking: *'
      for (var i=0; i<keyValues_numMessages.length; i++)
        {
          new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_numMessages[i][0]) + '>' + ' has spoken ' + String(keyValues_numMessages[i][1]) + ' times';
        }

      keyValues_numMessages.sort(function compare(kv1, kv2) {
          return kv1[1] - kv2[1]})
      new_text = new_text + '\n' + '\n' + '*Speak Up Ranking: *'
      for (var i=0; i<keyValues_numMessages.length; i++)
          {
            new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_numMessages[i][0]) + '>' + ' has spoken ' + String(keyValues_numMessages[i][1]) + ' times';
          }

      // functions.logger.log(result)
      // result.sort((a,b) => {
      //   return a[0] - b[0]
      // })

      // let alphaList = result

      // result.sort((a,b) => {
      //   return a[1] - b[1]
      // })

      // let badList = result

      // let new_text = 'Speak Up Ranking: ';
      // for (var i=0; i<keyValues_numMessages.length; i++)
      //   {
      //     new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_numMessages[i][0]) + '>' + ' has a score of ' + String(keyValues_numMessages[i][1]);
      //   }
      // new_text = new_text + '\n' + '\n' + 'Alpha Domination Ranking: '
      // for (var i=0; i<keyValues_numMessages_Alpha.length; i++)
      //   {
      //     new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_numMessages_Alpha[i][0]) + '>' + ' has a score of ' + String(keyValues_numMessages_Alpha[i][1]);
      //   }
      // new_text = new_text + '\n' + '\n' + 'Bad Language Ranking: '
      // for (var i=0; i<keyValues_badWords.length; i++)
      //   {
      //     new_text = new_text + '\n' + String(i+1) + '. ' + '<@' + String(keyValues_badWords[i][0]) + '>' + ' has a score of ' + String(keyValues_badWords[i][1]);
      //   }
      // console.log(result)
      // let text = JSON.stringify(result)
      // let new_text = 'Bad Words Ranking: ';
      // let num = 0;
      // for (var key in result) {
      //   num = num + 1;
      //   new_text = new_text + '\n' + String(num) + '. ' + '<@' + String(key) + '>' + ' has a score of ' + String(result[key][1]);
      //   }

      //change post endpoint before pushing to github
      axios
            .post("Change Me (from Slack API)", {
              text: new_text,
            })
            .then((res) => {
            })
            .catch((error) => {
              functions.logger.log(error);
            });
    response.status(200).send(request.body.challenge)
    } else {
      throw response.status(500)
    }});

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
