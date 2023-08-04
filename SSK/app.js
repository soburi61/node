const express = require('express');
const app = express();
app.use(express.static('public'));
const mysql = require('mysql');

app.get('/',(req,res) => {
    res.render('top.ejs');
});


//卒検PC
//console.log('10.133.90.88:3000/');
//app.listen(3000,'10.133.90.88');
//wifi
//console.log('10.133.90.225:3000/')
//app.listen(3000,'10.133.90.225');
//localhost
console.log('localhost:3000/');
app.listen(3000);