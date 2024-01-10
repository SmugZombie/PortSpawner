import socket

UDP_IP = "0.0.0.0"  # Listen on all available network interfaces
UDP_PORT = 80  # Change this to your desired UDP port

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Listening on UDP port {UDP_PORT}...")

while True:
    data, addr = sock.recvfrom(1024)
    print(f"Received message: {data.decode('utf-8')} from {addr}")
