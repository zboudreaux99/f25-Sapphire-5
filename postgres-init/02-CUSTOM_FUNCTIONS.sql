-----------------------------------------------------------------------------------------------------------------
--  Noise Violations
-----------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_sensor_reading()
RETURNS TRIGGER AS $$
DECLARE
    sustained_violation_window INTERVAL := '2 minutes';
    min_violation_readings INT := 4;
    cooldown_period INTERVAL := '10 minutes';
    noise_rule_record RECORD;
    unit_id_var INT;
    property_id_var INT;
    user_record RECORD;
    json_payload JSONB;
    unit_name_var VARCHAR;
    notification_message TEXT;
    violating_readings_count INT;
    last_violation_timestamp TIMESTAMPTZ;
BEGIN
    SELECT nr.*, s.unit_id, u.property_id
    INTO noise_rule_record
    FROM Sensor s
    JOIN Unit u ON s.unit_id = u.unit_id
    JOIN NoiseRule nr ON u.property_id = nr.property_id
    WHERE s.sensor_id = NEW.sensor_id
      AND NEW.db > nr.threshold_db
      AND (EXTRACT(ISODOW FROM NEW.reading_timestamp) = ANY(nr.days_of_week))
      AND NEW.reading_timestamp::time >= nr.start_time 
      AND NEW.reading_timestamp::time <= nr.end_time;

    IF FOUND THEN
        SELECT s.unit_id, u.property_id, u.name 
        INTO unit_id_var, property_id_var, unit_name_var
        FROM Sensor s
        JOIN Unit u ON s.unit_id = u.unit_id
        WHERE s.sensor_id = NEW.sensor_id;

        SELECT MAX(violation_timestamp)
        INTO last_violation_timestamp
        FROM NoiseViolation
        WHERE unit_id = unit_id_var;

        IF last_violation_timestamp IS NOT NULL AND (NEW.reading_timestamp - last_violation_timestamp) < cooldown_period THEN
            RETURN NEW;
        END IF;

        SELECT count(*)
        INTO violating_readings_count
        FROM SensorReading
        WHERE sensor_id = NEW.sensor_id
          AND db > noise_rule_record.threshold_db
          AND reading_timestamp BETWEEN (NEW.reading_timestamp - sustained_violation_window) AND NEW.reading_timestamp;

        IF violating_readings_count < min_violation_readings THEN
            RETURN NEW; 
        END IF;

        INSERT INTO NoiseViolation (unit_id, sensor_id, reading_id, noise_rule_id, violation_timestamp) 
        VALUES (unit_id_var, NEW.sensor_id, NEW.reading_id, noise_rule_record.noise_rule_id, NEW.reading_timestamp);

        -- Notify tenants of the unit
        FOR user_record IN
            SELECT u.user_id, u.email
            FROM Users u
            JOIN Tenant t ON u.user_id = t.user_id
            WHERE t.unit_id = unit_id_var
        LOOP
            notification_message := format(
                'Sustained noise alert: The noise level has been high for several minutes. A recent reading of %s dB exceeded the %s dB limit for "%s".',
                NEW.db,
                noise_rule_record.threshold_db,
                noise_rule_record.description
            );

            INSERT INTO Notification (user_id, unit_id, property_id, type, reference_id, message)
            VALUES (user_record.user_id, unit_id_var, property_id_var, 'noise_violation', (SELECT last_value FROM noiseviolation_violation_id_seq), notification_message);
            json_payload := jsonb_build_object(
                'notification_id', (SELECT last_value FROM notification_notification_id_seq),
                'user_id', user_record.user_id,
                'email', user_record.email,
                'unit_id', unit_id_var,
                'property_id', property_id_var,
                'type', 'noise_violation',
                'message', notification_message
            );

            PERFORM pg_notify('noise_violation', json_payload::text);
        END LOOP;

        -- Notify property managers
        FOR user_record IN
            SELECT u.user_id, u.email
            FROM Users u
            JOIN Manager m ON u.user_id = m.user_id
            JOIN PropertyManagers pm ON m.manager_id = pm.manager_id
            WHERE pm.property_id = property_id_var
        LOOP
            notification_message := format(
                'Sustained noise alert in Unit %s: The noise level has been high for several minutes. A recent reading of %s dB exceeded the %s dB limit for "%s".',
                unit_name_var,
                NEW.db,
                noise_rule_record.threshold_db,
                noise_rule_record.description
            );

            INSERT INTO Notification (user_id, unit_id, property_id, type, reference_id, message)
            VALUES (user_record.user_id, unit_id_var, property_id_var, 'noise_violation', (SELECT last_value FROM noiseviolation_violation_id_seq), notification_message);
            json_payload := jsonb_build_object(
                'notification_id', (SELECT last_value FROM notification_notification_id_seq),
                'user_id', user_record.user_id,
                'email', user_record.email,
                'unit_id', unit_id_var,
                'property_id', property_id_var,
                'type', 'noise_violation',
                'message', notification_message
            );
            PERFORM pg_notify('noise_violation', json_payload::text);
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensor_reading_trigger
AFTER INSERT ON SensorReading
FOR EACH ROW
EXECUTE FUNCTION process_sensor_reading();

-----------------------------------------------------------------------------------------------------------------
--  Complaints
-----------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_complaint()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    property_id_var INT;
    unit_id_var INT;
    notification_message TEXT;
    json_payload JSONB;
BEGIN
    SELECT u.property_id, u.unit_id INTO property_id_var, unit_id_var
    FROM Unit u
    JOIN Tenant t ON u.unit_id = t.unit_id
    WHERE t.tenant_id = NEW.initiating_tenant_id;

    -- Notify property managers
    FOR user_record IN
        SELECT u.user_id, u.email
        FROM Users u
        JOIN Manager m ON u.user_id = m.user_id
        JOIN PropertyManagers pm ON m.manager_id = pm.manager_id
        WHERE pm.property_id = property_id_var
    LOOP
        notification_message := format(
            'A new complaint has been filed by a tenant in unit %s regarding unit %s. Complaint: %s',
            (SELECT name FROM Unit WHERE unit_id = unit_id_var),
            (SELECT name FROM Unit WHERE unit_id = NEW.complained_about_unit_id),
            NEW.description
        );

        INSERT INTO Notification (user_id, unit_id, property_id, type, reference_id, message)
        VALUES (user_record.user_id, unit_id_var, property_id_var, 'complaint', NEW.complaint_id, notification_message);

        json_payload := jsonb_build_object(
            'notification_id', (SELECT last_value FROM notification_notification_id_seq),
            'user_id', user_record.user_id,
            'email', user_record.email,
            'unit_id', unit_id_var,
            'property_id', property_id_var,
            'type', 'complaint',
            'message', notification_message
        );

        PERFORM pg_notify('complaint', json_payload::text);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_trigger
AFTER INSERT ON Complaint
FOR EACH ROW
EXECUTE FUNCTION process_complaint();
-----------------------------------------------------------------------------------------------------------------
--  Rewards
-----------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_reward()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    property_id_var INT;
    unit_id_var INT;
    reward_name_var VARCHAR;
    reward_description_var TEXT;
    notification_message TEXT;
    json_payload JSONB;
BEGIN
    SELECT u.property_id, u.unit_id INTO property_id_var, unit_id_var
    FROM Unit u
    WHERE u.unit_id = NEW.unit_id;

    SELECT name, description INTO reward_name_var, reward_description_var
    FROM Reward
    WHERE reward_id = NEW.reward_id;

    -- Notify tenants of the unit
    FOR user_record IN
        SELECT u.user_id, u.email
        FROM Users u
        JOIN Tenant t ON u.user_id = t.user_id
        WHERE t.unit_id = unit_id_var
    LOOP
        notification_message := format(
            'Congratulations! You have earned a reward: %s.',
            reward_name_var
        );

        INSERT INTO Notification (user_id, unit_id, property_id, type, reference_id, message)
        VALUES (user_record.user_id, unit_id_var, property_id_var, 'reward', NEW.unit_reward_id, notification_message);

        json_payload := jsonb_build_object(
            'notification_id', (SELECT last_value FROM notification_notification_id_seq),
            'user_id', user_record.user_id,
            'email', user_record.email,
            'unit_id', unit_id_var,
            'property_id', property_id_var,
            'type', 'reward',
            'reward_name', reward_name_var,
            'reward_description', reward_description_var
        );

        PERFORM pg_notify('reward', json_payload::text);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reward_trigger
AFTER INSERT ON UnitRewards
FOR EACH ROW
EXECUTE FUNCTION process_reward();
