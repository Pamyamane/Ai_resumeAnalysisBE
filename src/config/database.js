const mongoose = require ("mongoose");

async function connectToDB(){
    try{

        await mongoose.connect("mongodb+srv://Pramod:S3CnsWfHp4h6wwcQ@genaicluster.isnygcf.mongodb.net/")
        console.log("✅ MongoDB connected");
    }catch(error){
        console.log("Error connecting to database", error);

    }
}

module.exports = connectToDB;