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

//Using the mongoose library for managing data between mongodb and node
const mongoose = require("mongoose");

//Create connection with mongodb database and collection
mongoose.connect("mongodb+srv://dhruvmehta:SOULMATE@cluster0.o8x5v.mongodb.net/userDB?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology : true});

//Creating the schema i.e. the fields for the user collection 
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

//Once the schema is created map the schema with the User collection
const User = mongoose.model("User", userSchema);

//On the application load the user registration page
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/public/html/registration.html");
});

//On posting the user registration data parse the data to database or show the error
app.post("/", (req, res) => {

    //Getting the user registration data and time
    var dateTimeObject = new Date();
    var date = dateTimeObject.getFullYear() +"-"+ (dateTimeObject.getMonth()+1) +"-"+ dateTimeObject.getDate();
    var time = dateTimeObject.getHours() +":"+ dateTimeObject.getMinutes() +":"+ dateTimeObject.getSeconds();

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
})

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