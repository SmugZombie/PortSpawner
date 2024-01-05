const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const apiRouter = require('./routes/api');
const path = require('path');

app.use(express.json());
app.use(cors());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, 'web/build')));

app.get('/', (req, res) => {
  let filePath = path.join(__dirname, 'web/build', 'index.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, serve a different file or handle the error as needed
      res.status(404).sendFile(path.join(__dirname, 'web', 'notready.html'));
    } else {
      // File exists, serve it
      res.sendFile(filePath);
    }
  });
});

const PORT = 3000; // Change this to your desired port
app.listen(PORT, () => {
  console.log(`Management server is running on port ${PORT}`);
});
