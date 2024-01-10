const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const apiRouter = require('./routes/api');
const path = require('path');
const http = require('http');
const expressWs = require('express-ws')(app);
const WebSocket = require('ws');

app.use(express.json());
app.use(cors());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, 'web/build')));

app.get('/', (req, res) => {
  // Serve your HTML file as you did before

 let filePath = path.join(__dirname, 'web/build', 'index.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, serve a different file or handle the error as needed
      res.status(404).sendFile(path.join(__dirname, 'web', 'index.html'));
    } else {
      // File exists, serve it
      res.sendFile(filePath);
    }
  });
});

app.get('/terminal.html', (req, res) => {
  // Serve your HTML file as you did before

 let filePath = path.join(__dirname, 'web/build', 'index.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, serve a different file or handle the error as needed
      res.status(200).sendFile(path.join(__dirname, 'web', 'terminal.html'));
    } else {
      // File exists, serve it
      res.sendFile(filePath);
    }
  });
});

app.get('/udp.html', (req, res) => {
  // Serve your HTML file as you did before

 let filePath = path.join(__dirname, 'web/build', 'index.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, serve a different file or handle the error as needed
      res.status(200).sendFile(path.join(__dirname, 'web', 'udp.html'));
    } else {
      // File exists, serve it
      res.sendFile(filePath);
    }
  });
});

// WebSocket handling
app.ws('/', (ws, req) => {
  console.log('A client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  ws.on('close', () => {
    console.log('A client disconnected');
  });
});

// Endpoint for receiving GET requests and forwarding to WebSocket clients
app.get('/message', (req, res) => {
  const message = req.query.message;

  if (message) {
    // Broadcast the received message to all connected clients
    expressWs.getWss().clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    res.send('Message sent to WebSocket clients.');
  } else {
    res.status(400).send('Message parameter is missing.');
  }
});

const PORT = 3000; // Change this to your desired port
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Management server is running on port ${PORT}`);
});
