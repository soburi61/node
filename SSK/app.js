const express = require('express');
const app = express();
const util = require('util');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mysql = require('mysql2/promise');

const exec = util.promisify(require('child_process').exec);
const saltRounds = 10;

app.use(express.static('public'));
// 必要なミドルウェアを追加して、JSON形式でリクエストボディを解析できるようにする
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeDatabase() {
  try {
    connection = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '13919139aquqas',
      database: 'ssk',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    // console.log(connection);
  } catch (err) {
    console.error('データベースの初期化中にエラーが発生しました:', err);
    process.exit(1);
  }
}

// 関数を呼び出し
initializeDatabase();

//ログイン情報をセッションに保存するための設定
app.use(session({
  secret: 'key12', // セッションIDを暗号化するためのキー
  resave: false, // セッションが変更されない限りセッションストアにセッションを再保存しない
  saveUninitialized: false, // 未初期化状態のセッションをストアに強制保存しない
  // その他のオプション（必要に応じて）
}));

// ユーザー登録エンドポイント
app.post('/register', async (req, res) => {
  const { user_id, email, password, kosen, grade, department } = req.body;

  try {
    // const { stdout, stderr } = await exec(`python get_syllabus.py ${kosen} ${department}`);
    // if (stderr) {
    //   console.error('標準エラー出力:', stderr);
    //   return res.status(500).send('シラバスURLの取得に失敗しました');
    // }
    //let syllabus_url = stdout.trim();
    let syllabus_url = "a"
    //console.log(syllabus_url);
    const hash = await bcrypt.hash(password, saltRounds);
    const sql = 'INSERT INTO users (user_id, email, password, kosen, grade, department, syllabus_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await connection.query(sql, [user_id, email, hash, kosen, grade, department, syllabus_url]);
    console.log("/register "+user_id+","+email+","+hash+","+kosen+","+grade+","+department+","+syllabus_url);
    res.redirect('/login-page');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    res.status(500).send('ユーザー登録に失敗しました');
  }
});

app.get('/get-departments', async (req, res) => {
  const kosen = req.query.kosen;
  console.log("/get-departments");
  try {
    const { stdout, stderr } = await exec(`python get_department_names.py ${kosen}`);
    if (stderr) {
      throw new Error(`Error on stderr: ${stderr}`);
    }
    const departments = JSON.parse(stdout);
    //console.log(departments);
    res.json(departments);
  } catch (error) {
    console.error(`Error executing Python script: ${error}`);
    res.status(500).send('スクリプト実行エラー');
  }
});

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const [results] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
    if (results.length === 0) {
      return res.status(401).send('ユーザー名が見つかりません');
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('ログイン失敗');
      return res.status(401).send('パスワードが間違っています');
    }
    console.log(user.user_id + 'がログインしました');
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).send('セッションエラー');
      }
      req.session.user_id = user.user_id;
      console.log(user.user_id);
      return res.redirect('/');
    });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return res.status(500).send('サーバーエラー');
  }
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
  if(req.session.user_id){
    next();
  }else{
    res.redirect('/login-page');
  }
});

app.get('/getSubjects', (req, res) => {
  //console.log("a");
  const user_id = req.session.user_id;
  //console.log("クエリ実行前");
  const sql = 'SELECT kosen, department, grade FROM users WHERE user_id = ?';
  connection.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('データベースエラー:', err);
      return res.status(500).send('ユーザー情報の取得に失敗しました');
    }
    if (results.length === 0) {
      return res.status(404).send('ユーザー情報が見つかりません');
    }
    const { kosen, department, grade } = results[0];
    //console.log("クエリ実行後");

    exec(`python get_subjects.py ${kosen} ${department} ${grade}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        return res.status(500).send('スクリプト実行エラー');
      }
      try {
        const subjects = JSON.parse(stdout);
        const insertPromises = subjects.map(subject => {
          return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO subjects (user_id, subject_name, subject_type, teacher, credit) VALUES (?, ?, ?, ?, ?)';
            connection.query(sql, [user_id, subject.subject_name, subject.subject_type, subject.teachers ,subject.credit ], (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
          });
        });
  
        Promise.all(insertPromises).then(() => {
          res.redirect('/');
        }).catch(err => {
          console.error('データベースエラー:', err);
          res.status(500).send('科目追加エラー');
        });
      } catch (parseError) {
        console.error(`JSON parsing error: ${parseError}`);
        res.status(500).send('結果の解析エラー');
      }
    });
  });
});

async function getSubjectsByDay(timetableData, dayOfWeek) {
  const subjects = [];
  for (let i = 0; i < 4; i++) {
    const subjectData = timetableData.find(data => data.day_of_week === dayOfWeek && data.time_slot === i + 1);
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
  const user_id = req.session.user_id;
  const sql = 'SELECT * FROM subjects WHERE user_id = ?'; // user_idでフィルタリング
  connection.query(sql, [user_id], (err, subjects) => {
    if (err) {
      console.error('科目一覧の取得に失敗しました。', err);
      res.status(500).send('科目取得エラー');
    } else {
      res.json(subjects);
    }
  });
});

app.post('/setClass', (req, res) => {
  const user_id = req.session.user_id; // セッションからuser_idを取得
  const { subject_id, day_of_week, time_slot } = req.body;

  const sql = `INSERT INTO timetable (user_id, subject_id, day_of_week, time_slot) VALUES (?, ?, ?, ?)`;

  // クエリを実行
  connection.query(sql, [user_id, subject_id, day_of_week, time_slot], (err, results) => {
    if (err) {
      console.error('時間割に科目を追加する際にエラーが発生しました:', err);
      res.status(500).send('時間割追加エラー');
    } else {
      // 成功した場合、successプロパティをtrueに設定
      //console.log("Query Result:", results);

      res.json({ success: true, message: '時間割に科目を追加しました', results });
    }
  });
});

app.get('/', async (req, res) => {
  const user_id = req.session.user_id; // セッションからuser_idを取得
  console.log(user_id);
  // データベースから時間割データを取得するクエリ
  const timetableQuery = `
  SELECT timetable.*, subjects.*
  FROM timetable
  LEFT JOIN subjects ON timetable.subject_id = subjects.subject_id
  WHERE timetable.user_id = ?`; // user_idでフィルタリング

  try {
    const [timetableData] = await connection.query(timetableQuery, [user_id]);
    console.log("Query executed");

    const monSubjects = getSubjectsByDay(timetableData, 'mon');
    const tueSubjects = getSubjectsByDay(timetableData, 'tue');
    const wedSubjects = getSubjectsByDay(timetableData, 'wed');
    const thuSubjects = getSubjectsByDay(timetableData, 'thu');
    const friSubjects = getSubjectsByDay(timetableData, 'fri');

    // 取得したデータをEJSテンプレートに渡す
    res.render('top.ejs', { monSubjects, tueSubjects, wedSubjects, thuSubjects, friSubjects });
  } catch (err) {
    console.error('時間割データの取得中にエラーが発生しました。', err);
    res.status(500).send('データ取得エラー');
  }
});



app.get('/task', (req, res) => {
  const user_id = req.session.user_id; // セッションからユーザーIDを取得

  const query = 'SELECT * FROM tasks WHERE user_id = ?'; // 仮のクエリ
  connection.query(query, [user_id], (err, tasks) => {
    if (err) {
      console.error('タスクデータの取得中にエラーが発生しました。', err);
      return res.status(500).send('データ取得エラー');
    }
    res.render('task.ejs', { tasks });
  });
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
