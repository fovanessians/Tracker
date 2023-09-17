const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// to parse POST request body
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoose = require("mongoose");
const mySecret = process.env['SECRET_KEY']
mongoose.connect(mySecret, { dbName: 'exercisedb' }, { useNewUrlParser: true, useUnifiedTopology: true });
const shortid = require('shortid');
// Basic Configuration
const port = process.env.PORT || 3000;

// instantiate a mongoose schema
let ExerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String
});

let UserSchema = new mongoose.Schema({
    username: String
});



let users = mongoose.model('users', UserSchema);
let exercises = mongoose.model('exercises', ExerciseSchema);


//*******Save to username database*****
app.post('/api/users', async (req, res) => {
  let uname = req.body.username;
  
  let dataBaseUsers = new users({
      username: uname,
    });
/*
List.find().then(function(lists){
//Return results
})
*/
  await dataBaseUsers.save();
  let queryDocs = await users.findOne( {username : uname} ).then(function(userDocs) {
    //console.log('userDocs', userDocs);
    //console.log('userDocs by _id', userDocs._id.toString());
    idUser = userDocs._id.toString();
    //console.log(req.params._id);
    //console.log(queryDocs);
    res.send( {username : uname, _id : idUser} );
  });
});

//*****finish save to username*************************

app.get('/api/users', async(req, res) => {
    //console.log(req.query); parses params from query string
  //http://localhost:3000/profile?name=Gourav
  /*
  app.get('/user', function (req, res) {
    console.log("Name: ", req.query.name);
    console.log("Age:", req.query.age);
    res.send();
});
*/
  //Name: Gourav
  //Age: 11
  
    let getUserDocs = await users.find().select({username:1 , _id:1});
    //console.log(getUserDocs);
    let result = [];
    for(let i in getUserDocs) {
      result.push(getUserDocs[i]);
    }
       
    res.json(result);
    console.log(req.params._id);
  });


//******************Exercises Post**********************

app.post('/api/users/:_id/exercises', async (req, res) => {
  
  let exerciseDescription = req.body.description;
  let exerciseDuration = parseInt(req.body.duration);
  let exerciseDate = new Date(req.body.date);
  let userID = req.params._id;
  //console.log(typeof userID);
  //console.log(typeof exerciseDuration);
  
    let size = new Blob([userID]).size;
    if (size !== 24) {
      console.error('Error Posting Params');
      }
    
    let user = await users.findById(userID).select("username");
    //console.log(user.username);

    if (!user){
      return res.json({error: "unknown userId"})
    }
   
  if (exerciseDate == "Invalid Date"){
    readDate = new Date().toDateString()
  } else {
    readDate = new Date(exerciseDate).toDateString()
  }
  
  let dataBaseExercises = new exercises({
      username: user.username,
      description: exerciseDescription,
      duration: exerciseDuration,
      date: readDate
    });

  await dataBaseExercises.save();

  /*
    res.send( {description : exerciseDescription , duration : exerciseDuration , date : readDate, _ID : user._id, username : user.username  } );
 */ 
  

  
res.json({
    _id: user._id,
    username: user.username,
    date: readDate,
    duration: exerciseDuration,
    description: exerciseDescription,
  });
  
});

//******************Exercises Post End************************

//*****LOG*****Database************************************

app.get('/api/users/:_id/logs', async (req, res) => {
  
  let userIDLog = req.params._id;
  console.log(userIDLog);
  let userLog = await users.findById(userIDLog).select("username");
  //console.log(userLog);
  console.log(userLog.username);

  //*****query using limits on dates*****

    let from = req.query.from;
    let to = req.query.to;
    let limit = parseInt(req.query.limit);
  //console.log('from', from);
  //console.log('from type', typeof(from));
  //console.log('limit', limit);
  //console.log('limit type', typeof(limit));

    
  /*
We have three object static methods, which are:
Object.keys()
Object.values()
Object.entries()
*/

  let findNameQuery = await exercises.find({ username: userLog.username }).select('description').select({_id: 0}).exec();
  console.log('findByName: ', findNameQuery);
   let count = findNameQuery.length;
   //console.log(findNameQuery.length);
  console.log('findNameQuery', findNameQuery);
  console.log('findNameQuery 2 ', Object.values(findNameQuery)[0].description);

  //, date: {$gte: from, $lte: to}

    let findLogQuery = await exercises.find({ username: userLog.username}).select({_id: 0, username: 0, __v: 0}).limit(limit).exec();
  console.log(findLogQuery);
  console.log('date: ', Object.values(findLogQuery)[0].date);
  console.log('type of: ', typeof(Object.values(findLogQuery)[0].date));

  let logSchema = {
    _id: userIDLog,
    username: userLog.username,
    count: count,
    log: findLogQuery
};
 
  res.json(logSchema);

  /*
  res.json({
    _id: userIDLog,
    username: userLog,
  });
  */
  
});

//*****LOG*****Database*************************************

//*****notes*****
/*
you can save the userID as a separate field in the log database. It will still generate its own record with ID, but you can save the ID associated with the user. Also you can count documents with a Mongoose feature

 let exercise = await Exercise.create({
    username: user.username,
    description, 
    duration, 
    date,
    userId,
  });
app.get("/api/users/:_id/logs", async (req, res) => {
  let userId = req.params._id;
  let user = await User.findById(userId).select("username")
  let count = await Exercise.countDocuments({userId})
  let log = await Exercise.find({userId})

  */


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
