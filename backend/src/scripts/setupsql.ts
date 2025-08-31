import db from '../database/db';

const createTables = async () => {
  const conn = await db.getConnection();

  try {
    console.log('🧹 Dropping and recreating database...');
    await conn.query('DROP DATABASE IF EXISTS powerlog');
    await conn.query('CREATE DATABASE powerlog');
    await conn.query('USE powerlog');

    console.log('✅ Creating tables...');

    await conn.query(`
      CREATE TABLE Users (
        Id INT PRIMARY KEY AUTO_INCREMENT,
        Username VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        User_level ENUM('Admin', 'Customer', 'Owner') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE WorkoutForms (
        Id INT PRIMARY KEY AUTO_INCREMENT,
        category VARCHAR(100),
        workout_program VARCHAR(255) NOT NULL,
        exercise_name VARCHAR(255) NOT NULL,
        times_performed INT NOT NULL CHECK (times_performed BETWEEN 1 AND 100),
        weight_kg DECIMAL(5,2) NOT NULL,
        sets INT NOT NULL CHECK (sets BETWEEN 1 AND 10),
        description TEXT,
        duration_minutes INT,
        difficulty ENUM('easy','medium','hard'),
        video VARCHAR(255),
        photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE Workouts (
        Id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        workout_form_id INT,
        workout_program VARCHAR(255) NOT NULL,
        exercise_name VARCHAR(255) NOT NULL,
        times_performed INT NOT NULL CHECK (times_performed BETWEEN 1 AND 100),
        weight_kg DECIMAL(5,2) NOT NULL,
        sets INT NOT NULL CHECK (sets BETWEEN 1 AND 10),
        description TEXT,
        duration_minutes INT,
        difficulty ENUM('easy','medium','hard'),
        video VARCHAR(255),
        photo VARCHAR(255),
        is_done ENUM('yes','no') DEFAULT 'no',
        completion_time TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(Id),
        FOREIGN KEY (workout_form_id) REFERENCES WorkoutForms(Id)
      );
    `);

    await conn.query(`
      CREATE TABLE Food (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        meals_per_day INT CHECK (meals_per_day BETWEEN 1 AND 10),
        meal_time TIME,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack'),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(Id)
      );
    `);

    await conn.query(`
      CREATE TABLE BMI (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        weight DECIMAL(5,2) NOT NULL,
        height DECIMAL(5,2) NOT NULL,
        bmi_value DECIMAL(5,2) AS (weight / ((height / 100) * (height / 100))) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(Id)
      );
    `);

    await conn.query(`
      CREATE TABLE FormsQuestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        max INT DEFAULT 1,
        answer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE Form_Choices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL,
        answer_text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES FormsQuestions(id) ON DELETE CASCADE
      );
    `);

    await conn.query(`
      CREATE TABLE User_Answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        form_question_id INT,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (form_question_id) REFERENCES FormsQuestions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(Id)
      );
    `);

    await conn.query(`
      CREATE TABLE User_Profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        gender ENUM('male', 'female', 'other'),
        age INT,
        height INT,
        weight INT,
        workout_days INT,
        calorie_target INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(Id)
      );
    `);

    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    conn.release();
  }
};

createTables();
