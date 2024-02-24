const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./site.db', sqlite3.OPEN_READWRITE,(err)=>{
  if(err)return console.error(err.message)
  console.log("SQLite3 connection successful")
})

// session table if not exists
db.run("CREATE TABLE IF NOT EXISTS sessions (session_id TEXT PRIMARY KEY, expires INTEGER, data TEXT)")

const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    email TEXT,
    username TEXT,
    password TEXT,
    isAdmin INTEGER,
    id INTEGER PRIMARY KEY AUTOINCREMENT
  )
`;

const checkTableExists = 'SELECT name FROM sqlite_master WHERE type="table" AND name="users"';

db.get(checkTableExists, (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  if(row){
    console.log("User table exists, continuing as normal.")
  }

  if (!row) {
    // Table doesn't exist, create it
    db.run(createUserTable, (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log("User table created, restart application");
    });
  }
});



module.exports = db;