require("dotenv").config();
const express = require('express')
const app = express()
var Twitter = require("twitter");

const path = require('path');
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:3000', 'http://localhost:5000', '']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}


var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

const used = []
const log = console.log;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/twitter/message", async(req, res) => {
    function postToTwitter(tweet) {
        client.post(
          "statuses/update",
          { status: tweet },
          function (error, tweet, response) {
            if (error) log(error);
            /* log(tweet); // Tweet body. */
          }
        );
    }    
    const tweet2 = req.body;
    const addy = tweet2.address;
    const tweet = tweet2.name;
    if (used.includes(addy)){
        console.log("Used")
        res.send("Used Already");
    } else { 
        used.push(addy)
        try {
            const response = await postToTwitter(tweet);
            res.send("Your Tweet is Live");
        } catch (error) {
            res.status(500).json({
                message: 'Not able to post'
            });
        }
    }
    console.log(tweet)
    console.log(addy)
    console.log(used)
});

const PORT = process.env.PORT || 5000
app.listen(process.env.PORT || PORT, () => {console.log("Server started on port ${PORT}")})