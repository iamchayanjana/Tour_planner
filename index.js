const express = require('express')
const session =require('express-session')
const app = express()
const ejs = require('ejs')
//const mysql = require('mysql')
//const bodyparser = require('body-parser')
const connection = require('./db')
const { query } = require('express')
app.listen(3000)
app.set('view engine', 'ejs')
//app.use(bodyparser.json())
app.use(express.urlencoded({extended: true}))
app.use(session({secret:'s'}))

app.use('/public', express.static('public'))

app.get('/', function(req, res) {
    if(req.session.login!=1 || req.session.type!=1){
        return res.redirect('/login')
    }
    res.render('index')
})

app.get('/login', function(req, res) {
  if(typeof req.query.s !='undefined' && req.query.s == 1 ){ 
    res.render('index',{data: req.query.s});
    
  }
    res.render('login');
})

app.get('/register', function(req, res) 
{
  res.render('register')
})

app.get('/plan', function(req, res, next){
  if(req.session.login!=1 || req.session.type!=1){
    return res.redirect('/login')
  }
  var query = 'SELECT p.duration, p.cost, l.name AS location, GROUP_CONCAT(s.name) AS spots FROM plan p INNER JOIN location l ON p.location_id = l.id INNER JOIN plan_spot ps ON p.id = ps.plan_id INNER JOIN spot s ON ps.spot_id = s.id GROUP BY p.id';// new query add 
  connection.query(query, function(error, rows){
  if(error) throw error
   else{
  console.log(rows);
  res.render('plan', {data: rows});
  }
  })
});

app.get('/about', function(req, res) {
  if(req.session.login!=1 || req.session.type!=1){
    return res.redirect('/login')
  }
    res.render('about')
})

app.get('/list-guide', function(req, res, next){
  if(req.session.login!=1 || req.session.type!=1){
    return res.redirect('/login')
  }
  var query = 'SELECT name,email,experience,govt_id FROM guide';
    connection.query(query, function(error, rows){
  if(error) throw error
   else{
  console.log(rows);
  res.render('guide', {data: rows});
  }
  })
});

app.get('/guide/login', function(req, res) {
  if(typeof req.query.s !='undefined' && req.query.s == 2 ){ 
    res.render('guide/index',{data: req.query.s});
    }
    res.render('guide/login')
})

app.get('/guide/register', function(req, res) {
  res.render('guide/register')
})

app.get('/guide/add-plan', function(req, res) {
  if(req.query.location_id == undefined)
      res.send('Error: Location ID not present')

  var query = 'SELECT * FROM spot WHERE location_id = ' + req.query.location_id;
  connection.query(query, function(error, rows){
      if(error) throw error
      else{
          console.log(rows);
          res.render('guide/add-plan', {data: rows});
      }
  })
})

app.get('/guide', function(req, res) {
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  res.render('guide/index')
})

app.get('/guide/add-location', function (req, res) {
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  res.render('guide/add-location')
})

app.get('/guide/add-spot', function (req, res) {
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  var query = 'SELECT * FROM location';
  connection.query(query, function(error, rows){
    if(error) throw error
      else{

        if(typeof req.query.s !='undefined' && req.query.s == 1 ){ 
          res.render('guide/add-spot',{data: rows, message: req.query.s});
        } else {
            res.render('guide/add-spot', {data: rows});
        }
      }
    })
  })





app.post('/guide/register', function(req, res) {
   
       var insertdata = {
        name:req.body.name,
        email:req.body.email,
        experience:req.body.experience,
        govt_id:req.body.govt_id,
        password:req.body.password,
      }
    var query = `INSERT INTO guide SET ?`;
    connection.query(query,insertdata, function(error, rows){
      if(error) throw error
      else{
        res.redirect('/guide/login')
        
      }
    })
})

app.post('/register', function(req, res) {
   
    var insertdata = {
     name:req.body.name,
     contact_no:req.body.contact_no,
     email:req.body.email,
     password:req.body.password,
   }
   console.log(insertdata)
 var query = `INSERT INTO tourist SET ?`;
 connection.query(query,insertdata, function(error, rows){
   if(error) throw error
   else{
     res.redirect('/login')
     
   }
 })
})

app.post('/guide/add-plan', function(req, res) {
   
    var insertdata = {
        duration:req.body.duration,
        cost:req.body.cost,
        location_id:req.body.location_id,
    
   }
 var query = `INSERT INTO plan SET ?`;
 connection.query(query,insertdata, function(error, rows){
   if(error) throw error
   else{
    
    var spot_ids = req.body.spot_id
    var values = ''
    if(Array.isArray(spot_ids)){
      for(var i=0;i<spot_ids.length;i++){
        values = values + '('+rows.insertId + ','+spot_ids[i]+'),'

      }

    }
    values = values.replace(/,\s*$/, "");
    
    var plan_spot_query = 'insert into plan_spot (plan_id,spot_id) values '+values;
     connection.query(plan_spot_query,function(error, rows){
      if(error) throw error
      else{
        res.redirect('/guide/plan-select-location?s=1')
      }
   })
  }
 })
})




app.post('/guide/add-location', function (req, res) {
  var insertdata = {
      name : req.body.name
  }
  var query = `INSERT INTO location SET ?`;
  connection.query(query, insertdata, function(error, rows){
      if(error) throw error
      else{
          res.redirect('/guide/add-location')
          console.log(rows);
      } 
  })
})



app.post('/guide/add-spot', function (req, res) {
  var insertdata = {
      name : req.body.name,
      location_id : req.body.location_id,
      time : req.body.time
  }
  var query = `INSERT INTO spot SET ?`;
  connection.query(query, insertdata, function(error, rows){
      if(error) throw error
      else{
          res.redirect('/guide/add-spot?s=1')
          console.log(rows);
      } 
  })
})

app.get('/guide/plan-select-location', function (req, res) {
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  var query = 'SELECT * FROM location';
  connection.query(query, function(error, rows){
      if(error) throw error
      else{
          console.log(rows);
          if(typeof req.query.s !='undefined' && req.query.s == 1 ){ 
            res.render('guide/plan-select-location',{data: rows, message: req.query.s});
          } else {
              res.render('guide/plan-select-location', {data: rows});
          }
      }
})
})



app.get('/guide/location', function(req, res, next){
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  var query = 'SELECT name FROM location';
    connection.query(query, function(error, rows){
  if(error) throw error
   else{
  console.log(rows);
  res.render('guide/location', {data: rows});
  }
  })
});

app.get('/guide/spot', function(req, res, next){
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  var query = 'SELECT p.duration, p.cost, l.name AS location, GROUP_CONCAT(s.name) AS spots FROM plan p INNER JOIN location l ON p.location_id = l.id INNER JOIN plan_spot ps ON p.id = ps.plan_id INNER JOIN spot s ON ps.spot_id = s.id GROUP BY p.id';// new query add 
    connection.query(query, function(error, rows){
  if(error) throw error
   else{
  console.log(rows);
  res.render('guide/spot', {data: rows});
  }
  })
});

app.get('/guide/plan', function(req, res, next){
  if(req.session.login!=1 || req.session.type!=2){
    return res.redirect('/guide/login')
  }
  var query = 'SELECT p.duration, p.cost, l.name AS location, GROUP_CONCAT(s.name) AS spots FROM plan p INNER JOIN location l ON p.location_id = l.id INNER JOIN plan_spot ps ON p.id = ps.plan_id INNER JOIN spot s ON ps.spot_id = s.id GROUP BY p.id';// new query add 
    connection.query(query, function(error, rows){
  if(error) throw error
   else{
  console.log(rows);
  res.render('guide/plan', {data: rows});
  }
  })
});

app.get('/plan-search',function(req,res){
  var query = 'SELECT p.duration, p.cost, l.name AS location, GROUP_CONCAT(s.name) AS spots FROM plan p INNER JOIN location l ON p.location_id = l.id INNER JOIN plan_spot ps ON p.id = ps.plan_id INNER JOIN spot s ON ps.spot_id = s.id where l.name like "%'+req.query.q+'%" GROUP BY p.id';// new query add 
  connection.query(query, function(error, rows){
  if(error) throw error
    else{
      console.log(rows);
      res.render('plan-search', {data: rows});
    }
  })
});
app.post('/login',function(req, res){
  var query= `select * from tourist where email='`+req.body.email+`' and password='`+req.body.password+`'`;
  connection.query(query, function(error, rows){
    if(error) throw error
    else{
      if (rows.length!=0 ){
        req.session.login=1
        req.session.type=1
        res.redirect('/')
      }
      else{
        req.session.login=0
        req.session.type=0
        res.redirect('/login')
      }
    }
  })
})
app.post('/guide/login',function(req, res){
  var query= `select * from guide where email='`+req.body.email+`' and password='`+req.body.password+`'`;
  connection.query(query, function(error, rows){
    if(error) throw error
    else{
      if (rows.length!=0 ){
        req.session.login=1
        req.session.type=2
        res.redirect('/guide')
      }
      else{
        req.session.login=0
        req.session.type=0
        res.redirect('/guide/login')
      }
    }
  })
})