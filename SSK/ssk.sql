CREATE TABLE users (
  user_id VARCHAR(150) NOT NULL PRIMARY KEY, -- ユーザーの一意なID
  email VARCHAR(255) NOT NULL, -- ユーザーのメールアドレス
  password VARCHAR(255) NOT NULL, -- ユーザーのパスワード
  kosen VARCHAR(255), -- ユーザーが所属する高専の名前
  grade INT, -- ユーザーの学年
  department VARCHAR(255), -- ユーザーの学科
  syllabus_url VARCHAR(255), -- シラバスのURL
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- レコードの作成日時
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- レコードの更新日時
  isActive BOOLEAN NOT NULL DEFAULT TRUE, -- ユーザーがアクティブかどうか
  lastLogin TIMESTAMP -- 最後にログインした日時
);
CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,  -- 科目ID
  user_id VARCHAR(150) NOT NULL,  -- ユーザーID
  subject_name VARCHAR(255),  -- 科目名
  subject_type VARCHAR(255),  -- 科目の種類
  teachers VARCHAR(255), -- 教員の名前 複数の場合はコンマ区切り
  credits INT,  -- 単位数
  credit_type VARCHAR(12), -- 履修単位か学修単位
  absences INT DEFAULT 0,  -- 欠席数
  tardies INT DEFAULT 0,  -- 遅刻数
  memo VARCHAR(255) DEFAULT "",  -- メモ
  isActive BOOLEAN NOT NULL DEFAULT TRUE, -- 有効かどうか(無効だと科目リストに追加できない)
  FOREIGN KEY (user_id) REFERENCES users(user_id)  -- ユーザーIDの外部キー
);
CREATE TABLE timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(150) NOT NULL, -- ユーザーID
  time_slot INT, -- 時間割の時間帯
  day_of_week VARCHAR(255), -- 曜日
  subject_id INT, -- 科目ID
  FOREIGN KEY (user_id) REFERENCES users(user_id), -- ユーザーIDの外部キー
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) -- 科目IDの外部キー
);
CREATE TABLE categories(
  category_id INT AUTO_INCREMENT PRIMARY KEY, -- カテゴリーID
  user_id VARCHAR(150) NOT NULL, -- ユーザーID
  category_name VARCHAR(255), -- カテゴリー名
  FOREIGN KEY (user_id) REFERENCES users(user_id) -- ユーザーIDの外部キー
);
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY, -- タスクID
  user_id VARCHAR(150) NOT NULL, -- ユーザーID
  category_id INT, -- カテゴリーID
  name VARCHAR(255), -- タスク名
  importance INT, -- 重要度
  lightness INT, -- 軽さ
  deadline VARCHAR(10), -- 締め切り日 YYYY-MM-DD
  memo VARCHAR(1024) DEFAULT "", -- メモ
  priority FLOAT, -- 優先度
  isActive BOOLEAN NOT NULL DEFAULT TRUE, -- 有効かどうか
  FOREIGN KEY (user_id) REFERENCES users(user_id), -- ユーザーIDの外部キー
  FOREIGN KEY (category_id) REFERENCES categories(category_id) -- カテゴリーIDの外部キー
);


