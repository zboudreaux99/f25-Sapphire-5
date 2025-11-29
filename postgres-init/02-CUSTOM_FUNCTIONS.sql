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