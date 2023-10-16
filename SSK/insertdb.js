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
    INSERT INTO subjects (subject_name, subject_type, subject_location, credit, grade, absences, tardies, memo)
    VALUES
      ('応用数学II', '専門必修', '教室', 2, 5, 0, 0,''),
      ('情報理論', '専門必修', '教室', 2, 5, 0, 0,''),
      ('卒業研究', '専門必修', '各研究室', 8, 5, 0, 0,''),
      ('数理情報工学', '専門選択', '教室', 2, 5, 0, 0,''),
      ('情報工学実験III', '専門必修', '各実験室', 4, 5, 0, 0,''),
      ('情報数学', '専門必修', '教室', 2, 5, 0, 0,''),
      ('技術者倫理概論', '専門必修', '大講義室', 2, 5, 0, 0,''),
      ('データベース', '専門選択', 'HI演習室', 2, 5, 0, 0,''),
      ('画像・音処理論', '専門選択', 'HI演習室', 2, 5, 0, 0,'');
  `;

  connection.query(insertSubjectsData, (err, results) => {
    if (err) {
      console.error('subjectsテーブルにデータを挿入中にエラーが発生しました。', err);
    } else {
      console.log('subjectsテーブルにデータが挿入されました。');
    }
  });

  // subject_teachersテーブルに仮データを挿入
  const insertTeachersData = `
    INSERT INTO subject_teachers (subject_id, teacher)
    VALUES
      (1, '山本 直樹'),
      (2, '中野 光臣'),
      (3, '山本 直樹'),
      (3, '合志 和洋'),
      (4, '縄田 俊則'),
      (5, '大隈 千春'),
      (5, '村上 純'),
      (5, '小松 一男'),
      (5, '島川 学'),
      (5, '三好 正純'),
      (5, '清田 公保'),
      (6, '山本 直樹'),
      (7, '下田 正寛'),
      (7, '清田 公保'),
      (8, '孫 寧平'),
      (9, '小山 善文'),
      (9, '藤井 慶');
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

    { time_slot: 2, day_of_week: 'tue', subject_id: 4 }, 
    { time_slot: 3, day_of_week: 'tue', subject_id: 5 },
    { time_slot: 4, day_of_week: 'tue', subject_id: 5 },

    { time_slot: 2, day_of_week: 'wed', subject_id: 6 }, 
    { time_slot: 3, day_of_week: 'wed', subject_id: 7 },
    { time_slot: 4, day_of_week: 'wed', subject_id: 7 },

    { time_slot: 3, day_of_week: 'thu', subject_id: 8 },

    { time_slot: 2, day_of_week: 'fri', subject_id: 9 }, 
    { time_slot: 3, day_of_week: 'fri', subject_id: 3 },
    { time_slot: 4, day_of_week: 'fri', subject_id: 3 }
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