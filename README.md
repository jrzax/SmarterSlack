This project contains the necessary firebase functions for Smarter Teams in Slack.

## How to Use

- All git commands shoul be run in the SmarterSlack directory
- To deploy a new function you must first navigate to the functions folder
    - From there, make sure node_modules is up to date by running npm install
    - next, you can run firebase deploy --only functions:YOUR_FUNCTION_NAME, FROM INSIDE THE FUNCTIONS FOLDER, to deploy to firebase
    
## NOTES ON SECURITY
- This app works with sensitive slack webhooks
- DON NOT PUSH these webhoooks to github. After deploying to firebase MAKE SURE YOU GET RID OF THE WEBHOOK ANYTIME YOU UPDATE THE CODEBASE
    - This also means you won't have the webhooks from a function you aren't working on at that time.
- ONLY DEPLOY THE FUNCTION YOU'RE WORKING ON TO FIREBASE. Don't just run firebase deploy, becuase this will break the other functions on firebase as their webhoks are replaced with fake values.
