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

    // トランザクションを開始
    connection.beginTransaction((err) => {
      if (err) {
        console.error('トランザクションの開始中にエラーが発生しました。', err);
        return;
      }

      // トランザクション内でクエリを実行
      const queries = [
        'TRUNCATE TABLE subject_teachers',
        'TRUNCATE TABLE timetable',
        'SET FOREIGN_KEY_CHECKS = 0', // 外部キー制約を無効にする
        'TRUNCATE TABLE subjects',
        'SET FOREIGN_KEY_CHECKS = 1', // 外部キー制約を再度有効にする
      ];

      const executeQueries = () => {
        const query = queries.shift();
        if (query) {
          connection.query(query, (err, results) => {
            if (err) {
              console.error(`クエリの実行中にエラーが発生しました。クエリ: ${query}`, err);
              // トランザクションをロールバック
              connection.rollback(() => {
                console.error('トランザクションをロールバックしました。');
                connection.end();
              });
            } else {
              console.log(`クエリが正常に実行されました。クエリ: ${query}`);
              executeQueries(); // 次のクエリを実行
            }
          });
        } else {
          // すべてのクエリが成功した場合、トランザクションをコミット
          connection.commit((err) => {
            if (err) {
              console.error('トランザクションのコミット中にエラーが発生しました。', err);
            } else {
              console.log('トランザクションが正常にコミットされました。');
            }
            connection.end();
          });
        }
      };

      executeQueries(); // 最初のクエリを実行
    });
  }
});
