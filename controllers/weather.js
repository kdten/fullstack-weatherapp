const User = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  //getIndex: (req, res) => {
   // console.log(`sessionID from getIndex: ${req.sessionID}`);
   // req.session.user = req.sessionID;
 // },
  postCurrentLoc: async (req, res) => {
    //console.log(`/weather/POST postCurrentLoc`);
    
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
        // const index = Math.round(degree / 22.5) % 16;
        // return directions[index];
        if (degree >= 349 || degree <= 11) {
          return directions[0];
        } else if (degree >= 12 && degree <= 34) {
          return directions[1];
        } else if (degree >= 35 && degree <= 56) {
          return directions[2];
        } else if (degree >= 57 && degree <= 79) {
          return directions[3];
        } else if (degree >= 80 && degree <= 101) {
          return directions[4];
        } else if (degree >= 102 && degree <= 124) {
          return directions[5];
        } else if (degree >= 125 && degree <= 146) {
          return directions[6];
        } else if (degree >= 147 && degree <= 169) {
          return directions[7];
        } else if (degree >= 170 && degree <= 191) {
          return directions[8];
        } else if (degree >= 192 && degree <= 214) {
          return directions[9];
        } else if (degree >= 215 && degree <= 236) {
          return directions[10];
        } else if (degree >= 237 && degree <= 259) {
          return directions[11];
        } else if (degree >= 260 && degree <= 281) {
          return directions[12];
        } else if (degree >= 282 && degree <= 304) {
          return directions[13];
        } else if (degree >= 305 && degree <= 326) {
          return directions[14];
        } else if (degree >= 327 && degree <= 348) {
          return directions[15];
        }
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

    // Get lat and lon, package user for databse, send, rcv citylist, get weather for each city list, package, send to front end
    // Save current lat, lon, userID from client req
    let lon = req.body.long;
    let lat = req.body.lat;
    let locationName;
    let userCityList = [];
    let retUserCityList= [];
    let userID = req.body.userID;

    // Fetch city and state from geoCoding API
      try {
      const geocodingURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${process.env.OW_API}`;
      const geocodingRes = await fetch(geocodingURL);
      const geocodingData = await geocodingRes.json();
      locationName = `${geocodingData[0].name}, ${geocodingData[0].state}`;
      //console.log(locationName)
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving name for current location');
    }

    // Package object for database model to be inserted into 'citylist' array
    let currentLocation = {
    lat: lat,
    lon: lon,
    locationName: locationName
    }
    
    // Update user document with currentLocation as citylist's 0 index item, retrieve citylist
    try {
      const returneduser = await User.findOneAndUpdate(
        { userID },
        { $set: { 'citylist.0': currentLocation } },
        { new: true, projection: { _id: 1, citylist: 1 } }
      );
      userCityList = returneduser.citylist;
    } catch(err) {
      console.error(err);
      res.status(500).send('Error updating user document with currentLocation');
    }
    

    // Loop through the userCityList array and fetch weather information for each city
    for (const city of userCityList) {
      let owData;
      let aqData;
      try {
        // Make API request to fetch weather information for the city
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${city.lat}&lon=${city.lon}&appid=${process.env.OW_API}&units=imperial&exclude=minutely`);
        owData = await weatherResponse.json();
      
        // Make API request to fetch air quality information for the city
        const aqResponse = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${process.env.OW_API}`);
        aqData = await aqResponse.json();
      
        } catch (err) {
          console.error(`Error fetching weather for city ${city.locationName}- ${err}`);
      }
    
      // Objects are acting all kinds of weird
    
    
      // Update the corresponding city object in userCityList with the weather information
      let updatedCity = {
      lat: city.lat,
      lon: city.lon,
      cityName: city.locationName,
      city_id: city._id,
      aqi: aqData.list[0].main.aqi,
      curTemp: Math.round(owData.current.temp),
      feelsTemp: Math.round(owData.current.feels_like),
      loTemp: Math.round(owData.daily[0].temp.min),
      hiTemp: Math.round(owData.daily[0].temp.max),
      sunsetTime: unixTo12hr(owData.current.sunset),
      sunriseTime: unixTo12hr(owData.current.sunrise),
      curHum: owData.current.humidity,
      windDir: windDirection(owData.current.wind_deg),
      windSpeed: Math.round(owData.current.wind_speed),
      chanceRain: owData.daily[0].pop * 100,
      curDesc: descCase(owData.current.weather[0].description),
      hdIcon: owData.current.weather[0].icon,
      hourly: owData.hourly.slice(0, 30).map(hour => ({ dt: hour.dt, weather: hour.weather, temp: hour.temp })),
      daily: owData.daily.map(day => ({ dt: day.dt, weather: day.weather, temp: day.temp })),
      };
      retUserCityList.push(updatedCity)
    }
    // console.log(`just before send usercity list: ${JSON.stringify(retUserCityList)}`)
    // Send the updated userCityList as the response
    res.json(retUserCityList);
    
  },

  putNewCity: async (req, res) => {
    console.log(`/weather PUT - putNewCity`);
    const { userID, cityName, lat, lon } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { userID },
        { $push: { citylist: { locationName: cityName, lat: lat, lon: lon } } },
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
    },

  deleteCity: async (req, res) => {
      console.log(`/weather DELETE - deleteCity`);
      const { userID, cityName } = req.body;
      try {
          // Find the user document and delete the city object and its data from the citylist array
          const user = await User.findOneAndUpdate(
              { userID },
              { $pull: { citylist: { locationName: cityName } } },
              { new: true }
          );
          res.status(200).send(user.citylist);
      } catch (err) {
          console.log(err);
          res.status(500).send(err.message);
      }
  },
  getWeatherData: async (req, res) => {
    console.log(`/weather DELETE - deleteCity`);
    const { userID, cityName } = req.body;
    try {
        // Find the user document and delete the city object and its data from the citylist array
        const user = await User.findOneAndUpdate(
            { userID },
            { $pull: { citylist: { locationName: cityName } } },
            { new: true }
        );
        res.status(200).send(user.citylist);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}
};
