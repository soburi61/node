const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const mysql = require('mysql2');
const { exec } = require('child_process');
const saltRounds = 10;

app.use(express.static('public'));
// 必要なミドルウェアを追加して、JSON形式でリクエストボディを解析できるようにする
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//mysqlの認証
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '13919139aquqas',
  database: 'ssk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//ログイン情報をセッションに保存するための設定
app.use(session({
  secret: 'key12', // セッションIDを暗号化するためのキー
  resave: false, // セッションが変更されない限りセッションストアにセッションを再保存しない
  saveUninitialized: false, // 未初期化状態のセッションをストアに強制保存しない
  // その他のオプション（必要に応じて）
}));



connection.connect((err) => {
  if (err) {
    console.error('データベースに接続できませんでした。', err);
  } else {
    console.log('データベースに接続しました。');
  }
});
// ユーザー登録エンドポイント
app.post('/register', (req, res) => {
  const { user_id, email, password, kosen, grade, department } = req.body;
  console.log('Received data:', user_id, email, password, kosen, grade, department); // データの確認

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Hashing error:', err); // ハッシュ化エラーの確認
      return res.status(500).send('エラーが発生しました');
    }
    // INSERT文を更新して、kosen, grade, departmentを含める
    const sql = 'INSERT INTO users (user_id, email, password, kosen, grade, department) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [user_id, email, hash, kosen, grade, department], (error, results) => {
      if (error) {
        console.error('Database error:', error); // データベースエラーの確認
        return res.status(500).send('ユーザー登録に失敗しました');
      }else{
        res.redirect('/login-page');
      }

    });
  });
});

// ログインエンドポイント
app.post('/login', (req, res) => {
  const { user_id, password } = req.body;
  connection.query('SELECT * FROM users WHERE user_id = ?', [user_id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('サーバーエラー');
    }

    if (results.length === 0) {
      return res.status(401).send('ユーザー名が見つかりません');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).send('エラーが発生しました');
      }

      if (isMatch) {
        console.log(user.user_id + 'がログインしました'); // ここでログを出力
        req.session.regenerate((err)=> {
          req.session.userId = user.user_id; // セッションにユーザーIDを保存
          return res.redirect('/'); // レスポンスを送信
        });
      } else {
        console.log('ログイン失敗');
        res.status(401).send('パスワードが間違っています');
      }
    });
  });
});


app.get('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    res.redirect('/login-page');
  })
});

app.get('/login-page', (req, res) => {
  res.render('login.ejs');
});


app.get('/register-page', (req, res) => {
  res.render('register.ejs');
});

//エンドポイントを呼び出すときに毎回認証
//これより上はログイン認証してほしくないページを置く(そうしないとログインのループが発生してしまう)
app.use((req,res,next)=>{
  if(req.session.userId){
    next();
  }else{
    res.redirect('/login-page');
  }
});

app.post('/scrapeSubjects', (req, res) => {
  const userId = req.session.userId;
  const { kosen, department, grade } = req.body;

  exec(`python scrape.py ${kosen} ${department} ${grade}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).send('スクリプト実行エラー');
    }
    try {
      const subjects = JSON.parse(stdout);
      // ここでsubjectsをデータベースに保存する
      // 例えば、subjects.forEachでループしてINSERT文を実行する
      subjects.forEach(subject => {
        const sql = 'INSERT INTO subjects (subject_name, subject_type, teacher, credit) VALUES (?, ?, ?, ?)';
        connection.query(sql, [subject.subject_name, subject.subject_type, subject.teachers ,subject.credit ], (err, result) => {
          if (err) {
            console.error('データベースエラー:', err);
          }
        });
      });
      res.redirect('/');
    } catch (parseError) {
      console.error(`JSON parsing error: ${parseError}`);
      res.status(500).send('結果の解析エラー');
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
  const userId = req.session.userId;
  const sql = 'SELECT * FROM subjects WHERE user_id = ?'; // userIdでフィルタリング
  connection.query(sql, [userId], (err, subjects) => {
    if (err) {
      console.error('科目一覧の取得に失敗しました。', err);
      res.status(500).send('科目取得エラー');
    } else {
      res.json(subjects);
    }
  });
});

app.post('/setClass', (req, res) => {
  const userId = req.session.userId; // セッションからuserIdを取得
  const { subject_id, day_of_week, time_slot } = req.body;

  const sql = `INSERT INTO timetable (user_id, subject_id, day_of_week, time_slot) VALUES (?, ?, ?, ?)`;

  // クエリを実行
  connection.query(sql, [userId, subject_id, day_of_week, time_slot], (err, results) => {
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

app.get('/', (req, res) => {
  const userId = req.session.userId; // セッションからuserIdを取得
  //console.log(userId);
  // データベースから時間割データを取得するクエリ
  const timetableQuery = `
  SELECT timetable.*, subjects.*
  FROM timetable
  LEFT JOIN subjects ON timetable.subject_id = subjects.subject_id
  WHERE timetable.user_id = ?`; // userIdでフィルタリング

  connection.query(timetableQuery, [userId], (err, timetableData) => {
    if (err) {
      console.error('時間割データの取得中にエラーが発生しました。', err);
      return res.status(500).send('データ取得エラー');
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
