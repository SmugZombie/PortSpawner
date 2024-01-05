const express = require('express');
const Docker = require('dockerode');
const docker = new Docker();

//const config = require('../config/config');
//const Auth = require('../lib/auth');
//const Audit = require('../lib/audit');
//const { Users, Limits } = require('../data/db');
const router = express.Router();
module.exports = router;

const portBlacklist = [22, 25, 465, 443, 80]; // Add more ports as needed

function isIntegerInRange(input) {
    var number = parseInt(input, 10);
    return !isNaN(number) && Number.isInteger(number) && number >= 0 && number <= 65535;
}
  
router.post('/startContainer', async (req, res) => {
    try {
        const { port } = req.body;

        if(!isIntegerInRange(port)){
        res.status(400).json({ error: 'Port must be an integer within 1-65535' });
        return;
        }

        if (portBlacklist.includes(port)) {
        res.status(400).json({ error: 'Port is in the blacklist and cannot be exposed.' });
        return;
        }
        
        // Create a Docker container with the specified port exposed
        const container = await docker.createContainer({
        Image: 'my-nginx-hello-world', // Replace with your Docker image name
        ENV: [],
        HostConfig: {
            PortBindings: {
            [`80/tcp`]: [{ HostPort: `${port}` }],
            },
        },
        ExposedPorts: {
        [`${port}/tcp`]: {}
        },
        });

        // Start the container
        await container.start();

        // Set a timeout to stop the container after 5 minutes
        setTimeout(async () => {
        await container.stop();
        await container.remove();
        }, 5 * 60 * 1000);

        res.status(200).json({ message: `Container started on port ${port}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start the container.' });
    }
});

// New endpoint to list all containers and their exposed ports
router.get('/listContainers', async (req, res) => {
    try {
      const containers = await docker.listContainers({ all: true });
      const containerInfo = containers.map(container => {
        const exposedPorts = Object.keys(container.Ports || {}).map(port => {
          return {
            containerPort: port,
            hostPort: container.Ports[port],
          };
        });
        return {
          id: container.Id,
          image: container.Image,
          exposedPorts,
        };
      });
  
      res.status(200).json(containerInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to list containers.' });
    }
  });
  
// New endpoint to check if a specific port is exposed
router.get('/checkPort/:port', async (req, res) => {
    try {
        const { port } = req.params;

        if (portBlacklist.includes(port)) {
        res.status(400).json({ error: 'Port is in the blacklist and cannot be exposed.' });
        return;
        }

        // Get a list of all containers
        const containers = await docker.listContainers({ all: true });

        // Check if the specified port is exposed in any container
        const isPortExposed = containers.some((container) => {
        const containerPorts = container.Ports.map((p) => p.PublicPort);
        return containerPorts.includes(parseInt(port));
        });

        res.status(200).json({ isPortExposed });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check the port status.' });
    }
});
  
// New endpoint to kill a container based on container ID
router.delete('/killContainer/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const container = docker.getContainer(id);
        await container.stop();
        await container.remove();

        res.status(200).json({ message: `Container ${id} has been stopped and removed.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to stop and remove the container.' });
    }
});
  