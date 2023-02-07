const axios = require("axios");
const User = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getIndex: (req, res) => {
    console.log(`sessionID from getIndex: ${req.sessionID}`);
    req.session.user = req.sessionID;
  },
  // This needs to be split up into two different req and res, so that one may be res as JSON and one as render(index)
  // Myabe next, must differenitate between what should be EJS and what should be AJAX
  postCurrentLoc: async (req, res) => {
    //console.log(`POST`);
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

      const owData = {
        cityName: geoData.curCityName,
 
      };


    } catch (err) {
      console.log(err);
    }
  },
};
