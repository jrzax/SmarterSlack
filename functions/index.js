const functions = require('firebase-functions');
const axios = require('axios')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.BadLanguage = functions.https.onRequest((request, response) => {
    const pottywords = ["butthead", "crap", "stupid"]
    if (request){
        functions.logger.log("Here's the request:", request.body)
        console.log("A request")
        response.status(200).send(request.body)
        if (request.body.event.subtype == "bot_message"){
            return
        } else {
            let message = request.body.event.text
            for (let i = 0; i < pottywords.length; i++){
                if(message.match(pottywords[i])) {
                    axios
                    .post('CHANGE ME', {
                        text: `Rude word ${pottywords[i]} detected. Please consider using kinder language.`
                    })
                    .then(res => {
                        functions.logger.log(`statusCode: ${res.statusCode}`)
                        functions.logger.log(res)
                    })
                    .catch(error => {
                        functions.logger.log(error)
                    })
                    return
                }
            }
        }

    } else {
        throw response.status(500)
    }
});

exports.AlphaDomination = functions.https.onRequest((request, response) => {
    if (request){
        functions.logger.log("Here's the request:", request.body)
        console.log("A request")
        response.status(200).send(request.body.challenge)

    } else {
        throw response.status(500)
    }
});