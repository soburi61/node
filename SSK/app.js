const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const mysql = require('mysql2');
const saltRounds = 10;
app.use(express.static('public'));
// 必要なミドルウェアを追加して、JSON形式でリクエストボディを解析できるようにする
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
// ユーザー登録エンドポイント
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send('エラーが発生しました');
    }
    pool.query('INSERT INTO users SET ?', { username, password: hash }, (error, results) => {
      if (error) {
        return res.status(500).send('ユーザー登録に失敗しました');
      }
      res.status(201).send('ユーザー登録が完了しました');
    });
  });
});

// ログインエンドポイント
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
    if (error || results.length === 0) {
      return res.status(401).send('認証に失敗しました');
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.userId = user.id; // セッションにユーザーIDを保存
        res.send('ログインに成功しました');
      } else {
        res.status(401).send('パスワードが間違っています');
      }
    });
  });
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

// 新しい科目を追加するAPI
app.post('/addSubject', (req, res) => {
  const newSubject = req.body; // 新しい科目のデータを取得（例：{ subject_name: '数学', ... }）
  const sql = 'INSERT INTO subjects SET ?';
  connection.query(sql, newSubject, (err, result) => {
    if (err) {
      console.error('新しい科目の追加に失敗しました。', err);
      res.status(500).send('科目追加エラー');
    } else {
      res.send('科目を追加しました。');
    }
  });
});

// 科目一覧を取得するAPI
app.get('/getSubjects', (req, res) => {
  const sql = 'SELECT * FROM subjects';
  connection.query(sql, (err, subjects) => {
    if (err) {
      console.error('科目一覧の取得に失敗しました。', err);
      res.status(500).send('科目取得エラー');
    } else {
      res.json(subjects);
    }
  });
});

app.post('/setClass', (req, res) => {
  const { subject_id, day_of_week, time_slot } = req.body;

  const sql = `INSERT INTO timetable (subject_id, day_of_week, time_slot) VALUES (?, ?, ?)`;

  // クエリを実行
  connection.query(sql, [subject_id, day_of_week, time_slot], (err, results) => {
    if (err) {
      console.error('時間割に科目を追加する際にエラーが発生しました:', err);
      res.status(500).send('時間割追加エラー');
    } else {
      // 成功した場合、successプロパティをtrueに設定
      console.log("Query Result:", results);

      res.json({ success: true, message: '時間割に科目を追加しました', results });
    }
  });
});

app.get('/task', (req, res) => {
  res.render('task.ejs');
});

app.get('/new-task', (req, res) => {
  res.render('new-task.ejs');
});

app.get('/new-subject', (req, res) => {
  res.render('new-subject.ejs');
});
// 以下はサーバーの設定になるので, どれか選んでコメントアウトを外してください。
// 卒検PC
//console.log('10.133.90.88:3000/');
//app.listen(3000,'10.133.90.88');
// wifi
//console.log('10.150.14.162:3000/')
//app.listen(3000,'10.150.14.162');

//app.listen(3000,'10.150.15.231');
// localhost
console.log('localhost:3000/');
app.listen(3000);
