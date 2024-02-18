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

app.get('/logout', (req, res) => {
  console.log("/logout");
  console.log(req.body);
  console.log(req.session);
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).send('Error during session destruction');
    }
    res.redirect('/loginPage');
  });
});

app.get('/loginPage', (req, res) => {
  console.log("/loginPage");
  console.log(req.body);
  console.log(req.session);
  res.render('login.ejs');
});

app.get('/registerPage', (req, res) => {
  console.log("/registerPage");
  console.log(req.body);
  console.log(req.session);
  res.render('register.ejs');
});

app.get('/getDepartments', async (req, res) => {
  console.log("/getDepartments");
  console.log(req.body);
  console.log(req.session);
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

app.post('/register', async (req, res) => {
  console.log("/register");
  console.log(req.body);
  console.log(req.session);
  const { user_id, email, password, kosen, grade, department } = req.body;
  try {
    const { stdout, stderr } = await exec(`python get_syllabus_page.py ${kosen} ${department}`);
    if (stderr) {
      console.error('Standard error output:', stderr);
      return res.status(500).send('Failed to retrieve syllabus URL');
    }
    let syllabus_url = stdout.trim();
    const hash = await bcrypt.hash(password, saltRounds);
    let sql = 'INSERT INTO users (user_id, email, password, kosen, grade, department, syllabus_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await connection.query(sql, [user_id, email, hash, kosen, grade, department, syllabus_url]);
    const importResult = await importSubjects(user_id, kosen, department, grade);
    if (importResult) {
      console.log('Subjects imported successfully');
    } else {
      console.error('Error importing subjects');
    }
    req.session.user_id=user_id
    res.redirect('/');
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('User registration failed');
  }
});

app.post('/login', async (req, res) => {
  console.log("/login");
  console.log(req.body);
  console.log(req.session);
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

app.use((req, res, next) => {
  //req.session.user_id="test";//デバック
  if (req.session.user_id) {
    next();
  } else {
    res.redirect('/loginPage');
  }
});

app.post('/addSubject', async (req, res) => {
  console.log("/addSubject");
  console.log(req.body);
  console.log(req.session);
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


app.get('/deleteSubject', async (req, res) => {
  console.log("/addSubject");
  console.log(req.body);
  console.log(req.session);
  const subject_id = req.query.subject_id;
  try {
    const sql = 'DELETE FROM subjects WHERE subject_id = ?';
    await connection.query(sql, [subject_id]);
    res.redirect('/getAllSubjects');
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).send('Error deleting subject');
  }
});

app.post('/addTask', async (req, res) => {
  console.log("/addTask");
  console.log(req.body);
  console.log(req.session);
  const user_id = req.session.user_id;
  let { name, category_id, importance, effort, deadline, memo } = req.body;
  name = name || '新しいタスク';
  deadline = deadline || null;
  console.log(`deadline is ${deadline}`);
  category_id = category_id === '0' ? null : category_id;
  let priority = null;
  //console.log(deadline);
  if (importance && effort && deadline) {
    try {
      const { stdout, stderr } = await exec(`python calc_task_priority.py ${importance} ${effort} ${deadline}`);
      if (stderr) {
        console.error(`Error on stderr: ${stderr}`);
        return res.status(500).send('Script execution error');
      }
      priority = parseFloat(stdout);
    } catch (error) {
      console.error('Error calculating priority:', error);
      return res.status(500).send('Error calculating priority');
    }
    setAllTasksPriority(user_id);//他のタスクの優先度も更新する
  }

  const taskData = { user_id, category_id, name, importance, effort, deadline, memo, priority };
  try {
    const sql = 'INSERT INTO tasks SET ?';
    await connection.query(sql, taskData);
    res.redirect('/tasks');
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).send('Error adding task');
  }
});

async function setAllTasksPriority(user_id) {
  console.log("function setAllTasksPriority");

  try {
    const [tasks] = await connection.query('SELECT * FROM tasks WHERE user_id = ?', [user_id]);

    for (const task of tasks) {
      let { id, importance, effort, deadline } = task;
      deadline = deadline || null;
      let priority = null;

      if (importance && effort && deadline) {
        try {
          const { stdout, stderr } = await exec(`python calc_task_priority.py ${importance} ${effort} ${deadline}`);
          if (stderr) {
            console.error(`Error on stderr: ${stderr}`);
            throw new Error('Script execution error');
          }
          priority = parseFloat(stdout);
        } catch (error) {
          console.error('Error calculating priority:', error);
          throw new Error('Error calculating priority');
        }

        const sql = 'UPDATE tasks SET priority = ? WHERE id = ? AND user_id = ?';
        await connection.query(sql, [priority, id, user_id]);
      }
    }

    return 'All tasks priority updated successfully';
  } catch (error) {
    console.error('Error updating tasks priority:', error);
    throw new Error('Error updating tasks priority');
  }
}
app.post('/setClass', async (req, res) => {
  console.log("/setClass");
  console.log(req.body);
  console.log(req.session);
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

app.get('/getSubjectDetail', async (req, res) => {
  console.log('/getSubjectDetail');
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  const subject_id = req.query.subject_id;
  try {
    const [results] = await connection.query('SELECT * FROM subjects WHERE user_id = ? AND subject_id = ?', [user_id, subject_id]);
    if (results.length === 0) {
      return res.status(404).send('Subject not found');
    }
    const subject = results[0];
    res.render('subject-detail.ejs', { subject });
  } catch (err) {
    console.error('Error retrieving subject detail:', err);
    res.status(500).send('Error retrieving subject detail');
  }
});

app.get('/getSyllabusUrl', async (req, res) => {
  console.log("/getSylabusUrl");
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  try {
    const [results] = await connection.query('SELECT syllabus_url FROM users WHERE user_id = ?', [user_id]);
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    const syllabusUrl = results[0].syllabus_url;
    console.log('/getSyllabusUrl:'+syllabusUrl);
    res.json({ syllabusUrl });
  } catch (err) {
    console.error('Error retrieving syllabus URL:', err);
    res.status(500).send('Error retrieving syllabus URL');
  }
});

app.get('/getSubjects', async (req, res) => {
  console.log('/getSubjects');
  console.log(req.query);
  console.log(req.session);
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

app.post('/setTask', async (req, res) => {
  console.log("/setTask");
  console.log(req.body);
  console.log(req.session);
  const user_id = req.session.user_id;
  const { id, ...fields } = req.body;
  const updateFields = Object.entries(fields).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') acc[key] = value;//undefinedを除外して返す
    return acc;
  }, {});
  if (updateFields.category_id) {
    updateFields.category_id = updateFields.category_id === '0' ? null : updateFields.category_id;
  }
  const updateValues = Object.values(updateFields);
  const updateParams = updateValues.concat(id, user_id);
  const updateSet = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
  const sql = `UPDATE tasks SET ${updateSet} WHERE id = ? AND user_id = ?`;
  //console.log(sql);
  //console.log(updateParams);
  try {
    await connection.query(sql, updateParams);
    if(updateFields.importance&&updateFields.effort&&updateFields.deadline){
      setAllTasksPriority(user_id);
    }
    
    res.redirect("/tasks");
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).send('Error updating task');
  }
});

app.get('/taskDetail', async (req, res) => {
  console.log('/taskDetail');
  console.log(req.query);
  console.log(req.session);
  const task_id = req.query.task_id;
  try {
    const [task] = await connection.query('SELECT * FROM tasks WHERE id = ?', [task_id]);
    if (task.length === 0) {
      return res.status(404).send('Task not found');
    }
    res.render('task-detail.ejs', { task:task[0] });
  } catch (err) {
    console.error('Error retrieving task:', err);
    res.status(500).send('Error retrieving task');
  }
});

app.get('/getAllSubjects', async (req, res) => {
  console.log("/getAllSubjects");
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  try {
    const [subjects] = await connection.query('SELECT * FROM subjects WHERE user_id = ?', [user_id]);
    res.render('all-subjects.ejs', { subjects });
  } catch (err) {
    console.error('Error retrieving all subjects:', err);
    res.status(500).send('Error retrieving all subjects');
  }
});

app.get('/getTasks', async (req, res) => {
  console.log("/getTasks");
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  const sort = req.query.sort;
  const category_id = parseInt(req.query.category, 10);
  //console.log(category_id);

  try {
    let query = `SELECT * FROM tasks WHERE user_id = ? AND isActive = '1' `;
    let queryParams = [user_id]; // パラメータの配列を初期化

    // category_idが'0'でない場合はクエリとパラメータを更新
    if (category_id !== 0) {
      query += `AND category_id = ? `;
      queryParams.push(category_id); // category_idをパラメータに追加
    }

    // ソート列を動的に生成
    const sortColumn = sort === 'deadline' ? 'deadline' : `${sort} IS NULL, ${sort}`;

    query += `ORDER BY ${sortColumn} DESC`;
    console.log(`query:${query}`);
    console.log(`queryParams:${queryParams}`);
    const [tasks] = await connection.query(query, queryParams); // クエリ実行
    console.log(tasks);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '予期せぬエラーが発生しました。' });
  }
});
app.post('/removeClass', async (req, res) => {
  console.log("/removeClass");
  console.log(req.body);
  console.log(req.session);
  const user_id = req.session.user_id;
  const { day_of_week, time_slot } = req.body;
  try {
    await connection.query('DELETE FROM timetable WHERE user_id = ? AND day_of_week = ? AND time_slot = ?', [user_id, day_of_week, time_slot]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing class:', err);
    res.status(500).send('Error removing class');
  }
});


app.get('/increaseAbsences', async (req, res) => {
  console.log("/increaseAbsences");
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  const { subject_id } = req.query;
  try {
    const sql = 'SELECT absences FROM subjects WHERE user_id = ? AND subject_id = ?';
    const [results] = await connection.query(sql, [user_id, subject_id]);
    if (results.length === 0) {
      return res.status(404).send('Subject not found');
    }
    const absences = results[0].absences + 1;
    await connection.query('UPDATE subjects SET absences = ? WHERE user_id = ? AND subject_id = ?', [absences, user_id, subject_id]);
    
    // 増やした後の情報を取得してクライアントに返す
    const [updatedResults] = await connection.query(sql, [user_id, subject_id]);
    res.json({ absences: updatedResults[0].absences });
  } catch (err) {
    console.error('Error updating absences:', err);
    res.status(500).send('Error updating absences');
  }
});

app.get('/increaseTardies', async (req, res) => {
  console.log("/increaseTardies");
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  const { subject_id } = req.query;
  try {
    const sql = 'SELECT tardies FROM subjects WHERE user_id = ? AND subject_id = ?';
    const [results] = await connection.query(sql, [user_id, subject_id]);
    if (results.length === 0) {
      return res.status(404).send('Subject not found');
    }
    const tardies = results[0].tardies + 1;
    await connection.query('UPDATE subjects SET tardies = ? WHERE user_id = ? AND subject_id = ?', [tardies, user_id, subject_id]);
    // 増やした後の情報を取得してクライアントに返す
    const [updatedResults] = await connection.query(sql, [user_id, subject_id]);
    res.json({ tardies: updatedResults[0].tardies });
  } catch (err) {
    console.error('Error updating tardies:', err);
    res.status(500).send('Error updating tardies');
  }
});

app.post('/importSubjects', async (req, res) => {
  console.log("/importSubjects");
  console.log(req.body);
  console.log(req.session);
  const user_id = req.session.user_id;
  const {kosen, department, grade } = req.body;
  try {
    const success = await importSubjects(user_id, kosen, department, grade);
    if (success) {
      res.redirect('/');
    } else {
      res.status(500).send('科目のインポートに失敗しました。');
    }
  } catch (err) {
    console.error('科目のインポート中にエラーが発生しました:', err);
    res.status(500).send('科目のインポート中にエラーが発生しました。');
  }
});

async function importSubjects(user_id, kosen, department, grade) {
  try {
    const { stdout, stderr } = await exec(`python get_subjects.py ${kosen} ${department} ${grade}`);
    if (stderr) {
      throw new Error(`Error on stderr: ${stderr}`);
    }
    const subjects = JSON.parse(stdout);
    console.log(subjects);
    const insertPromises = subjects.map(subject => {
      const sql = 'INSERT INTO subjects (user_id, subject_name, subject_type, teachers, credits, credit_type) VALUES (?, ?, ?, ?, ?, ?)';
      return connection.query(sql, [user_id, subject.subject_name, subject.subject_type, subject.teachers, subject.credits, subject.credit_type]);
    });
    await Promise.all(insertPromises);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

app.get('/importSubjectsPage', async (req, res) => {
  console.log("/importSubjectsPage");
  console.log(req.query);
  console.log(req.session);
  res.render('import-subjects-page.ejs');
});

console.log('/')
app.get('/', async (req, res) => {
  console.log('/')
  console.log(req.query);
  console.log(req.session);
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

app.get('/tasks', async (req, res) => {
  console.log('/tasks')
  console.log(req.query);
  console.log(req.session);
  res.render('tasks.ejs');
  
});

app.get('/getCategories',async(req,res) => {
  console.log('/getCategories');
  console.log(req.query);
  console.log(req.session);
  const user_id = req.session.user_id;
  const sql = 'SELECT * FROM categories WHERE user_id = ?';
  try{
    const [categories] = await connection.query(sql, [user_id]);
    res.json({categories});
  }catch (err){
    console.error('Error retrieving categories:', err);
  res.status(500).send('Error retrieving categories');
  }
});

app.post('/setSubject', async (req, res) => {
  const { id, name, subject_type, credit_type, credits, absences, tardies, teachers, memo } = req.body;
  try {
    const sql = 'UPDATE subjects SET subject_name = ?, subject_type = ?, credit_type = ?, credits = ?, absences = ?, tardies = ?, teachers = ?, memo = ? WHERE subject_id = ?';
    await connection.query(sql, [name, subject_type, credit_type, credits, absences, tardies, teachers, memo, id]);
    res.redirect('/'); // 更新後にトップページにリダイレクト
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).send('Error updating subject');
  }
});

app.get('/newTask', async(req, res) => {
  console.log('/newTask');
  console.log(req.query);
  console.log(req.session);
  res.render('new-task.ejs');
});

app.post('/addCategory', async (req, res) => {
  console.log('/addCategory');
  console.log(req.body);
  console.log(req.session);
  const { newCategory } = req.body; // リクエストから新しいカテゴリ名を取得
  const userId = req.session.user_id; // ユーザーIDを取得

  try {
    const sql = 'INSERT INTO categories (user_id, category_name) VALUES (?, ?)';
    await connection.query(sql, [userId, newCategory]); // 新しいカテゴリをデータベースに追加
    res.status(200).send('New category added successfully');
  } catch (error) {
    console.error('Error adding new category:', error);
    res.status(500).send('Error adding new category');
  }
});


app.get('/newSubject', (req, res) => {
  console.log('/newSubject')
  console.log(req.query);
  console.log(req.session);
  res.render('new-subject.ejs');
});

// 以下はサーバーの設定になるので, どれか選んでコメントアウトを外してください。
// 卒検PC
//console.log('10.133.90.88:3000/');
//app.listen(3000,'10.133.90.88');

// wifi
//console.log('10.150.19.86:3000/');
//app.listen(3000,'10.150.19.86');

// main pc
//console.log('10.133.90.238:3000/');
app.listen(3000, '0.0.0.0');

// localhost
//console.log('localhost:3000/');
//app.listen(3000);
