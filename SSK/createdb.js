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

const createTableQuery = `
  CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(255),
    day_of_week VARCHAR(255),
    time_slot VARCHAR(255)
  )
`;

connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('テーブルの作成中にエラーが発生しました。', err);
  } else {
    console.log('テーブルが作成されました。');
  }
});

const insertDataQuery = `
  INSERT INTO subjects (subject_name, day_of_week, time_slot)
  VALUES (?, ?, ?)
`;

const dataToInsert = ['数学', '月曜日', '9:00 - 10:30'];

connection.query(insertDataQuery, dataToInsert, (err, results) => {
  if (err) {
    console.error('データの挿入中にエラーが発生しました。', err);
  } else {
    console.log('データが挿入されました。');
  }
});
