import fs from "fs";
import {Transform} from "stream";


import readline from "readline";
import {advanceHeroAndElephant} from "./solution-b.js";
fs.createReadStream("./state", {});
const transformedData= fs.createWriteStream("./advancedState");

const uppercase = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
    },
});

// fileStream.pipe(uppercase).pipe(transformedData);

const valves = JSON.parse(`{              
  "AA": {      
    "id": "AA",
    "flow": 0, 
    "paths": { 
      "BB": 1, 
      "CC": 2, 
      "DD": 1, 
      "EE": 2, 
      "HH": 5, 
      "JJ": 2  
    }          
  },           
  "BB": {      
    "id": "BB",
    "flow": 13,
    "paths": { 
      "CC": 1, 
      "DD": 2, 
      "EE": 3, 
      "HH": 6, 
      "JJ": 3  
    }          
  },           
  "CC": {      
    "id": "CC",
    "flow": 2,
    "paths": {
      "BB": 1,
      "DD": 1,
      "EE": 2,
      "HH": 5,
      "JJ": 4
    }
  },
  "DD": {
    "id": "DD",
    "flow": 20,
    "paths": {
      "BB": 2,
      "CC": 1,
      "EE": 1,
      "HH": 4,
      "JJ": 3
    }
  },
  "EE": {
    "id": "EE",
    "flow": 3,
    "paths": {
      "BB": 3,
      "CC": 2,
      "DD": 1,
      "HH": 3,
      "JJ": 4
    }
  },
  "HH": {
    "id": "HH",
    "flow": 22,
    "paths": {
      "BB": 6,
      "CC": 5,
      "DD": 4,
      "EE": 3,
      "JJ": 7
    }
  },
  "JJ": {
    "id": "JJ",
    "flow": 21,
    "paths": {
      "BB": 3,
      "CC": 4,
      "DD": 3,
      "EE": 4,
      "HH": 7
    }
  }
}`)


async function processLineByLine() {
    const fileStream = fs.createReadStream('state');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        console.log(`Line from file: ${line}`);
        const state = JSON.parse(line);
        console.log(state)
        const advancedState = advanceHeroAndElephant(valves, state);
        console.log(advancedState)
        advancedState.forEach(s => transformedData.write(JSON.stringify(s) + "\n"))
    }
}

processLineByLine();