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
const iota = new IOTA({ provider: 'https://pow.iota.community:443' }); //memory usage:17.9%, neighbours: 7
const MODE = 'restricted'; // public, private or restricted
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
	 var t_array =[]; //array to hold waiting time
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
       //const root = publish(json);
       var date1 = new Date();
       var t1 = date1.getTime();       
       var waitingtime = t1-t0;
              
       t_array[i-1] = waitingtime;
        
       //print results 
       console.log(`waiting_time:${waitingtime}`); 
       console.log(t_array.toString()); 
       //console.log(`date: ${json.date}, alcohol: ${json.alcohol}, caffee: ${json.caffee},Medicine: ${json.Medicine}, t1: ${json.t1}, ArmExtendL: ${json.ArmExtendL}, ArmExtendR: ${json.ArmExtendR},t2: ${json.t2}, TouchNoseL: ${json.TouchNoseL}, TouchNoseR: ${json.TouchNoseR}, t3: ${json.t3}, Writting: ${json.Writting}, t4: ${json.t4}, LargeSpiral: ${json.LargeSpiral}`);
      //"X":18,"date":"2016-05-30T17:23:56.000Z","alcohol":"No","caffee":"Si","Medicine":"SumialMysoline","t1":"2016-05-30T17:23:37.000Z","ArmExtendL":0,"ArmExtendR":4,"t2":"2016-05-30T17:23:39.000Z","TouchNoseL":0,"TouchNoseR":4,"t3":"2016-05-30T17:23:41.000Z","Writting":4,"t4":"2016-05-30T17:23:43.000Z","LargeSpiral":4,"SmallSpiral":0,"StraightLine":0,"t5":"2016-05-30T17:23:45.000Z","CupsL":0,"CupsR":4,"t6":"2016-05-30T17:23:46.000Z","DrinkingL":4,"t7":"2016-05-30T17:23:48.000Z","Angle":0,"PhoneMod":"Redmi 3","MAC":"64:cc:2e:d6:6d:46","uuid":"784c8bcbeed07c30"
    }  	
}

// Start main process
executeDataPublishing();


//set interval of broadcasting
//setInterval(executeDataPublishing, TIMEINTERVAL*1000); 
