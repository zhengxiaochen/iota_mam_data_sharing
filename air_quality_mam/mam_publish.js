/*
Author: Xiaochen Zheng (xiaochen.zheng@alumnos.upm.es)

The mam_publish.js file read JSON data from local folder and publish them to the tangle using MAM.
In each JSON file there is one JSON object. In this experiment, 100 JSON samples are read and published to test the waiting time of publishing data to the Tangle.

Usage:
1)  You can change the default settings: MODE or SIDEKEY. In this case, make the same changes in mam_receive.js
2)  Command to start the app: node mam_publish.js <root>

Acknowledgement:
This file is modified based on the code from Robert Lie (mobilefish.com).
Any future use please give credits to the original author too.
The original code can be found here:
https://www.mobilefish.com/developer/iota/iota_quickguide_raspi_mam.html 
*/
const Mam = require('./lib/mam.client.js');
const IOTA = require('iota.lib.js');
//const moment = require('moment');
//find a public node here
//https://www.tangle-nodes.com/?sorts[load]=1&sorts[tls]=-1 
//const iota = new IOTA({ provider: 'https://nodes.testnet.iota.org:443' }); 
//const iota = new IOTA({ provider: 'https://irino.de:443' });
const iota = new IOTA({ provider: 'https://power.benderiota.com:14267' }); //memory usage:17.9%, neighbours: 7
const MODE = 'public'; // public, private or restricted
const SIDEKEY = 'mysecret'; // Enter only ASCII characters. Used only in restricted mode
const SECURITYLEVEL = 3; // 1, 2 or 3
//const TIMEINTERVAL  = 30; // seconds

// Initialise MAM State
let mamState = Mam.init(iota, undefined, SECURITYLEVEL);

// Set channel mode
if (MODE == 'restricted') {
    const key = iota.utils.toTrytes(SIDEKEY);
    mamState = Mam.changeMode(mamState, MODE, key);
} else {
    mamState = Mam.changeMode(mamState, MODE);
}

// Publish data to the tangle
const publish = async function(packet) {
    // Create MAM Payload
    const trytes = iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(mamState, trytes);

    // Save new mamState
    mamState = message.state;
    console.log('Root: ', message.root);
    console.log('Address: ', message.address);

    // Attach the payload.
    await Mam.attach(message.payload, message.address);

    return message.root;
}


const executeDataPublishing = async function() {	 
	 var fs = require("fs"); //for loading JSON file
	 const jsonpath = "./test_samples/"; //path to the folder where JSON files saved
	 
	 var i;	
    for (i = 1; i < 101; i++) {
       var full_path = jsonpath.concat("js",i,".json"); //full path to the JSON file           
       var textByLine = fs.readFileSync(full_path).toString().split("\n"); //parse JSON object
       const json_multi = JSON.parse(textByLine[0]); 
       json = json_multi[0]; //one object each time in this case
       //console.log("json=",json); //print json object
              
       //count waiting time
       var date0 = new Date();
       var t0 = date0.getTime();             
       const root = await publish(json); //publish data
       var date1 = new Date();
       var t1 = date1.getTime();       
       var watingtime = t1-t0;
              
       //print results 
       console.log(`waiting_time:${watingtime}`); 
       console.log(`location: ${json.location}, timestamp: ${json.timestamp}, pm2_5: ${json.pm2_5}, pm10: ${json.pm10},tvoc: ${json.tvoc}, co2: ${json.co2}, temperature: ${json.temperature}, humidity: ${json.humidity},illumination: ${json.illumination}, noise: ${json.noise}, hcho: ${json.hcho}, co: ${json.co}, c6h6: ${json.c6h6}, no2: ${json.no2}, o3: ${json.o3}`);
 
    }  	
}
//ROOT IN THIS CASE:
// AP9QJHROKZNNNORQBIQAXXSHEPARFVVTLDDGGOTIOEYNNJKKROILUXUYIAANDPUE9SXWASFHJGRAGBSHK
// Start main process
executeDataPublishing();


//set interval of broadcasting
//setInterval(executeDataPublishing, TIMEINTERVAL*1000); 
