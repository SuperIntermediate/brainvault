// Mongoose connected to MongoDB

const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...")
    }catch(error){
        console.log("Database Connected Failed!");
        process.exit(1); //Stops app if DB fails. DO not want the Half-broken system
    }
};

module.exports = connectDB;