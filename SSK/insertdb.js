const fs = require('fs');
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
    return;
  }
  
  console.log('データベースに接続しました。');
  
  // データ挿入
  
  // subjectsテーブルに仮データを挿入
  const insertSubjectsData = `
    INSERT INTO subjects (subject_name, subject_type, subject_location,absences,tardies,memo)
    VALUES
      ('数学', '必修科目', '教室A', 0, 0,''),
      ('英語', '必修科目', '教室B', 0, 0,''),
      ('物理', '必修科目', '教室C', 0, 0,'');
  `;

  connection.query(insertSubjectsData, (err, results) => {
    if (err) {
      console.error('subjectsテーブルにデータを挿入中にエラーが発生しました。', err);
    } else {
      console.log('subjectsテーブルにデータが挿入されました。');
    }
  });

  // subject_departmentテーブルに仮データを挿入
  const insertDepartmentData = `
    INSERT INTO subjects_department (subject_id, department)
    VALUES
      (1, 'HI'),
      (2, 'TE'),
      (3, 'CI'),
      (3, 'HI'),
      (3, 'TE');
  `;

  connection.query(insertDepartmentData, (err, results) => {
    if (err) {
      console.error('subject_departmentテーブルにデータを挿入中にエラーが発生しました。', err);
    } else {
      console.log('subject_departmentテーブルにデータが挿入されました。');
    }
  });

  // subject_teachersテーブルに仮データを挿入
  const insertTeachersData = `
    INSERT INTO subject_teachers (subject_id, teacher)
    VALUES
      (1, '山田'),
      (2, '田中'),
      (2, '佐々木'),
      (3, '佐藤');
  `;

  connection.query(insertTeachersData, (err, results) => {
    if (err) {
      console.error('subject_teachersテーブルにデータを挿入中にエラーが発生しました。', err);
    } else {
      console.log('subject_teachersテーブルにデータが挿入されました。');
    }
  });

  // 月曜日
  const insertTimetableQuery = `
  INSERT INTO timetable (time_slot, day_of_week, subject_id)
  VALUES (?, ?, ?)
  `;

  //monday tuesday wednesday thursday friday
  // 仮の科目の subject_id を使って挿入
  const timetableData = [
    { time_slot: 1, day_of_week: 'mon', subject_id: 1 }, // 1 は仮の subject_id
    { time_slot: 2, day_of_week: 'mon', subject_id: 2 },
    { time_slot: 3, day_of_week: 'mon', subject_id: 3 },
    { time_slot: 4, day_of_week: 'mon', subject_id: 3 },

    { time_slot: 1, day_of_week: 'tue', subject_id: 3 }, 
    { time_slot: 2, day_of_week: 'tue', subject_id: 2 },
    { time_slot: 3, day_of_week: 'tue', subject_id: 1 },
    { time_slot: 4, day_of_week: 'tue', subject_id: 3 },

    { time_slot: 1, day_of_week: 'wed', subject_id: 1 }, 
    { time_slot: 2, day_of_week: 'wed', subject_id: 2 },
    { time_slot: 3, day_of_week: 'wed', subject_id: 3 },
    { time_slot: 4, day_of_week: 'wed', subject_id: 3 },

    { time_slot: 3, day_of_week: 'thu', subject_id: 3 },

    { time_slot: 1, day_of_week: 'fri', subject_id: 4 }, 
    { time_slot: 2, day_of_week: 'fri', subject_id: 2 },
    { time_slot: 3, day_of_week: 'fri', subject_id: 3 },
    { time_slot: 4, day_of_week: 'fri', subject_id: 3 },
  ];



  timetableData.forEach(data => {
    connection.query(insertTimetableQuery, [data.time_slot, data.day_of_week, data.subject_id], (err, results) => {
      if (err) {
        console.error('データの挿入中にエラーが発生しました。', err);
      } else {
        console.log('データが挿入されました。');
      }
    });
  });

  connection.end();
});