const myProductName = "Free Disk Space", myVersion = "0.4.4"; 

exports.get = getFreeDiskSpace; 

const fs = require ("fs");
const utils = require ("daveutils");
const s3 = require ("daves3");
const cmd = require ("node-cmd"); 

function getFreeDiskSpace (stats, callback) {
	var whenstart = new Date ();
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
		
		stats.productName = myProductName;
		stats.version = myVersion;
		stats.percent = Math.round (percent);
		stats.ctTotal = ctTotal;
		stats.ctUsed = ctUsed;
		stats.ctAvailable = ctAvailable;
		stats.ctSecs = utils.secondsSince (whenstart);
		stats.whenLastUpdate = new Date ();
		if (stats.ctUpdates === undefined) {
			stats.ctUpdates = 0;
			}
		stats.ctUpdates++;
		
		if (callback !== undefined) { //10/11/19 by DW
			callback ();
			}
		});
	}
