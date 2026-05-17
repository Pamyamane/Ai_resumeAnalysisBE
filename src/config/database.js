const mongoose = require ("mongoose");

async function connectToDB(){
    try{

        await mongoose.connect(process.env.MANGO_URL)
        console.log("✅ MongoDB connected");
    }catch(error){
        console.log("Error connecting to database", error);

    }
}

module.exports = connectToDB;