// To veriry the Registered users

const User = require('../models/User');
const generateToken = require('./authController');// loginController is already inside controllers so ../controllers/authController goes up then back into same folder

exports.loginUser = async (req, res)=>{
    try{
        const {email, password} = req.body; //Extracting email and password sent from frontend login form.
        const user = await User.findOne({email}); //Searching database for a user with this email.

        // Was matchPassword(password) — that function doesn't exist standalone.
        // matchPassword is defined in User.js as userSchema.methods.matchPassword,
        // so it must be called ON the user instance: user.matchPassword(password)
        if(user && await user.matchPassword(password)){
            res.json({  
                _id: user._id,                  //Send user data + JWT token.
                name: user.name,                //Send user data + JWT token.
                email: user.email,              //Token will be stored on frontend.
                token: generateToken(user._id)
            });
        }else{
        // Was else() with parentheses — that is a syntax error in JavaScript.
        // else must always use curly braces: else { }
            res.status(401).json({message : "Invalid email or password"}) //401 = Unauthorized.
        }

    }catch(error){
        res.status(500).json({message: "Server Error"})
    }
}