var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('underscore');

var src = path.join(process.cwd(), 'csv/**/*.csv');

glob(src, {}, onGotFileList);

var result = {};
function onGotFileList(error, files) {
    if (error) {
        throw error;
    }
    _.forEach(files, function(file) {
        var pair = _.last(file.split('/'), 2);
        var instrument = pair[0];
        var tuning = pair[1].replace('.csv', '');
        var inst = o[instrument];
        if (!inst) {
            result[instrument] = inst = {};
        }
        inst[tuning] = {};
        parseChords(
          inst[tuning] = {},
          fs.readFileSync(file, {encoding: 'utf8'})
        );
    })
}


function parseChords(container, csv) {
    console.log(arguments);
}