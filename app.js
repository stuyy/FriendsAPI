const Friend = require('./models/friend.js');
const restify = require('restify');
var jwt = require('jsonwebtoken');

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.pre(restify.pre.sanitizePath());

const PORT = 3000 || process.env.PORT;

server.post('/database/add/:name/:age/:email', verifyToken, (req, res, next) => { // If the user wants to specify parameters via route.
  jwt.verify(req.token, 'somekey', (err, authToken) => {
    if(err)
    {
      res.status(403);
      res.end("Forbidden");
    }
    else {
      console.log(req.token);
      console.log(req.params);
      var friend = new Friend(req.params);
      friend.save().then(friend => {
        console.log(friend);
        res.status(201); // 201 Status Created.
        res.json(req.params);
      }).catch(err => {
        res.status(400);
      });
    }
  });
});

server.post('/database/add', verifyToken, (req, res, next) => { // If they want to specify a query string.
  console.log(req.query);
  var friend = new Friend(req.query);
  friend.save().then(res => console.log(res)).catch(err => console.log(err));
  res.json(req.query);
});

server.get('/database/friends', verifyToken, getUsers);
server.get('/database/friends/:id', getUsers);

server.get('/api/auth', printErrorMsg);
server.get('/api/auth/:name/:age/:email', printErrorMsg);

server.post('/api/auth', authenticateUser);
server.post('/api/auth/:name/:age/:email', authenticateUser);

// Use this method to authenticate a user and assign them a token.
async function authenticateUser(req, res, next)
{
  try {
    if(req.body)
      res.end("Must pass in query string or parameters");
    if(notEmpty(req.params))
    {
      //res.send(req.params);
    }
    else if(notEmpty(req.query))
    {
      var user = await Friend.find(req.query);
      jwt.sign({user}, 'somekey', { expiresIn: "300s" }, (err, token) => {
        es.json({token, user});
      });
      //res.send(req.query);
    }
  }
  catch(e)
  {
    throw new Error("Error occured trying to authenticate user...");
  }
}

function getUsers(req, res, next)
{
  jwt.verify(req.token, 'somekey', (err, authToken) => {
    if(err)
    {
      res.status(403);
      res.json({'Status' : 'Forbidden'});
    } else {
      if(notEmpty(req.params))
      {
        Friend.find({ _id: req.params.id }, (err, friend) => {
          if(err) throw err;
          res.json(friend);
        })
      } else if(notEmpty(req.query))
      {
        Friend.find(req.query, (err, friend) => {
          if(err) throw err;
          if(friend.length != 0)
            res.json(friend);
          else {
            res.status(404);
            res.json({"Status" : "Could not find user/s" });
          }
        })
      } else {
        Friend.find({}, (err, friend) => {
          if(err) throw err;
          res.json(friend);
        });
      }
    }
  });
}

function verifyToken(req, res, next)
{
  const token = req.headers['authkey'];

  if(token) {
    console.log("The token is: " + token);
    req.token = token;
    next();
  } else {
    res.status(403);
    res.end();
  }
}

function notEmpty(jsonObject)
{
  for(var key in jsonObject)
    if(jsonObject.hasOwnProperty(key))
      return true;
  return false;
}

function printErrorMsg(req, res, next)
{
  res.json({"error" : "Incorrect HTTP Request" });
}

server.listen(PORT, console.log("Server started on port " + PORT));
