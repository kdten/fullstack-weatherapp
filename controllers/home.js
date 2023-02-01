const axios = require("axios");
const City = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getIndex: (req, res) => {
    // res.render("index.ejs");
    console.log(req.session);
    req.session.user = req.sessionID;
  },
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
        aqi: aqApiRes.data.list[0].main.aqi
      };

      // Get weather for current location; send
      const weatherURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OW_API}&units=imperial&exclude=minutely`;
      const owApiRes = await axios.get(`${weatherURL}`);
      // Set owData, include geo and aq data before sending back to FE
      const owData = {
        cityName: geoData.curCityName,
        aqi: aqApiRes.data.list[0].main.aqi,
        curWeather: owApiRes.data.current,
        hourly: owApiRes.data.hourly,
        daily: owApiRes.data.daily
      };


      //res.status(200).send(owData);
      //res.render("index.ejs", owData);
      //req.session.weather = owData;
      // res.redirect('/')
    } catch (err) {
      console.log(err);
    }
  },
};
