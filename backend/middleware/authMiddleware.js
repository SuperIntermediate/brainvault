//This file is to validate the token

const jwt = require("jsonwebtoken");
const User = require("../models/User"); //User model to fetch user details from DB.

//Middleware Function
const protect = async (req, res, next) =>{ // next means: continue to next step
    
    try{
        let token; // We'll store the extracted tokens here.

    //Checking Authorization Header if it starts like "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        //There should be space betn Bearer and token so by spliting taking second part. 
        //Split() → Splits the string into an array at each space. [0] = "Bearer" and [1] = actual token.
        token = req.headers.authorization.split(" ")[1];
        //Verifying token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attaching User to Request
        req.user = await User.findById(decoded.id).select("-password"); //.select("-password") means: Exclude password field
        //Using decoded ID to find user from DB.

        next(); //Allow request to move to next middleware or controller. Without next(), request stops.
    }else{
        res.status(401).json({message: "Not authorized, no token"});// 401 = Unathorized
    }
   }catch(error){
   res.status(401).json({message: "Not authorized, token failed."});
}

}

module.exports = protect;

