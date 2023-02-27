const User = require("../models/User");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getIndex: async (req, res) => {
    console.log(`/GET - getIndex`);
    console.log(`sessionID from getIndex: ${req.sessionID}`);
    
    try {
      // Find a User document that matches the session ID
      let user = await User.findOne({ userId: req.sessionID });
  
      if (!user) {
        // If no User document was found, create a new one with an empty citylist array and the current session ID as the userId
        const newUser = new User({
          citylist: [],
          userId: req.sessionID,
        });
        user = await newUser.save();
      }
  
      // Get citylist from the database for the user
      const citylist = user.citylist;
  
      // Render the index page and pass in the citylist data
      res.render("index", {
        citylist: citylist
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).send("Error finding or saving user");
    }
  },
};