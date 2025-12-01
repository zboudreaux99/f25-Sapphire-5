-- ===============================================
-- DDL SCHEMA for Sapphire Sounds DB
-- This script will be executed when the database is first created.
-- ===============================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS intarray;

-- This function is IMMUTABLE, which is required for it to be used in an index or EXCLUDE constraint.
-- It converts a start and end time into a timestamp range on a fixed, arbitrary date.
CREATE OR REPLACE FUNCTION time_to_tstzrange(start_time TIME, end_time TIME)
RETURNS TSTZRANGE AS $$
DECLARE
    base_date DATE := '2000-01-01';
    start_ts TIMESTAMPTZ;
    end_ts TIMESTAMPTZ;
BEGIN
    start_ts := base_date + start_time;
    end_ts := base_date + end_time;
    
    IF end_time <= start_time THEN
        end_ts := end_ts + INTERVAL '1 day';
    END IF;

    RETURN TSTZRANGE(start_ts, end_ts, '()');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION time_to_tstzrange(TIME, TIME) IS 'Converts a start and end time into a TSTZRANGE on a fixed date. Handles overnight ranges by adding a day to the end time if it''s earlier than the start time. Required for the EXCLUDE constraint on NoiseRule.';

CREATE TABLE Property (
    property_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address001 VARCHAR(255) NOT NULL,
    address002 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zipcode VARCHAR(20)
);

COMMENT ON TABLE Property IS 'Represents a physical property, such as an apartment building or complex.';
COMMENT ON COLUMN Property.address001 IS 'Primary address line for the property.';
COMMENT ON COLUMN Property.address002 IS 'Secondary address line (e.g., apartment, suite).';

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'tenant');

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE Users IS 'Stores user account information for authentication and authorization.';
COMMENT ON COLUMN Users.password_hash IS 'Hashed password for user authentication. Should never store plain text passwords.';
COMMENT ON COLUMN Users.role IS 'Defines the user''s role within the system (admin, manager, tenant).';

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

COMMENT ON TABLE Manager IS 'Stores information about property managers.';


CREATE TABLE PropertyManagers (
    property_id INT NOT NULL,
    manager_id INT NOT NULL,
    PRIMARY KEY (property_id, manager_id),
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES Manager(manager_id) ON DELETE CASCADE
);

COMMENT ON TABLE PropertyManagers IS 'Junction table linking properties to their assigned managers.';

CREATE TABLE Unit (
    unit_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    property_id INT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    UNIQUE (property_id, name),
    UNIQUE (property_id, unit_id)
);

COMMENT ON TABLE Unit IS 'Represents an individual unit within a property, such as an apartment.';

CREATE TABLE Sensor (
    sensor_id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    unit_id INT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    UNIQUE (unit_id, location)
);

COMMENT ON TABLE Sensor IS 'Represents a physical noise monitoring sensor installed in a unit.';
COMMENT ON COLUMN Sensor.location IS 'Describes where the sensor is physically located within the unit (e.g., "living room", "ceiling").';

CREATE TABLE SensorReading (
    reading_id SERIAL PRIMARY KEY,
    db INTEGER NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sensor_id INT NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(sensor_id) ON DELETE CASCADE
);

COMMENT ON TABLE SensorReading IS 'Stores individual noise level readings from a sensor at a specific point in time.';
COMMENT ON COLUMN SensorReading.db IS 'The decibel level recorded by the sensor.';

CREATE TABLE SensorHeartbeat (
    sensor_id INT PRIMARY KEY, 
    last_check_in_timestamp TIMESTAMPTZ NOT NULL,
    connectivity_status VARCHAR(20) NOT NULL,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(sensor_id) ON DELETE CASCADE
);

COMMENT ON TABLE SensorHeartbeat IS 'Tracks the connectivity and last check-in time of each sensor to monitor its status.';

CREATE TABLE Tenant (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit_id INT,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE SET NULL,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

COMMENT ON TABLE Tenant IS 'Represents a tenant residing in a unit. Can be linked to a user account.';


CREATE TABLE Reward (
    reward_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    property_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    UNIQUE (property_id, name),
    UNIQUE (property_id, reward_id)
); 

COMMENT ON TABLE Reward IS 'Defines rewards that can be granted to units/tenants, managed at the property level.';

CREATE TABLE UnitRewards (
    unit_reward_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL,
    reward_id INT NOT NULL,
    unit_id INT NOT NULL,
    date_granted TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_redeemed TIMESTAMPTZ,
    FOREIGN KEY (reward_id) REFERENCES Reward(reward_id) ON DELETE RESTRICT,
    FOREIGN KEY (property_id, unit_id) REFERENCES Unit(property_id, unit_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id, reward_id) REFERENCES Reward(property_id, reward_id) ON DELETE RESTRICT,
    CONSTRAINT chk_redeemed_after_granted CHECK (date_redeemed IS NULL OR date_redeemed >= date_granted)
);

COMMENT ON TABLE UnitRewards IS 'Tracks rewards that have been granted to specific units and when they were redeemed.';

CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE Complaint (
    complaint_id SERIAL PRIMARY KEY,
    initiating_tenant_id INT NOT NULL,
    complained_about_unit_id INT, 
    complaint_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    status complaint_status NOT NULL DEFAULT 'open',
    FOREIGN KEY (initiating_tenant_id) REFERENCES Tenant(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (complained_about_unit_id) REFERENCES Unit(unit_id) ON DELETE SET NULL
);

COMMENT ON TABLE Complaint IS 'Stores noise complaints filed by tenants against other units.';

CREATE TABLE NoiseRule (
    noise_rule_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL,
    description VARCHAR(255),
    threshold_db INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    -- Array of integers for days of the week, following ISO 8601 standard (1=Monday, 7=Sunday)
    days_of_week INT[] NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    CONSTRAINT no_overlapping_rules EXCLUDE USING GIST (property_id WITH =, days_of_week WITH &&, time_to_tstzrange(start_time, end_time) WITH &&)
);

COMMENT ON TABLE NoiseRule IS 'Defines quiet hours and noise thresholds for a property.';
COMMENT ON COLUMN NoiseRule.days_of_week IS 'Array of integers for days of the week, following ISO 8601 standard (1=Monday, ..., 7=Sunday).';
COMMENT ON CONSTRAINT no_overlapping_rules ON NoiseRule IS 'Prevents the creation of overlapping noise rules for the same property on the same days and times.';

CREATE TABLE NoiseViolation (
    violation_id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL,
    sensor_id INT NOT NULL,
    reading_id INT NOT NULL,
    noise_rule_id INT NOT NULL,
    violation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(sensor_id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES SensorReading(reading_id) ON DELETE CASCADE,
    FOREIGN KEY (noise_rule_id) REFERENCES NoiseRule(noise_rule_id) ON DELETE CASCADE
);

COMMENT ON TABLE NoiseViolation IS 'Logs instances where a sensor reading has breached a defined noise rule.';

CREATE TYPE notification_type AS ENUM ('noise_violation', 'complaint', 'reward');
CREATE TYPE notification_status AS ENUM ('unread', 'read');

CREATE TABLE Notification (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    unit_id INT, 
    property_id INT,
    type notification_type NOT NULL,
    reference_id INT,
    message TEXT NOT NULL,
    status notification_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE SET NULL
);

COMMENT ON TABLE Notification IS 'Stores notifications to be displayed to users regarding violations, complaints, or rewards.';
