var sys = require('sys');
var exec = require('child_process').exec;

var fnin = process.argv[2];
var fnout = process.argv[3];
var cpp = process.env.CPP;
var contents = fs.readFileSync(fnin, "ascii");
contents = contents.replace(/^([\s\t]*\n)/gm, "/*MACRO*/\n");
fs.writeFileSync(".temp.js", contents);
exec(cpp + ".temp.js " + fnout, function() {
    contents = fs.readFileSync(fnout, "ascii");
    contents = contents.replace(/\/\*MACRO\*\//, "");
    fs.writeFileSync(fnout, contents);
});
