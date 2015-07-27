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
        var inst = result[instrument];
        if (!inst) {
            result[instrument] = inst = {};
        }
        inst[tuning] = parseCSV(
          tuning,
          fs.readFileSync(file, {encoding: 'utf8'})
        );
    });
    console.log(JSON.stringify(result, null, 2));
}

function parseCSV(tuning, csv) {
    return _.chain(csv.split('\n'))
      .rest(1)
      .map(parseLine)
      .compact()
      .value();
}

function parseLine(line) {
    if (!line) {
        return null;
    }
    return line;
}


/**
 * @typedef {{
 * name: string,
 * shortName: string,
 * root: string,
 * chord: string,
 * diagrams: Array.<Diagram>,
 * CAGED: Diagram
 * }}
 **/
var Chord;

/**
 * @typedef {{
 * fingering: Array.<number>,
 * frets: Array.<number>,
 * CAGED: string
 * }}
 **/
var Diagram;

/**
 * @typedef {{
 * name: string,
 * shortName: string,
 * root: string,
 * chord: string,
 * frets: (Array.<number> | null),
 * fingering: (Array.<number> | null),
 * cagedSource: {frets: (Array.<number> | null), fingering: (Array.<number> | null)},
 * cagedOrder: (Array.<string> | null)
 * }}
 **/
var Parsed;