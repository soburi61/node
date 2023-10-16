const express = require('express');
const app = express();
app.use(express.static('public'));
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
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

// サーバーサイドのコード
app.get('/', (req, res) => {
  // データベースから時間割データを取得するクエリ
  const timetableQuery = `
  SELECT timetable.*, subjects.*, subject_teachers.teacher
  FROM timetable
  LEFT JOIN subjects ON timetable.subject_id = subjects.subject_id
  LEFT JOIN subject_teachers ON timetable.subject_id = subject_teachers.subject_id
  `;

  connection.query(timetableQuery, (err, timetableData) => {
    if (err) {
      console.error('時間割データの取得中にエラーが発生しました。', err);
      res.status(500).send('データ取得エラー');
    } else {
      const monSubjects = getSubjectsByDay(timetableData, 'mon');
      const tueSubjects = getSubjectsByDay(timetableData, 'tue');
      const wedSubjects = getSubjectsByDay(timetableData, 'wed');
      const thuSubjects = getSubjectsByDay(timetableData, 'thu');
      const friSubjects = getSubjectsByDay(timetableData, 'fri');
      // 取得したデータをEJSテンプレートに渡す
      res.render('top.ejs', { monSubjects, tueSubjects, wedSubjects, thuSubjects, friSubjects });
    }
  });
});

function getSubjectsByDay(timetableData, dayOfWeek) {
  const subjects = [];
  for (let i = 0; i < 4; i++) {
    const subjectData = timetableData.find(data => data.day_of_week === dayOfWeek && data.time_slot === i+1);
    if (subjectData) {
      subjects[i] = subjectData;
    } else {
      subjects[i] = null;
    }
  }
  return subjects;
}

// 以下はサーバーの設定になるので, どれか選んでコメントアウトを外してください。
// 卒検PC
// console.log('10.133.90.88:3000/');
// app.listen(3000,'10.133.90.88');
// wifi
// console.log('10.133.90.225:3000/')
// app.listen(3000,'10.133.90.225');
// localhost
console.log('localhost:3000/');
app.listen(3000);
