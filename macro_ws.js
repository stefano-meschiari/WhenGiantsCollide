var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');

var fnin = process.argv[2];
var fnout = process.argv[3];
var task = process.argv[4] || "translate";
var contents;

if (task === "translate") {
    var cpp = process.env.CPP;
    contents = fs.readFileSync(fnin, "ascii");
    contents = contents.replace(/^([\s\t]*?\n)/gm, "/*MACRO*/\n");
    fs.writeFileSync(".temp.js", contents);

    exec(cpp + " .temp.js " + fnout, function() {
        contents = fs.readFileSync(fnout, "ascii");
        contents = contents.replace(/\/\*MACRO\*\//g, "");
        fs.writeFileSync(fnout, contents);
        exec("rm .temp.js");
    });
} else if (task === "consts") {
    contents = fs.readFileSync(fnin, "ascii");
    var re = /^#define ([^\s]+) ([\d\.\-e]+)$/gm;
    var lines = [];
    var matches;
    while ((matches = re.exec(contents)) !== null)
        lines.push("var " + matches[1] + " = " + matches[2] + ";");
    fs.writeFileSync(fnout, lines.join("\n"));
}
