//Create the Express server for the application
const express = require("express");

const app = express();

//Require the body parser to fetch the user inputs from the request
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

//To make use of the ejs for template
app.set("view engine","ejs");

//For serving the static files such as html,css or images
app.use(express.static("public"));

//Using the express validator library for the server-side validation
const { body,validationResult } = require('express-validator');

//Using the mongoose library for managing data between mongodb and node
const mongoose = require("mongoose");

//For reading the secrets from the .env file
const dotenv = require('dotenv');
dotenv.config();

//Create connection with mongodb database and collection
mongoose.connect("mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.PASSWORD+"@cluster0.o8x5v.mongodb.net/userDB?retryWrites=true&w=majority", {useNewUrlParser : true, useFindAndModify: false, useUnifiedTopology : true});

//Creating the schema i.e. the fields for the user collection 
const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    address1 : String,
    address2 : String,
    city : String,
    state : String,
    zipCode : String,
    country : String,
    date : String
});

//Once the schema is created map the schema with the User collection
const User = mongoose.model("User", userSchema);

//On the application load the user registration page
app.get("/", (req,res) => {
    res.render(__dirname + '/views/registration.ejs');
});

//On posting the user registration data parse the data to database or show the error

//The second parameter is for server side validation of data in order to safeguard website from cross site scripting and sql injection attacks. It checks for empty fields, zipcode digits and country values 
app.post("/",[body('first_name', 'The First Name cannot be empty').trim().isLength({ min: 1 }).escape(), body('last_name', 'The Last Name cannot be empty').trim().isLength({ min: 1 }).escape(), 
body('address1', 'The Address1 cannot be empty').trim().isLength({ min: 1 }).escape(), body('city', 'The City cannot be empty').trim().isLength({ min: 1 }).escape(),
body('zipcode', 'The Zipcode can only be of 5 or 9 digits').trim().matches(/(^\d{5}$)|(^\d{5}-\d{4}$)/), body('country', 'The Country can only be US').equals("US")],
(req, res) => {

    //Get the errors if any during the server side validation
    const errors = validationResult(req);

    //If there are errors then send them to the registration page template in an alert object where you can iterate through the array and display the errors found
    if(!errors.isEmpty()){
        const alert = errors.array()
        res.render(__dirname + '/views/registration.ejs', {
            alert
        });
    }
    //If theres no error then enter the data in database
    else{
        //Getting the user registration data and time
        var dateTimeObject = new Date();
        var date = dateTimeObject.getFullYear() +"-"+ (dateTimeObject.getMonth()+1) +"-"+ dateTimeObject.getDate();
        var time = (dateTimeObject.getUTCHours()-4) +":"+ dateTimeObject.getMinutes() +":"+ dateTimeObject.getSeconds();

        //Create the user object by fetching the data from user input
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

        //Save the data to userDB and the user collection
        user.save((err) => {
            //If error then send the error
            if(err){
                res.send(err);
            }else{
                //Render the success page with the User data
                res.render(__dirname + '/views/success.ejs',{first_name:req.body.first_name, last_name:req.body.last_name, address1Data:req.body.address1, address2Data:req.body.address2, cityData:req.body.city,
                    stateData:req.body.stateList, zipCodeData:req.body.zipcode, countryData:req.body.country,});
            }   
        });
    }
});

//Render the admin page with all the user data in descending order
app.get("/admin", (req, res) => {
    User.find((err, foundUsers) => {
        //If no user is found show the error
        if(err){
            res.send(err);
        //Render the admin page with the users
        }else{
            res.render(__dirname+'/views/admin.ejs',{Users : foundUsers});
        }
    })
});

//Run the application on the port found open by the hosting server else run on port 3000 if open(Mostly used for running on local server)
app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started");
});