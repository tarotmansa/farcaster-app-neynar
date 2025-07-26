
require('dotenv').config();
const { NeynarAPIClient, Configuration } = require("@neynar/nodejs-sdk");

// Make sure you have a .env file with your NEYNAR_API_KEY
if (!process.env.NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not set in the .env file.");
}

// V2 of the SDK requires a Configuration object for initialization
const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
});
const client = new NeynarAPIClient(config);

// Example: Fetch a user's profile by their username
async function getUserProfile(username) {
  try {
    // The method expects a single object with the required parameters.
    const response = await client.lookupUserByUsername({ 
        username: username, 
        viewerFid: 3 
    });
    console.log("Full API Response:", response);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    console.error("Underlying error field:", error.field);
  }
}


// Call the function with a Farcaster username.
// Replace 'dwr.eth' with any username you'd like to look up.
getUserProfile("dwr.eth");
