import requests
import random
import time
import numpy as np
import os

# --- Configuration ---
API_HOST = os.environ.get("API_HOST", "localhost")
API_PORT = os.environ.get("API_PORT", "8080")
BASE_API_URL = f"http://{API_HOST}:{API_PORT}/api/sensor" 

def get_sensor_ids():
    try:
        response = requests.get(f"{BASE_API_URL}?fields=SensorId")
        response.raise_for_status() 
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching sensor IDs: {e}")
        return []

# --- Data Generation ---
def generate_realistic_db(mean=85, std_dev=5):
    db = np.random.normal(mean, std_dev)
    db = max(70, min(100, int(db)))
    return db

def generate_heartbeat_status():
    status = 'OK'
    if random.random() < 0.05:
        status = 'DEGRADED' 
    return status

# --- API Interaction ---
def send_reading(sensor_id):
    db_reading = generate_realistic_db()
    reading_payload = {
        "sensorId": sensor_id,
        "db": db_reading
    }
    try:
        response = requests.post(f"{BASE_API_URL}/reading", json=reading_payload)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"ERROR sending reading for sensor {sensor_id}: {e}")

def send_heartbeat(sensor_id):
    status = generate_heartbeat_status()
    heartbeat_payload = {
        "sensorId": sensor_id,
        "connectivityStatus": status
    }
    try:
        response = requests.post(f"{BASE_API_URL}/heartbeat", json=heartbeat_payload)
        response.raise_for_status()
        print(f"Sensor {sensor_id}: Sent heartbeat. Status: {status}")
    except requests.exceptions.RequestException as e:
        print(f"ERROR sending heartbeat for sensor {sensor_id}: {e}")

# --- Main Simulation Loop ---
def run_simulation():
    SENSOR_IDS = get_sensor_ids()
    if not SENSOR_IDS:
        print("No sensor IDs found. Exiting simulation.")
        return

    last_heartbeat_time = time.time()

    while True:
    
        for sensor_id in SENSOR_IDS:
            send_reading(sensor_id['SensorId'])

        # Send a heartbeat for all sensors every 60 seconds
        if time.time() - last_heartbeat_time >= 60:
            print("\n--- Sending all heartbeats ---")
            for sensor_id in SENSOR_IDS:
                send_heartbeat(sensor_id['SensorId'])
            last_heartbeat_time = time.time()
            print("-----------------------------\n")

        time.sleep(10) # Wait 10 seconds before the next reading cycle

if __name__ == "__main__":
    run_simulation()