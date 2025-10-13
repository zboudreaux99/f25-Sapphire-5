-- ===============================================
-- DDL SCHEMA for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE TABLE Property (
    property_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address001 VARCHAR(255) NOT NULL,
    address002 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zipcode VARCHAR(20)
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'tenant');

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    Role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE Manager (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zipcode VARCHAR(20),
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);


CREATE TABLE PropertyManagers (
    property_id INT NOT NULL,
    manager_id INT NOT NULL,
    PRIMARY KEY (property_id, manager_id),
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES Manager(manager_id) ON DELETE CASCADE
);

CREATE TABLE Unit (
    unit_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    property_id INT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    UNIQUE (property_id, Name)
);

CREATE TABLE Sensor (
    sensor_id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    unit_id INT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    UNIQUE (unit_id, Location)
);

CREATE TABLE SensorReading (
    reading_id SERIAL PRIMARY KEY,
    db INTEGER NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sensor_id INT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(sensor_id) ON DELETE CASCADE
);


CREATE TABLE Tenant (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit_id INT UNIQUE,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE SET NULL,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);


CREATE TABLE Reward (
    reward_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE UnitRewards (
    unit_id INT NOT NULL,
    reward_id INT NOT NULL,
    PRIMARY KEY (unit_id, reward_id),
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES Reward(reward_id) ON DELETE CASCADE
);

CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE Complaint (
    complaint_id SERIAL PRIMARY KEY,
    initiating_tenant_id INT NOT NULL,
    complained_about_unit_id INT, 
    ComplaintTimestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    Status complaint_status NOT NULL DEFAULT 'open',
    FOREIGN KEY (initiating_tenant_id) REFERENCES Tenant(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (complained_about_unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE
);

CREATE TABLE NoiseRule (
    noise_rule_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL,
    description VARCHAR(255),
    threshold_db INT NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE NOT NULL,
    -- Array of integers for days of the week, following ISO 8601 standard (1=Monday, 7=Sunday)
    days_of_week INT[] NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    CONSTRAINT no_overlapping_rules EXCLUDE (property_id WITH =, days_of_week WITH &&, TSTZRANGE(start_time::time, end_time::time, '()') WITH &&)
);

