const User = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  //getIndex: (req, res) => {
   // console.log(`sessionID from getIndex: ${req.sessionID}`);
   // req.session.user = req.sessionID;
 // },
  // This needs to be split up into two different req and res, so that one may be res as JSON and one as render(index)???
  postCurrentLoc: async (req, res) => {
    console.log(`/weather/POST postCurrentLoc`);
    try {
      // Save current lat and long from client req
      let long = req.body.long;
      let lat = req.body.lat;

      // Assuming that userID is the value of the userID field in the user document
      User.findOne({ userID: req.body.userID })
      .select('citylist') // Include only the citylist field in the result
      .exec((err, user) => {
        if (err) {
          console.error(err);
          // Handle the error
          return;
        }
      
        if (!user) {
          // User document not found
          return;
        }
      
        // Access the citylist field
        const cityList = user.citylist;
        console.log(cityList);
      });

  


        const geocodingURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=5&appid=${process.env.OW_API}`;
        const aqURL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${process.env.OW_API}`;
        const weatherURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${process.env.OW_API}&units=imperial&exclude=minutely`;
        const endpoints = [geocodingURL, aqURL, weatherURL];

        const responses = await Promise.all(endpoints.map(endpoint => fetch(endpoint)));
        const geoData = await responses[0].json();
        const aqData = await responses[1].json();
        const owData = await responses[2].json();

      // FUNCTIONS for manipulating data
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
     
      // Weather desc all lower to Capitalized
      function descCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      // Set owData, include geo and aq data before sending back to FE
      const owDataFormatted = {
        // From geocoding API
        cityName: geoData[0].name,
        stateName: geoData[0].state,
        // From air quality API
        aqi: aqData.list[0].main.aqi,
        // From openweather
        // Hourly
        hourly: owData.hourly.slice(0, 30),
        // Daily
        daily: owData.daily,
        // Current weather
        curTemp: Math.round(owData.current.temp),
        feelsTemp: Math.round(owData.current.feels_like),
        loTemp: Math.round(owData.daily[0].temp.min),
        hiTemp: Math.round(owData.daily[0].temp.max),
        sunsetTime: unixTo12hr(owData.current.sunset),
        sunriseTime: unixTo12hr(owData.current.sunrise),
        curHum: owData.current.humidity,
        windDir: windDirection(owData.current.wind_deg),
        windSpeed: Math.round(owData.current.wind_speed),
        chanceRain: owData.daily[0].pop*100,
        curDesc: descCase(owData.current.weather[0].description),
        hdIcon: owData.current.weather[0].icon,
      };
      
      res.json(owDataFormatted);
    } catch (err) {
      console.log(err);
    }
  },
  putNewCity: async (req, res) => {
    console.log(`/weather PUT - putNewCity`);
  const { userID, cityName } = req.body;

    try {
      const user = await User.findOneAndUpdate(
        { userID },
        { $push: { citylist: cityName } },
        { new: true }
      );
  
     res.json(user);
   } catch(err) {
      console.error(err);
      res.status(500).send('Internal server error');
   }
  },

  // Repalces current city in 0 index spot with current city
  putCurrentCity: async (req, res) => {
    console.log(`/weather/current PUT - putCurrentCity`);
    const { userID, cityName } = req.body;
  
      try {
        const user = await User.findOneAndUpdate(
          { userID },
          { $set: { 'citylist.0': cityName } },
          { new: true }
        );
    

          // Add logic for checking database for list of cities (and lon and lat), use a node native fetch method to get the weather, and sending all that weather to the front end as the current list of weather, ejs should be rendered based on that array of weathers
          // 





       res.json(user);
     } catch(err) {
        console.error(err);
        res.status(500).send('Internal server error');
     }
    }
};
