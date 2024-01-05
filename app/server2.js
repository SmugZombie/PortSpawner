const express = require('express');
const Docker = require('dockerode');

const app = express();
const docker = new Docker();

app.use(express.json());

app.post('/startContainer', async (req, res) => {
  try {
    const { port } = req.body;

    // Create a Docker container without port bindings initially
    const container = await docker.createContainer({
      Image: 'my-nginx-hello-world', // Replace with your Docker image name
    });

    // Start the container
    await container.start();

    // Get the container's ID
    const containerId = container.id;

    // Dynamically bind the requested port to the container
    await docker.getContainer(containerId).port({ PrivatePort: 80, PublicPort: port });

    res.status(200).json({ message: `Container started on port ${port}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start the container.' });
  }
});

const PORT = 3000; // Change this to your desired port
app.listen(PORT, () => {
  console.log(`Management server is running on port ${PORT}`);
});
