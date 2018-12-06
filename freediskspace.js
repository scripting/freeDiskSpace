const myProductName = "Free Disk Space", myVersion = "0.4.0"; 

const fs = require ("fs");
const utils = require ("daveutils");
const s3 = require ("daves3");
const cmd = require ("node-cmd"); 

var config = {
	s3path: undefined, 
	};
var stats = {
	percent: undefined,
	ctTotal: undefined,
	ctUsed: undefined,
	ctAvailable: undefined,
	whenLastUpdate: undefined,
	ctUpdates: 0
	};
const fnameConfig = "config.json";

function getFreeDiskSpace () {
	cmd.get ("df /", function (err, data, stderr) {
		var line2 = utils.stringNthField (data, "\n", 2);
		
		function popnext () {
			var word;
			line2 = utils.trimWhitespace (line2);
			word = utils.stringNthField (line2, " ", 1);
			line2 = utils.stringDelete (line2, 1, word.length);
			return (word);
			}
		popnext (); //throw away first string
		var ctTotal = popnext ();
		
		var ctUsed = popnext ();
		
		var ctAvailable = popnext ();
		
		var percent = ((ctTotal - ctUsed) / ctTotal) * 100;
		
		stats.percent = Math.round (percent);
		stats.ctTotal = ctTotal;
		stats.ctUsed = ctUsed;
		stats.ctAvailable = ctAvailable;
		stats.whenLastUpdate = new Date ();
		stats.ctUpdates++;
		
		var jsontext = utils.jsonStringify (stats);
		s3.newObject (config.s3path, jsontext, "application/json", "public-read", function (err, data) {
			if (err) {
				console.log (myProductName + ": s3path == " + config.s3path + ", err.message == " + err.message);
				}
			else {
				}
			});
		});
	}

console.log ("\n" + myProductName + " v" + myVersion + ".");
fs.readFile (fnameConfig, function (err, data) {
	if (err) {
		console.log (err.message);
		}
	else {
		const jstruct = JSON.parse (data);
		for (var x in jstruct) {
			config [x] = jstruct [x];
			}
		console.log ("config == " + utils.jsonStringify (config));
		s3.getObject (config.s3path, function (err, data) {
			if (!err) {
				const jstruct = JSON.parse (data.Body);
				for (var x in jstruct) {
					stats [x] = jstruct [x];
					}
				}
			console.log ("stats == " + utils.jsonStringify (stats));
			getFreeDiskSpace ()
			utils.runEveryMinute (getFreeDiskSpace);
			});
		}
	});
