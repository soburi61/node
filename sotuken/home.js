const express = require('express');
const app = express();
const mysql = require('mysql');
app.use(express.static('public'));


app.get('/',(req,res) => {
    res.render('top.ejs');
});
app.listen(3000);