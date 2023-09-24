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
    
    // テーブルの中身を初期化するSQLクエリを実行

    const truncateSubjects = 'TRUNCATE TABLE subjects';
    connection.query(truncateSubjects, (err, results) => {
      if (err) {
        console.error('subjectsテーブルのデータ初期化中にエラーが発生しました。', err);
      } else {
        console.log('subjectsテーブルのデータが初期化されました。');
      }
    });

    const truncateDepartment = 'TRUNCATE TABLE subjects_department';
    connection.query(truncateDepartment, (err, results) => {
      if (err) {
        console.error('subjects_departmentテーブルのデータ初期化中にエラーが発生しました。', err);
      } else {
        console.log('subjects_departmentテーブルのデータが初期化されました。');
      }
    });

    const truncateTeachers = 'TRUNCATE TABLE subject_teachers';
    connection.query(truncateTeachers, (err, results) => {
      if (err) {
        console.error('subject_teachersテーブルのデータ初期化中にエラーが発生しました。', err);
      } else {
        console.log('subject_teachersテーブルのデータが初期化されました。');
      }
    });

    const truncateTimeTable = 'TRUNCATE TABLE timetable';
    connection.query(truncateTimeTable, (err, results) => {
      if (err) {
        console.error('timetableテーブルのデータ初期化中にエラーが発生しました。', err);
      } else {
        console.log('timetableテーブルのデータが初期化されました。');
      }
    });
    connection.end(); // データベース接続を閉じる
  }
});
