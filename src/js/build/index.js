var fs = require('fs');
var path = require('path');
var glob = require('glob');
var async = require('async');

var _ = require('underscore');
var string = require('underscore.string');

var src = path.join(process.cwd(), 'csv/**/*.csv');

var FrettedInstrumentParser = require('./parsers/FrettedInstrumentParser');

var parsers_ = {
    guitar: new FrettedInstrumentParser(),
    ukelele: new FrettedInstrumentParser(),
    banjo: new FrettedInstrumentParser()
};

glob(src, {}, function(error, files) {
    if (error) {
        throw error;
    }
    var operations = _.map(files, function(file) {
        var descriptor = _.last(file.split('/'), 2);
        var instrument = descriptor[0];
        var tuning = descriptor[1].replace('.csv', '');
        return function(callback) {
            fs.readFile(file, {encoding: 'utf8'}, function(error, csv) {
                if (error) {
                    callback(error);
                    return;
                }
                parsers_[instrument].parse(instrument, tuning, csv, callback);
            });

        };
    });
    async.parallel(operations, done);
});

function done(error, results) {
    console.log(error);
    console.log(results);
}


//function parseCSV(tuning, csv) {
//.parse(csv, function() {
//        console.log('parsed', arguments);
//    });
//    //return _.chain(csv.split('\n'))
//    //  .rest(1)
//    //  .map(parseLine)
//    //  .compact()
//    //  .value();
//}

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