const express = require('express');
const app = express();
const util = require('util');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mysql = require('mysql2/promise');

// exec関数をpromisifyして,async/awaitを使用可能にする
const exec = util.promisify(require('child_process').exec);
const saltRounds = 10;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let connection; // データベース接続をグローバル変数として定義

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
  } catch (err) {
    console.error('An error occurred during database initialization:', err);
    process.exit(1);
  }
}

initializeDatabase();

app.use(session({
  secret: 'key12',
  resave: false,
  saveUninitialized: false,
}));

app.post('/register', async (req, res) => {
  const { user_id, email, password, kosen, grade, department } = req.body;
  try {
    const { stdout, stderr } = await exec(`python get_syllabus.py ${kosen} ${department}`);
    if (stderr) {
      console.error('Standard error output:', stderr);
      return res.status(500).send('Failed to retrieve syllabus URL');
    }
    let syllabus_url = stdout.trim();
    const hash = await bcrypt.hash(password, saltRounds);
    const sql = 'INSERT INTO users (user_id, email, password, kosen, grade, department, syllabus_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await connection.query(sql, [user_id, email, hash, kosen, grade, department, syllabus_url]);
    console.log("/register");
    console.log(req.body);
    req.session.user_id = user_id;
    res.redirect('/');
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('User registration failed');
  }
});

app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const [results] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
    if (results.length === 0) {
      return res.status(401).send('User not found');
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed');
      return res.status(401).send('Incorrect password');
    }
    console.log(user.user_id + ' has logged in');
    req.session.regenerate(async (err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).send('Session error');
      }
      req.session.user_id = user.user_id;
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).send('Server error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).send('Error during session destruction');
    }
    res.redirect('/login-page');
  });
});

app.get('/login-page', (req, res) => {
  res.render('login.ejs');
});

app.get('/register-page', (req, res) => {
  res.render('register.ejs');
});

app.get('/get-departments', async (req, res) => {
  console.log("/get-departments");
  const kosen = req.query.kosen;
  try {
    const { stdout, stderr } = await exec(`python get_department_names.py ${kosen}`);
    if (stderr) {
      throw new Error(`Error on stderr: ${stderr}`);
    }
    const departments = JSON.parse(stdout);
    console.log(departments);
    res.json(departments);
  } catch (error) {
    console.error(`Error executing Python script: ${error}`);
    res.status(500).send('Script execution error');
  }
});

app.use((req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.redirect('/login-page');
  }
});

app.post('/addSubject', async (req, res) => {
  const newSubject = req.body;
  try {
    const sql = 'INSERT INTO subjects SET ?';
    await connection.query(sql, newSubject);
    res.send('Subject added successfully');
  } catch (err) {
    console.error('Error adding new subject:', err);
    res.status(500).send('Error adding subject');
  }
});

app.post('/setClass', async (req, res) => {
  const user_id = req.session.user_id;
  const { subject_id, day_of_week, time_slot } = req.body;
  try {
    const sql = `INSERT INTO timetable (user_id, subject_id, day_of_week, time_slot) VALUES (?, ?, ?, ?)`;
    await connection.query(sql, [user_id, subject_id, day_of_week, time_slot]);
    res.json({ success: true, message: 'Class added to timetable successfully' });
  } catch (err) {
    console.error('Error adding class to timetable:', err);
    res.status(500).send('Error adding class to timetable');
  }
});

async function getSubjectsByDay(timetableData, dayOfWeek) {
  const subjects = [];
  for (let i = 0; i < 4; i++) {
    const subjectData = timetableData.find(data => data.day_of_week === dayOfWeek && data.time_slot === i + 1);
    subjects[i] = subjectData || null;
  }
  return subjects;
}

app.get('/getSubjects', async (req, res) => {
  console.log('/getSubjects');
  const user_id = req.session.user_id;
  try {
    const sql = 'SELECT * FROM subjects WHERE user_id = ?';
    const [subjects] = await connection.query(sql, [user_id]);
    res.json(subjects);
  } catch (err) {
    console.error('Error retrieving subjects:', err);
    res.status(500).send('Error retrieving subjects');
  }
});

app.get('/importSubjects', async (req, res) => {
  console.log('/importSubjects');
  const user_id = req.session.user_id;
  try {
    const [results] = await connection.query('SELECT kosen, department, grade FROM users WHERE user_id = ?', [user_id]);
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    const { kosen, department, grade } = results[0];
    const { stdout, stderr } = await exec(`python get_subjects.py ${kosen} ${department} ${grade}`);
    if (stderr) {
      throw new Error(`Error on stderr: ${stderr}`);
    }
    const subjects = JSON.parse(stdout);
    const insertPromises = subjects.map(subject => {
      const sql = 'INSERT INTO subjects (user_id, subject_name, subject_type, teacher, credit) VALUES (?, ?, ?, ?, ?)';
      return connection.query(sql, [user_id, subject.subject_name, subject.subject_type, subject.teachers, subject.credit]);
    });
    await Promise.all(insertPromises);
    res.redirect('/');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error adding subjects');
  }
});

app.get('/', async (req, res) => {
  const user_id = req.session.user_id;
  try {
    const timetableQuery = `
    SELECT timetable.*, subjects.*
    FROM timetable
    LEFT JOIN subjects ON timetable.subject_id = subjects.subject_id
    WHERE timetable.user_id = ?`;

    const [timetableData] = await connection.query(timetableQuery, [user_id]);

    const monSubjects = await getSubjectsByDay(timetableData, 'mon');
    const tueSubjects = await getSubjectsByDay(timetableData, 'tue');
    const wedSubjects = await getSubjectsByDay(timetableData, 'wed');
    const thuSubjects = await getSubjectsByDay(timetableData, 'thu');
    const friSubjects = await getSubjectsByDay(timetableData, 'fri');

    res.render('top.ejs', { monSubjects, tueSubjects, wedSubjects, thuSubjects, friSubjects });
  } catch (err) {
    console.error('Error retrieving timetable data:', err);
    res.status(500).send('Error retrieving data');
  }
});

app.get('/task', async (req, res) => {
  const user_id = req.session.user_id;
  try {
    const query = 'SELECT * FROM tasks WHERE user_id = ?';
    const [tasks] = await connection.query(query, [user_id]);
    res.render('task.ejs', { tasks });
  } catch (err) {
    console.error('Error retrieving task data:', err);
    res.status(500).send('Error retrieving data');
  }
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
