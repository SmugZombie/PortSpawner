require("dotenv").config();
try{
    module.exports = {
        app: {
            name: process.env.APPNAME || "Port Spawner",
            shortName: process.env.APPSHORTNAME || "Port Spawner",
            tagline: process.env.APPTAGLINE || "",
            baseDomain: process.env.APPBASEDOMAIN || "",
            version: process.env.version || "v0.0.15",
            port: process.env.port || 3000
        },
        defaultLimits: {
            containerLimit: 25,
        },
        restrictions: {
            restrictedPorts : [
                1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 
                79, 87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 
                135, 137, 139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 
                531, 532, 540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719, 
                1720, 1723, 2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 
                6668, 6669, 6697, 10080
            ]
        }
    };
}
catch(error){
    console.log("Configuration issue detected.")
    console.log(error);
    process.exit(22);
}