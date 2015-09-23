var _ = require('underscore');
var string = require('underscore.string');
var teoria = require('teoria');

var CSVParser = require('./CSVParser');
var BuildModel = require('../models/FrettedBuildModel');
/**
 * @constructor
 */
FrettedInstrumentParser = function () {
    this.instrument_ = null;
    this.tuning_ = null;
    this.callback_ = null;
    this.map_ = {};
    this.lookup_ = {};
};

/**
 * @param {string} instrument
 * @param {string} tuning
 * @param {string} csv
 * @param {Function} callback
 * @return {FrettedInstrumentParser}
 */
FrettedInstrumentParser.prototype.parse = function(instrument, tuning, rows, callback) {
    this.instrument_ = instrument;
    this.tuning_ = tuning;
    this.callback_ = callback;

    var buildModel;
    // build models in list with the chord name as the key
    _.forEach(rows, function(row) {
        buildModel = new BuildModel(tuning)
          .deserialize(row, buildModel)
          .register(this.map_);
    }, this);

    // build a lookup table for derivate sources
    _.forEach(this.map_, function(buildModelList, key) {
        if (_.isEmpty(buildModelList)) {
            return;
        }
        var list = _.chain(buildModelList)
          .filter(function(buildModel) {
              return buildModel.isDefined()
          })
          .sortBy('priority_')
          .value();

        if (!_.isEmpty(list)) {
            this.lookup_[key] = list;
        }
    }, this);

    // complete chord fingerings by using the lookup
    _.forEach(this.map_, function(buildModelList, key, map) {
        var results =  buildModelList.concat();
        _.forEach(buildModelList, function(buildModel, insertionIndex) {
            buildModel.buildUsingPointers(this.lookup_, results, buildModel, insertionIndex + 1);
        }, this);

        var uniq = {};
        map[key] = _.chain(results)
          .reject(function(chord) {
              var rejected = !chord.isDefined() || uniq[chord.valueOf()];
              uniq[chord.valueOf()] = true;
              return rejected;
          })
          .value();

        //if (key === 'Gm') {
        //    console.log('count', map[key].length);
        //    console.log(_.map(map[key], function(chord, index) {
        //        return index + ':\t' + chord.name + '\t' + chord.own_.frets.join(',');
        //    }).join('\n'));
        //}
        // console.log(key, results.length);

    }, this);

    // console.log(this.map_);

    process.nextTick(_.bind(this.done_, this));

    return this;
};


FrettedInstrumentParser.prototype.done_ = function(error) {
    this.callback_(error || null, {
        type: this.instrument_,
        tuning: this.tuning_,
        data: _.mapObject(this.map_, function(chordList) {
            return _.map(chordList, function(chord) {
                return chord.serialize();
            });
        })
    });
    this.callback_ = null;
};

module.exports = exports = FrettedInstrumentParser;


/**
 * @typedef {{
 * fingering: Array.<number>,
 * frets: Array.<number>
 * }}
 */
var ChordPosition;

/**
 * @typedef {{
 * fingering: Array.<number>,
 * frets: Array.<number>
 * }}
 */
var PositionMap;



