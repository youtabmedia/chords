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
    _.forEach(rows, function(row) {
        buildModel = new BuildModel(tuning)
          .deserialize(row, buildModel)
          .register(this.map_);
    }, this);

    _.forEach(this.map_, function(buildModelList, key, map) {
        // console.log(key, buildModelList.length);
        _.forEach(buildModelList, function(buildModel) {
            buildModel.buildUsingDefinition(map, buildModelList);
        });
    }, this);

    // console.log(this.map_);

    process.nextTick(_.bind(this.done_, this));

    return this;
};


FrettedInstrumentParser.prototype.done_ = function(error) {
    this.callback_(error || null, {
        instrument: this.instrument_,
        tuning: this.tuning_,
        data: this.map_
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



