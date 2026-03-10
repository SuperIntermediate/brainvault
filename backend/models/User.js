// User Identity file

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Use to hash the passwords

//Creating a new schema object.
const userSchema = new mongoose.Schema({
    name : {
        type: String, 
        required: true //Cannot be empty
    },
    email : {
        type : String,
        required : true,
        unique : true //Two users cannot register with same email.
    },
    password : {
        type : String ,
        required: false //Later we will hash it before saving.
    },
    // googleId: the unique sub ID that Google sends in the token payload
    googleId: {
        type: String,
        default: ""
    },
    // authProvider: "local" = email+password signup, "google" = Google OAuth
    authProvider:{
        type: String,
        enum: ["local", "google"],
        deafult: "local"
    }

}, {timestamps : true}); //This automatically adds: createdAt and updatedAt 

// Mongoose Pre Middleware (Hook).
// Meaning: 👉 “Before saving a user, run this code and hash the password.”

userSchema.pre("save", async function (){//userSchema.pre() → Register middleware //"save" → This runs before saving a document. //function (next) → next() tells Mongoose: “Okay, continue.”
    if(!this.password)    return; // Google users skip hashing
  if(!this.isModified("password")) return ;
  //this → Current user document. //isModified("password") → Checks if password field was changed

  const salt = await require("bcryptjs").genSalt(10); //Salt is random data added before hashing.
  this.password = await require("bcryptjs").hash(this.password, salt);
  
//   next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword){
    //methods → Used to add custom instance methods to schema. // matchPassword → Name of the method.
    // async → Because bcrypt.compare returns a promise. // enteredPassword → The password user typed during login.
    return await bcrypt.compare(enteredPassword, this.password);
    // Comapres the entered password and stored password and return true or false
};

module.exports = mongoose.model("User", userSchema);