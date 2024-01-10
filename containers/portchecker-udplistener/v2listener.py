import socket
import requests

UDP_IP = "0.0.0.0"  # Listen on all available network interfaces
UDP_PORT = 80  # Change this to your desired UDP port
#API_URL = "https://webhook.site/65243ba0-0657-4167-b4c0-9d4c8b47d61a"  # Replace with your API endpoint URL
API_URL = "http://port.overflow.wtf/message"

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Listening on UDP port {UDP_PORT}...")

while True:
    data, addr = sock.recvfrom(1024)
    message = data.decode('utf-8')
    print(f"Received message: {message} from {addr}")

    # Forward the data to the API endpoint
    try:
        response = requests.post(API_URL + "?message" + message)
        if response.status_code == 200:
            print(f"Data forwarded to API successfully")
        else:
            print(f"Failed to forward data to API. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error forwarding data to API: {str(e)}")
