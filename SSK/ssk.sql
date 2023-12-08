-- users テーブルの作成 (追加要素含む)
CREATE TABLE users (
  id VARCHAR(150) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  kosen VARCHAR(255),
  grade INT,
  department VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  lastLogin TIMESTAMP
);
-- subjects テーブルの作成 (user_id を追加)
CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,  -- 科目ID
  user_id VARCHAR(150) NOT NULL,  -- ユーザーID
  subject_name VARCHAR(255),  -- 科目名
  subject_type VARCHAR(255),  -- 科目の種類
  credit INT,  -- 単位数
  absences INT,  -- 欠席数
  tardies INT,  -- 遅刻数
  memo VARCHAR(255),  -- メモ
  isActive BOOLEAN NOT NULL DEFAULT TRUE, --有効かどうか(無効だと科目リストに追加できない)
  FOREIGN KEY (user_id) REFERENCES users(id)  -- ユーザーIDの外部キー
);
-- subject_teachers テーブルの作成
CREATE TABLE subject_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT,
  teacher VARCHAR(255),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- timetable テーブルの作成 (user_id を追加)
CREATE TABLE timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL,
  time_slot INT,
  day_of_week VARCHAR(255),
  subject_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- tasks テーブルの作成
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL,
  name VARCHAR(255),
  states VARCHAR(255),
  importance INT,
  lightness INT,
  deadline TIMESTAMP,
  priority FLOAT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


