var express = require('express');
var router = express.Router();
const db = require('../src/db')
const session = require('express-session')
const bcrypt = require('bcrypt')

const isAuthenticated = (req, res, next) => {
  if(req.session.userId){
    next();
  } else{
    res.redirect('/login')
  }
}



//Homepage
router.get('/', function(req, res, next) {
  let authenticated = false;
  const ipAddress = req.ip.replace(/^::ffff:/, ''); // Remove the IPv6 part
  console.log('Client IP Address:', ipAddress);
  if(req.session.userId) authenticated=true
  res.render('index', { authenticated });
});

//Homepage
router.get('/socket', isAuthenticated, function(req, res, next) {
  let authenticated = false;
  if(req.session.userId) authenticated=true
  let username = req.session.username
  console.log(username)
  res.render('socket', { authenticated, username });
});

router.get('/login', function(req, res, next) {
  let authenticated = false;
  if(req.session.userId) authenticated=true
  res.render('login', { authenticated });
});

router.get('/graphics', function(req, res, next) {
  let authenticated = false;
  if(req.session.userId) authenticated=true
  res.render('graphics', { authenticated });
});

router.get('/sign-up', function(req, res, next) {
  let authenticated = false;
  if(req.session.userId) authenticated=true
  res.render('signup', { authenticated });
});

router.get('/logout', isAuthenticated, (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ?'
  // Destroy the entire session

  db.all(query,[req.session.userId],(err,row)=>{
    if(err) return console.error(err.message)
    console.log("User: " + row.username + " is signing out.")
  })

  req.session.destroy((err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/login');
    }
  });
});


router.post('/sign-up', function(req, res, next) {

  let authenticated = false;
  if(req.session.userId) authenticated=true

  console.log("User sent data")

  const email = req.body.email
  const username = req.body.userName
  const password1 = req.body.passWord1
  const password2 = req.body.passWord2
  const isAdmin = false

  if(password1 == password2){

    const saltRounds = 10;

    bcrypt.hash(password1, saltRounds, (err, hash) => {
    if (err) { return console.error(err);
    } else {

      const insertUser = 'INSERT INTO users(email, username, password, isAdmin) VALUES(?,?,?,?)'
      const selectUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
  
      db.all(selectUser,[username,email],(err,rows)=>{
        if(err) return console.error(err.message)
  
        if(rows.length>0){
          // User already exists, handle accordingly (e.g., show an error message)
          console.log("User already exists");
          res.render('signup' , { authenticated })
        }
        else{
          const userData = [email, username, hash, isAdmin];
          db.run(insertUser, userData,(err)=>{
            if(err) return console.error(err.message)
            console.log(username + " has signed up.")
            res.render('index', { authenticated })
          })
        }
      })
    }
});
}
else{
res.render('signup', { authenticated })
}
});

function capitalizeFirstLetter(username) {
return username.charAt(0).toUpperCase() + username.slice(1);
}


router.post('/login', function(req, res, next){

  let authenticated = false;
  if(req.session.userId) authenticated=true

  const username = req.body.userName
  const password = req.body.passWord

  displayName = capitalizeFirstLetter(username)

 // Querying the specific user
  const selectUser = 'SELECT * FROM users WHERE username = ?'
  db.get(selectUser,[username],(err,row)=>{
    if(err)return console.error(err.message)

    bcrypt.compare(password,row.password, (err,result) => {
      if (err) return console.error(err);
      else{
        if(result){
          console.log("User: " + displayName + " signed in.")
          req.session.userId = row.id;
          req.session.username = row.username;
          res.redirect('/admin')
        }
        else{
          console.log("Incorrect Username or Password.")
          res.render('login', { authenticated });
        }
      }
    })
  })
})

module.exports = router;
