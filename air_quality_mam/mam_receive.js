/*
Author: Xiaochen Zheng (xiaochen.zheng@alumnos.upm.es)

The mam_receive.js file extracts stored data from the tangle using MAM and print them on the screen.

Usage:
1)  You can change the default settings: MODE or SIDEKEY. In this case, make the same changes in mam_publish.js
2)  Command to start the app: node mam_receive.js <root>

Acknowledgement:
This file is modified based on the code from Robert Lie (mobilefish.com).
Any future use please give credits to the original author too.
The original code can be found here:
https://www.mobilefish.com/developer/iota/iota_quickguide_raspi_mam.html 
*/

const Mam = require('./lib/mam.client.js');
const IOTA = require('iota.lib.js');
//find a public node here
//https://www.tangle-nodes.com/?sorts[load]=1&sorts[tls]=-1 
const iota = new IOTA({ provider: 'https://power.benderiota.com:14267' }); 	

const MODE = 'restricted'; // public, private or restricted
const SIDEKEY = 'mysecret'; // Enter only ASCII characters. Used only in restricted mode

let root;
let key;

// Check the arguments
const args = process.argv;
if(args.length !=3) {
    console.log('Missing root as argument: node mam_receive.js <root>');
    process.exit();
} else if(!iota.valid.isAddress(args[2])){
    console.log('You have entered an invalid root: '+ args[2]);
    process.exit();
} else {
    root = args[2];
}

// Initialise MAM State
let mamState = Mam.init(iota);

// Set channel mode
if (MODE == 'restricted') {
    key = iota.utils.toTrytes(SIDEKEY);
    mamState = Mam.changeMode(mamState, MODE, key);
} else {
    mamState = Mam.changeMode(mamState, MODE);
}

// Receive data from the tangle
const executeDataRetrieval = async function(rootVal, keyVal) {
	 //count waiting time
    var date0 = new Date();
    var t0 = date0.getTime(); 
    
    let resp = await Mam.fetch(rootVal, MODE, keyVal, function(data) {
    	  var date1 = new Date();
        var t1 = date1.getTime();       
        var watingtime = t1-t0;
                
    	  str=iota.utils.fromTrytes(data);
        let json = JSON.parse(iota.utils.fromTrytes(data));
        
        console.log('Received data:'); 
        //console.log(`waiting_time:${watingtime}`); 
        console.log(`location: ${json.location}, timestamp: ${json.timestamp}, pm2_5: ${json.pm2_5}, pm10: ${json.pm10},
                    tvoc: ${json.tvoc}, co2: ${json.co2}, temperature: ${json.temperature}, humidity: ${json.humidity},
                    illumination: ${json.illumination}, noise: ${json.noise}, hcho: ${json.hcho}, co: ${json.co}, c6h6: ${json.c6h6}, no2: ${json.no2}, o3: ${json.o3}`);       
    });

    executeDataRetrieval(resp.nextRoot, keyVal);
}

executeDataRetrieval(root, key);
