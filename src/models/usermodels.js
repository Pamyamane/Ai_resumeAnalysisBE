


const mangoose = require('mongoose')
const userSchema = new mangoose.Schema({
    username:{
        type:String,
        required: true , 
        
    },
    email:{
        type:String,
        required: true ,
        Unique: [true , "Email already exists"]
    }, 
    password:{
        type:String,
        required: true ,
    },

})

const  usermodel = mangoose.model("User", userSchema   )

module.exports = usermodel;
