-- users テーブルの作成 (追加要素含む)
CREATE TABLE users (
  user_id VARCHAR(150) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  kosen VARCHAR(255),
  grade INT,
  department VARCHAR(255),
  syllabus_url VARCHAR(255),
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
  teacher VARCHAR(255), -- 教員の名前 複数の場合はコンマ区切り
  credit INT,  -- 単位数
  absences INT DEFAULT 0,  -- 欠席数
  tardies INT DEFAULT 0,  -- 遅刻数
  memo VARCHAR(255) DEFAULT "",  -- メモ
  isActive BOOLEAN NOT NULL DEFAULT TRUE, -- 有効かどうか(無効だと科目リストに追加できない)
  FOREIGN KEY (user_id) REFERENCES users(user_id)  -- ユーザーIDの外部キー
);

-- timetable テーブルの作成 (user_id を追加)
CREATE TABLE timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL,
  time_slot INT,
  day_of_week VARCHAR(255),
  subject_id INT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- categorys 
CREATE TABLE categories(
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL,
  category_name VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- tasks テーブルの作成
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL,
  category_id INT,
  name VARCHAR(255),
  status VARCHAR(255) DEFAULT "active", 
  importance INT,
  lightness INT,
  deadline TIMESTAMP,
  memo VARCHAR(255) DEFAULT "",
  priority FLOAT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);


