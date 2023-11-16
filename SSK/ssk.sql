CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(255),
  subject_type VARCHAR(255),
  subject_location VARCHAR(255),
  credit INT,-- 単位
  grade INT, -- 対象学年
  absences INT,-- 欠課
  tardies INT,-- 遅刻
  memo VARCHAR(255)
);

CREATE TABLE subject_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT,
  teacher VARCHAR(255),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

CREATE TABLE timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time_slot INT,
    day_of_week VARCHAR(255),
    subject_id INT,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

CREATE TABLE users (
  id VARCHAR(150) NOT NULL PRIMARY KEY,
  password VARCHAR(255) NOT NULL, -- ハッシュ化されたパスワードが想定されている
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT TRUE
);