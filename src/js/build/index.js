console.time('parsing took:');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var async = require('async');

var _ = require('underscore');
var string = require('underscore.string');

var src = path.join(process.cwd(), 'static/instruments/**/*.csv');
var dest = path.join(process.cwd(), 'dist');
var csv = require('csv');

var FrettedInstrumentParser = require('./parsers/FrettedInstrumentParser');

var parsers_ = {
    guitar: new FrettedInstrumentParser(),
    ukulele: new FrettedInstrumentParser(),
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
            fs.readFile(path.join(file), {encoding: 'utf8'}, function onFileRead(error, data) {

                if (error) {
                    callback(error);
                    return;
                }

                csv.parse(data, {
                      skip_empty_lines: true,
                      trim: true
                  },
                  function(error, rows) {
                      if (error) {
                          callback(error);
                          return;
                      }
                      parsers_[instrument].parse(instrument, tuning, _.rest(rows || []), callback);
                  });
            });
            csv.parse()
        };
    });
    async.parallel(operations, done);
});

function done(error, results) {
    // console.log(error);
    // console.log(JSON.stringify(results, null, 2));
    console.timeEnd('parsing took:');
    fs.writeFile(
      path.join(dest, 'chords.json'),
      JSON.stringify(results),
      {encoding: 'utf8'},
      function(error) {
          console.log(error ? error.message : 'created output');
      }
    );
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