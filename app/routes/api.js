const express = require('express');
const Docker = require('dockerode');
const docker = new Docker();
const router = express.Router();
const config = require('../config/config');
const axios = require('axios');
module.exports = router;

const portBlacklist = [22, 25, 465, 443, 80]; // Add more ports as needed

function isIntegerInRange(input) {
    var number = parseInt(input, 10);
    return !isNaN(number) && Number.isInteger(number) && number >= 0 && number <= 65535;
}

async function sendMessage(message){

const now = new Date();
const timestamp = now.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
//console.log(timestamp);


let config = {
  method: 'get',
  url: 'http://port.overflow.wtf/message?message=' + timestamp + " - " + message,
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


}

async function getCurrentContainerCount() {
  const containers = await docker.listContainers({ all: true });
  //console.log(containers, containers.length);
  return containers.length;
}
  
router.post('/startContainer/:type', async (req, res) => {
    try {
	const type = req.params.type;
        const { port } = req.body;

        if(await getCurrentContainerCount() > config.defaultLimits.containerLimit){
          res.status(400).json({ error: 'Too many open ports currently. Close a few or try again later' });
          return;
        }

        if(!isIntegerInRange(port)){
          res.status(400).json({ error: 'Port must be an integer within 1-65535' });
          return;
        }

        if (portBlacklist.includes(port) || config.restrictions.restrictedPorts.includes(port)) {
        res.status(400).json({ error: 'Port is in the blacklist and cannot be exposed.' });
        return;
        }
        
	let imagename = "";
	if(type.toLowerCase() == "udp"){
		imagename = "udplistener";
		baseport = port;
	}else{
		imagename = "tcplistener";
		baseport = 80;
	}


        // Create a Docker container with the specified port exposed
        const container = await docker.createContainer({
	        Image: imagename, // Replace with your Docker image name
        	ENV: [`EXT_PORT=${port}`],
        	HostConfig: {
            		PortBindings: {
            			[`80/${type}`]: [{ HostPort: `${port}` }],
            		},
        	},
        	ExposedPorts: {
        		[`${port}/${type}`]: {}
        	},
        });

        // Start the container
        await container.start();
	sendMessage(`New port is listening:  ${port}/${type}`);
        // Set a timeout to stop the container after 5 minutes
        setTimeout(async () => {
	sendMessage(`Closing port: ${port}/${type} - Reason: Timeout`);	
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
	//sendMessage(`Closing port: ${port}/${type} - Reason: Closed by User`);
	sendMessage(`Closing Port - Reason: Closed by User`);
        const container = docker.getContainer(id);
        await container.stop();
        await container.remove();

        res.status(200).json({ message: `Container ${id} has been stopped and removed.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to stop and remove the container.' });
    }
});
  
