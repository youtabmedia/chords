var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('underscore');
var string = require('underscore.string');

var src = path.join(process.cwd(), 'csv/**/*.csv');

var CSVParser = require('../parsers/CSVParser');

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
    var p = new CSVParser()
      .setStartLine(1)
      .addColumnParser('name', basic)
      .addColumnParser('aliases', basic)
      .addColumnParser('root', basic)
      .addColumnParser('chord', basic)
      .addColumnParser('frets', basic)
      .addColumnParser('fingering', basic)
      .addColumnParser('cagedOrder', basic)
      .addColumnParser('fingeringWhenUsedAsCaged', basic)
      .parse(csv, function() {
          console.log('parsed', arguments);
      });
    //return _.chain(csv.split('\n'))
    //  .rest(1)
    //  .map(parseLine)
    //  .compact()
    //  .value();
}

var columns = [
    {
        key: 'name',
        parser: basic
    },
    {
        key: 'shortName',
        parser: basic
    },
    {
        key: 'root',
        parser: basic
    },
    {
        key: 'chord',
        parser: basic
    },
    {
        key: 'frets',
        parser: basic
    },
    {
        key: 'fingering',
        parser: basic
    },
    {
        key: 'cagedOrder',
        parser: basic
    },
    {
        key: 'cagedSource',
        parser: basic
    }
];

function parseLine(line) {
    if (!line) {
        return null;
    }
    var parts = line.split(',');
    var ret = {};
    _.forEach(columns, function(column, index) {
        ret[column.key] = column.parser(parts[index]);
    });
    return ret;
}

function basic(value) {
    if (!_.isString(value)) {
        return null;
    }
    return string.trim(value);
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