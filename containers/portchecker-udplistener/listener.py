import socket
import requests
import logging
import os

UDP_IP = "0.0.0.0"  # Listen on all available network interfaces
UDP_PORT = 80  # Change this to your desired UDP port
EXT_PORT = os.environ.get("EXT_PORT")
API_URL = "http://port.overflow.wtf/message"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Create a UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, int(UDP_PORT)))

logging.info(f"Listening on UDP port {UDP_PORT}...")

while True:
    data, addr = sock.recvfrom(1024)
    message = data.decode('utf-8')
    logging.info(f"Received message: {message} from {addr}")
    #message = "Received message: {" + message + "} from {" + str(addr) + "}"
    masked_addr = '.'.join(addr[0].split('.')[:2]) + ".x.x"
    message =  "Received message: {" + message + "} from {" + str(masked_addr) + "} to port {" + str(EXT_PORT) + "}"
    # Forward the data to the API endpoint
    try:
        response = requests.get(API_URL + "?message=" + message)
        if response.status_code == 200:
            logging.info("Data forwarded to API successfully")
        else:
            logging.error(f"Failed to forward data to API. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Error forwarding data to API: {str(e)}")
