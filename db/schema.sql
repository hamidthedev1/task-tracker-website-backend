-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE 
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role VARCHAR(10) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
 created_at TIMESTAMP DEFAULT NOW()
);



-- TASKS TABLE 
CREATE TABLE tasks (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

 title VARCHAR(255) NOT NULL,
 description TEXT,

 status VARCHAR(20) NOT NULL DEFAULT 'TODO'
   CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),

 priority VARCHAR(10) DEFAULT 'MEDIUM'
   CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),

 due_date TIMESTAMP,

 user_id UUID NOT NULL,

 created_at TIMESTAMP DEFAULT NOW(),
 updated_at TIMESTAMP DEFAULT NOW(),

 CONSTRAINT fk_user
 FOREIGN KEY(user_id)
 REFERENCES users(id)
 ON DELETE CASCADE
);

-- INDEXES (performance)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);