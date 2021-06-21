const express = require("express");

const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use(express.static("public"));

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://dhruvmehta:SOULMATE@cluster0.o8x5v.mongodb.net/userDB?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology : true});

const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    address1 : String,
    address2 : String,
    city : String,
    state : String,
    zipCode : Number,
    country : String,
    date : String
});

const User = mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/public/html/registration.html");
});

app.post("/", (req, res) => {

    var dateTimeObject = new Date();
    var date = dateTimeObject.getFullYear() +"-"+ (dateTimeObject.getMonth()+1) +"-"+ dateTimeObject.getDate();
    var time = dateTimeObject.getHours() +":"+ dateTimeObject.getMinutes() +":"+ dateTimeObject.getSeconds();

    const user = new User({
        firstName : req.body.first_name,
        lastName : req.body.last_name,
        address1 : req.body.address1,
        address2 : req.body.address2,
        city : req.body.city,
        state : req.body.stateList,
        zipCode : req.body.zipcode,
        country : req.body.country,
        date : date +" "+ time
    });

    user.save((err) => {
        if(err){
            res.send(err);
        }else{
            res.render(__dirname + '/views/success.ejs',{first_name:req.body.first_name, last_name:req.body.last_name, address1Data:req.body.address1, address2Data:req.body.address2, cityData:req.body.city,
                stateData:req.body.stateList, zipCodeData:req.body.zipcode, countryData:req.body.country,});
        }   
    });
})

app.get("/admin", (req, res) => {
    User.find((err, foundUsers) => {
        if(err){
            res.send(err);
        }else{
            res.render(__dirname+'/views/admin.ejs',{Users : foundUsers});
        }
    })
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started");
});