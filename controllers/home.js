const axios = require("axios");
const User = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
    console.log(`sessionID from getIndex: ${req.sessionID}`);
    req.session.user = req.sessionID;
  },
  // This needs to be split up into two different req and res, so that one may be res as JSON and one as render(index)
  // Myabe next, must differenitate between what should be EJS and what should be AJAX
  postCurrentLoc: async (req, res) => {
    try {
      // Save current lat and long from client req
      let long = req.body.long;
      let lat = req.body.lat;

      // Send the received data to geocoding API
      const geocodingURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=5&appid=${process.env.OW_API}`;
      const geoApiRes = await axios.get(`${geocodingURL}`);
      // Set curCityName equal to city name
      const geoData = {
        curCityName: geoApiRes.data[0].name,
      };

      // Send the received data to air quality API
      const aqURL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${process.env.OW_API}`;
      const aqApiRes = await axios.get(`${aqURL}`);
      // Set name for aqData, Filter to just aqi
      const aqData = {
        aqi: aqApiRes.data.list[0].main.aqi,
      };

      // Get weather for current location; package all together
      const weatherURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OW_API}&units=imperial&exclude=minutely`;
      const owApiRes = await axios.get(`${weatherURL}`);
      // Set owData, include geo and aq data before sending back to FE
      const owData = {
        cityName: geoData.curCityName,
        aqi: aqApiRes.data.list[0].main.aqi,
        curWeather: owApiRes.data.current,
        hourly: owApiRes.data.hourly,
        daily: owApiRes.data.daily,
      };
      // Find a User document that matches the session ID stored in the sessions collection
      User.findOne({ userId: req.sessionID }, (err, user) => {
        // If there was an error finding the user, return a 500 status code and an error message
        if (err) {
          return res.status(500).send("Error finding user");
        }

        // If no User document was found, create a new one with an empty citylist array and the current session ID as the userId
        if (!user) {
          const newUser = new User({
            citylist: [],
            userId: req.sessionID,
          });

          // Save the new User document to the database
          newUser.save((error) => {
            // If there was an error saving the new User document, return a 500 status code and an error message
            if (error) {
              return res.status(500).send("Error saving user");
            }

            // If the User document was saved successfully, return an object with the citylist property set to an empty array
            res.render('index', { citylist: [],
                                owData: owData });
          });
        } else {
          // If a User document was found, return an object with the citylist property set to the value of the citylist property in the User document
          res.render('index', { citylist: user.citylist,
                                owData: owData });
        }
      });

    } catch (err) {
      console.log(err);
    }
  },
};
