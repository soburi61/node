CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(255),
  subject_type VARCHAR(255),
  subject_location VARCHAR(255),
  absences INT,-- 欠課
  tardies INT,-- 遅刻
  memo VARCHAR(255)
);

CREATE TABLE subjects_department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT,
  department VARCHAR(255),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
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
