# Use an official Python runtime as a parent image
FROM python:3.9

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./ .

# Define environment variable
ENV UDP_PORT=80

# Expose the UDP port
EXPOSE $UDP_PORT/udp

# Run the Python script
CMD ["python", "listener.py"]
