'use strict';
var execFile = require('child_process').execFile;

module.exports.get = function (cb) {
	if (process.platform !== 'darwin') {
		throw new Error('Only OS X systems are supported');
	}

	var cmd = 'ioreg';
	var args = [
		'-c',
		'AppleBacklightDisplay',
		'-r',
		'-d',
		1
	];

	execFile(cmd, args, function (err, stdout) {
		if (err) {
			cb(err);
			return;
		}

		var reg = new RegExp('"brightness"={(.*?)}');
		var str = reg.exec(stdout)[0];
		var b;

		try {
			b = JSON.parse(str.substring(str.indexOf('{'), str.lastIndexOf('}') + 1).replace(/=/g, ':'));
		} catch (err) {
			cb(err);
			return;
		}

		cb(null, b.value / b.max);
	});
};

module.exports.set = function (val, cb) {
	if (process.platform !== 'darwin') {
		throw new Error('Only OS X systems are supported');
	}

	if (typeof val !== 'number' || isNaN(val) === 'true' || val < 0 || val > 1) {
		throw new Error('Expected a value between 0 and 1');
	}

	execFile('./main', [val], {cwd: __dirname}, function (err) {
		if (err) {
			cb(err);
			return;
		}

		cb();
	});
};
