const myProductName = "Free Disk Space app", myVersion = "0.4.3"; 

const s3 = require ("daves3");
const fs = require ("fs");
const utils = require ("daveutils");
const freeDiskSpace = require ("davediskspace");

var config = {
	s3path: undefined, 
	};
const fnameConfig = "config.json";

var whenLastUpdate;

function getSpace () {
	var stats = new Object ();
	whenLastUpdate = new Date ();
	s3.getObject (config.s3path, function (err, data) {
		if (!err) {
			const jstruct = JSON.parse (data.Body);
			for (var x in jstruct) {
				stats [x] = jstruct [x];
				}
			}
		freeDiskSpace.get (stats, function () {
			var jsontext = utils.jsonStringify (stats);
			s3.newObject (config.s3path, jsontext, "application/json", "public-read", function (err, data) {
				if (err) {
					console.log (myProductName + ": s3path == " + config.s3path + ", err.message == " + err.message);
					}
				else {
					console.log ("\n" + myProductName + " v" + myVersion + ", " + whenLastUpdate.toLocaleTimeString () + ", s3path == " + config.s3path + "\n\nstats == " + jsontext);
					}
				});
			});
		});
	}
function everyMinute () {
	if (utils.secondsSince (whenLastUpdate) >= 3600) { //an hour has passed since last check
		getSpace ();
		}
	}

fs.readFile (fnameConfig, function (err, data) {
	if (err) {
		}
	else {
		const jstruct = JSON.parse (data);
		for (var x in jstruct) {
			config [x] = jstruct [x];
			}
		}
	getSpace (); //get stats on startup
	utils.runEveryMinute (everyMinute);
	});
