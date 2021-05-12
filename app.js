const express = require("express");
const request = require("request");
const app = express();
const port = 3000;

var API_SECRET = "YOUR_API_SECRET"; // Replace with your API secret

/** 
 * Register - Get token from the passwordless API
 * 
 * The passwordless client side code needs a Token to register a key to a username.
 * The token is used by the Passwordless API to verify that this action is allowed for this user.
 * Your server can create this token by calling the Passwordless API with the ApiSecret.
 * This allows you to control the process, perhaps you only want to allow new users to register or only allow already signed in users to add a Key to their own account.
 * 
 * Request body looks like:
 * { username: 'anders', displayName:'Anders Åberg'}
 * Response body looks like:
 * "abcdefghiojklmnopq..."
 */
app.get("/create-token", (req, res) => {
  
  // grab the username from querystring (or session, cookie)
  const payload = {
    username: req.query.username,
  };

  // Send the username to the passwordless api to get a token
  request.post(
    {
      url: "https://api.passwordless.dev/register/token",
      json: payload,
      headers: { ApiSecret: API_SECRET },
    },
    (_err, _httpResponse, body) => {        
      const token = body;
      // return the token to our clientside
      res.send(token);
    }
  );
});

/**
 * Sign in - Verify the sign in
 * 
 * The passwordless API handles all the cryptography and WebAuthn details so that you don't need to.
 * In order for you to verify that the sign in was successful and retrieve details such as the username, you need to verify the token that the passwordless client side code returned to you.
 * This is as easy as POST'ing it to together with your ApiSecret.
 * 
 * Request body looks like:
 * { token: "xxxyyyzz..." }
 * Response body looks like:
 * {
   "success":true,
   "username":"anders@user.com",
   "timestamp":"2020-08-21T16:42:48.5061807Z",
   "rpid":"example.com",
   "origin":"https://example.com"}
 * 
 */
app.get("/verify-signin", (req, res) => {
    const token = {token: req.query.token};

    request.post({url: "https://api.passwordless.dev/signin/verify", json: token, headers: { ApiSecret: API_SECRET} }, (err, httpres, body) => {
   
        if(body.success === true) {
            console.log("Succesfully verfied signin for user", body.username);
        }

        res.send(body);
    })
});

// serve html files
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});