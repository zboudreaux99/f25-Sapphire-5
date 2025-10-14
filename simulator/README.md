# Sensor Simulator

## Purpose

The `simulator.py` script is a Python application designed to mimic the behavior of real-world IoT sound sensors for the Sapphire Sounds project. Its primary functions are:

1.  **Generate Sensor Readings**: It creates realistic decibel (dB) level readings and posts them to the `/api/sensor/reading` endpoint.
2.  **Send Heartbeats**: Periodically, it sends a "heartbeat" status update to the `/api/sensor/heartbeat` endpoint to indicate that the sensor is online and functioning correctly.

This simulator provides a continuous flow of data into the database, which is crucial for developing and testing the backend services and the frontend dashboard without requiring physical hardware.

## Requirements

The simulator is containerized, and its dependencies are managed by Docker. The script itself requires:

*   Python 3
*   `requests` library (for making HTTP requests to the API)
*   `numpy` library (for generating realistic random data)

These dependencies are automatically installed from `requirements.txt` when the Docker image is built.

## Usage

The simulator is managed as a service within the project's main `docker-compose.yml` file. You can control the entire application stack or just the simulator service with the following commands from the project's root directory.

| Action | Description | Command |
| --- | --- | --- |
| **Start Core Environment** | Starts the core stack (DB, Server, Frontend) without the simulator. | `docker-compose up` |
| **Start Simulation On Demand** | Starts *only* the simulator service. Use this after the core environment is running. | `docker-compose up -d simulator` |
| **Stop Simulation On Demand** | Stops the simulator service while keeping the rest of the stack running. | `docker-compose stop simulator` |
| **Start Everything** | Starts the entire stack, including the simulator. | `docker-compose up --profile simulate` |
| **Stop Entire Environment** | Stops and removes all containers for the project. | `docker-compose down` |
