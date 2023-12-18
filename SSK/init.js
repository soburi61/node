const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '13919139aquqas'
  });

  const dbName = 'ssk';

  try {
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`Database ${dbName} dropped.`);

    await connection.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created.`);

    await connection.changeUser({database : dbName});

    // SQLファイルの内容を行ごとに分割
    const sqlCommands = fs.readFileSync(path.join(__dirname, 'ssk.sql'), 'utf8')
      .split(/;\s*$/m); // 各ステートメントはセミコロンで終わる

    for (const sqlCommand of sqlCommands) {
      if (sqlCommand.trim().length > 0) {
        await connection.query(sqlCommand);
      }
    }

    console.log('Database initialized from ssk.sql.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
