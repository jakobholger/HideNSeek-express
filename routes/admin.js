var express = require('express');
var router = express.Router();
const db = require('../db')

//Admin pages

const isAuthenticated = (req, res, next) => {
  if(req.session.userId){
    next();
  } else{
    res.redirect('/login')
  }
}

const isAdmin = (req, res, next) => {
  if(req.session.userId){
  // Querying the specific user
  const selectUser = 'SELECT * FROM users WHERE id = ?'

 db.get(selectUser,[req.session.userId],(err,row)=>{
   if(err)return console.error(err.message)
    console.log(row.userId)
   if(req.session.userId == row.id && row.isAdmin){
    next()
   }
   else{
    res.redirect('/login')
   }
 })}
}

// viewing users
router.get('/', isAdmin, function(req, res, next) {
  const query = 'SELECT * FROM users';
  let authenticated = false;
  if(req.session.userId) authenticated=true
  db.all(query, [], (err, users) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

  res.render('admin', { users, authenticated });
});
});

// session logger debug
router.get('/logsessions', isAuthenticated, (req, res, next) => {
  // Query all sessions from the sessions table
  const query = 'SELECT * FROM sessions';

  // session logger
  db.all(query, (err, sessions) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Log the sessions to the server console
    console.log('Current Sessions:', sessions);
    res.send('Sessions logged in the console.');
  });
});

// removing a user with button
router.post('/remove', function(req, res, next) {
  const userId = req.body.userId

  if(!userId){
    res.status(400).send('Bad Request')
  }

  const query = 'DELETE FROM users WHERE id = ?';
  
  db.run(query, [userId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  res.redirect('/admin');
});
});

module.exports = router;
