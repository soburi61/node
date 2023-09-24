const express = require('express');
const app = express();
app.use(express.static('public'));
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',  // ホスト名
  user: 'root',
  password: '13919139aquqas',
  database: 'ssk',
});

connection.connect((err) => {
  if (err) {
    console.error('データベースに接続できませんでした。', err);
  } else {
    console.log('データベースに接続しました。');
  }
});

app.get('/', (req, res) => {
  // データベースから科目情報を取得
  connection.query('SELECT * FROM subjects', (err, results) => {
    if (err) {
      console.error('データベースからデータを取得できませんでした。', err);
      // エラー処理
    } else {
      // 取得したデータを変数に格納
      const subjectsData = results;
      // EJSファイルをレンダリングしてデータを渡す
      res.render('top.ejs', { subjects: subjectsData });
    }
  });
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