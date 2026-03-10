// This controller is the first handshake between frontend and database.
const User = require("../models/User");
const generateToken = require('./authController'); // Importing the function to generate JWT token.

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body; // extracting these values from the db
    //Checking if a user already exists with the email.
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." }); //400 = Bad Request.
    }
    //Creating new user in database
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        //201 → Created successfully
        _id: user._id,                   //Send back: _id
        name: user.name,                 //           name
        email: user.email,               //           email
        token: generateToken(user._id),  //           JWT token
      });
    }else{
      // else block was missing entirely — if User.create() failed,
      // no response was ever sent and the request hung forever.
      res.status(400).json({ message: "Invalid user data." }); //400 = Bad Request.
    }
  } catch (error) {
        console.log("REGISTER ERROR:", error.message);

    res.status(500).json({ message: "Server Error" });
  }
};
