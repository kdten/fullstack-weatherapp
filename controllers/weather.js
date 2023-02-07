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

      // FUNCTIONS for manipulating data
      // Converts unix time to relevent date
      function convertUnixTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const dayOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][date.getDay()];

        return `${dayOfWeek}, ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      // Function converts wind degrees to direction
      function windDirection(degree) {
        const directions = [
          "N",
          "NNE",
          "NE",
          "ENE",
          "E",
          "ESE",
          "SE",
          "SSE",
          "S",
          "SSW",
          "SW",
          "WSW",
          "W",
          "WNW",
          "NW",
          "NNW",
        ];
        let index = Math.round(degree / 22.5) % 16;
        return directions[index];
      }
      // Function converts UNIX to locale time; sunrise and sunset times
      function unixTo12hr(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000);
        const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let tempTime = time.replace(/(^0(?:0:0?)?)/, '').trim();
        return tempTime.replace(/(AM|PM)/, '').trim();
      }
      // // Function converts UNIX to locale time; hourly bar
      // function unixTo12hr(unixTimestamp) {
      //   const date = new Date(unixTimestamp * 1000);
      //   const time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      //   let tempTime = time.replace(/(^0(?:0:0?)?)/, '').trim();
      //   return tempTime.replace(/(AM|PM)/, '').trim();
      // }
      // Weather desc all lower to Capitalized
      function descCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      

      // Set owData, include geo and aq data before sending back to FE
      const owData = {
        // From geocoding API
        cityName: geoData.curCityName,
        // From air quality API
        aqi: aqApiRes.data.list[0].main.aqi,
        // From openweather
        // Hourly
        hourly: owApiRes.data.hourly.slice(0, 24),
        // Daily
        daily: owApiRes.data.daily,
        

        // Current weather
        curTemp: Math.round(owApiRes.data.current.temp),
        feelsTemp: Math.round(owApiRes.data.current.feels_like),
        loTemp: Math.round(owApiRes.data.daily[0].temp.min),
        hiTemp: Math.round(owApiRes.data.daily[0].temp.max),
        sunsetTime: unixTo12hr(owApiRes.data.current.sunset),
        sunriseTime: unixTo12hr(owApiRes.data.current.sunrise),
        curHum: owApiRes.data.current.humidity,
        windDir: windDirection(owApiRes.data.current.wind_deg),
        windSpeed: Math.round(owApiRes.data.current.wind_speed),
        chanceRain: owApiRes.data.daily[0].pop*100,
        curDesc: descCase(owApiRes.data.current.weather[0].description),
        hdIcon: owApiRes.data.current.weather[0].icon,
      };
      //console.log(owData)
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
      res.json(owData);
    } catch (err) {
      console.log(err);
    }
  },
};
