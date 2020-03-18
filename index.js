// Dependencies
const express = require('express')
var session = require('express-session');
const slug = require('slug')
const bodyParser = require('body-parser')
const path = require('path')
const find = require('array-find')
const urlencodedParser = bodyParser.urlencoded({
  extended: true
});
const multer = require('multer')
const mongo = require('mongodb')
const app = express()
require('dotenv').config()
const port = 8000

// Mongodb connection
let db = null
const uri = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_HOST;

mongo.MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  if (err) {
    throw err
  }

  db = client.db(process.env.DB_NAME)
})

//Middleware
app.use(express.static('static'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(urlencodedParser);
app.use('/static', express.static('static'))
.use(session({ resave: false, saveUninitialized: true, secret: process.env.SESSION_SECRET }))

//Functions
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/error', notFound)
app.get('/main', function(req,res){
  let hob = req.session.hobby1
  if(hob) {
      db.collection('usersCollection')
        .find({"hobby1": hob}).toArray(done)
      function done(err, data) {
           if (err) {
              next(err)
           } else {
              res.redirect('/result')
           }
       }
  }
  else {
      res.render('pages/main.ejs');
  }
})
app.post('/result', urlencodedParser, search)


app.get('/return', (req, res) =>   
res.render('pages/return.ejs'))
app.get('/result', (req, res, next) => {
    let hob = req.session.hobby1
    if (hob) {
       db.collection('usersCollection')
           .find({"hobby1" : hob}).toArray(done)
    } else {
       res.redirect('/return')
    }
    function done(err, data) {
      if (err) {
        next(err)
      } else {
         res.render('pages/result.ejs', {data: data})
      }
    }
})

function search(req, res, next) {
  if (req.body.hobby1) {
    req.session.hobby1 = req.body.hobby1
  }
  let hob = req.session.hobby1 
  if(hob) { 
    db.collection('usersCollection').find({"hobby1" : hob}).toArray(done)
  } else {
    db.collection('usersCollection').find({"hobby1" : hob}).toArray
    res.render('/return')
    
  }
  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.render('pages/result.ejs', {data: data})
    }
  }
}

app.get('/result',function(req,res){
  let hob = req.session.hobby1
  if(hob) {
      db.collection('usersCollection')
        .find({"hobby1": hob}).toArray(done)
      function done(err, data) {
           if (err) {
              next(err)
           } else {
              res.redirect('/result')
           }
       }
  }
  else {
      res.render('pages/main.ejs')
  }
})

app.get('/return',function(req,res){
  if (req.session.hobby1) {
        req.session.destroy(function(err) {
        if (err) console.log(err)
    })
   }
   res.redirect('/main')
})

function notFound(req, res) {
  res.status(404).render('not-found.ejs')
}

app.listen(port, () => console.log(`Server is running succesfully on port ${ port }!`))
