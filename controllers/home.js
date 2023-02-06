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
    console.log(`POST`);
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

      // // Send the received data to air quality API
      // const aqURL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${process.env.OW_API}`;
      // const aqApiRes = await axios.get(`${aqURL}`);
      // // Set name for aqData, Filter to just aqi
      // const aqData = {
      //   aqi: aqApiRes.data.list[0].main.aqi,
      // };

      // // Get weather for current location; package all together
      // const weatherURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OW_API}&units=imperial&exclude=minutely`;
      // const owApiRes = await axios.get(`${weatherURL}`);
      // // Set owData, include geo and aq data before sending back to FE
      const owData = {
        cityName: geoData.curCityName,
        //aqi: aqApiRes.data.list[0].main.aqi,
        //curWeather: owApiRes.data.current,
        //hourly: owApiRes.data.hourly,
        //daily: owApiRes.data.daily,
      };
      console.log(owData.cityName);
      res.render("index", { beData: owData.cityName });
    // // Find a User document that matches the session ID stored in the sessions collection
    // User.findOne({ userId: req.sessionID }, (err, user) => {
    //   // If there was an error finding the user or saving the new User document, return a 500 status code and an error message
    //   if (err || (!user && user.save(err))) {
    //     return res.status(500).send("Error finding or saving user");
    //   }

    //   // If no User document was found, create a new one with an empty citylist array and the current session ID as the userId
    //   if (!user) {
    //     const newUser = new User({
    //       citylist: [],
    //       userId: req.sessionID,
    //     });
    //     user = newUser;
    //   }

    //   // Render the "_curweather" template and send the `citylist` and `beData` data regardless of the outcome
    //   res.render('_curweather', { citylist: user.citylist, beData: owData });
    // });

    } catch (err) {
      console.log(err);
    }
  },
};
