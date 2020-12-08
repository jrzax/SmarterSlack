This project contains the necessary firebase functions for Smarter Teams in Slack.

## How to Use
- All git commands should be run in the SmarterSlack directory
- Before deploying, incoming webhook key from the slack app, and the firebase key from the firebase project settings, into their corresponging locations labeled CHANGE ME
- To deploy a new function you must first navigate to the functions folder
  - From there, make sure node_modules is up to date by running npm install
  - next, you can run 
    firebase deploy --only functions:YOUR_FUNCTION_NAME
    FROM INSIDE THE FUNCTIONS FOLDER, to deploy to firebase
  
## First time use
- When configuring the Slack App, Slack asks to verify the endpoints you are using
- To be verified, the endpoint must send back a challenge paramater to the Slack API 
- Before verifying the endpoints, put the following line
  response.status(200).send(request.body.challenge)
  underneath the async(request, response) => { line
 - This must be done for both functions
 - After the endpoints are verified in the Slack App, delete the added responses, and redeploy to firebase

## NOTES ON SECURITY

- This app works with sensitive slack webhooks
- DO NOT PUSH THESE WEBHOOKS TO GITHUB, you can get them from the Slack API. After deploying to firebase MAKE SURE YOU GET RID OF THE WEBHOOK ANYTIME YOU UPDATE THE CODEBASE. PUSHING A WEBHOOK TO GITHUB INVALIDATES IT ON FIREBASE AND BREAKS THE APP.
  - This also means you won't have the webhooks from a function you aren't working on at that time.
- ONLY DEPLOY THE FUNCTION YOU'RE WORKING ON TO FIREBASE. Don't just run firebase deploy, becuase this will break the other functions on firebase as their webhoks are replaced with fake values.
