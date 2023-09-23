const express = require('express');
const app = express();
app.use(express.static('public'));
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',  // ホスト名
  user: 'root',
  password: '13919139aquqas',
  database: 'timetables',
});

connection.connect((err) => {
  if (err) {
    console.error('データベースに接続できませんでした。', err);
  } else {
    console.log('データベースに接続しました。');
  }
});

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