var _ = require('underscore');
var string = require('underscore.string');
var CSVParser = require('./CSVParser');
/**
 * @constructor
 */
FrettedInstrumentParser = function () {
    this.instrument_ = null;
    this.tuning_ = null;
    this.callback_ = null;

    /**
     */
    this.csvParser_ = new CSVParser()
      .setStartLine(1)
      .addColumnParser('name', this.basic_)
      .addColumnParser('aliases', this.basic_)
      .addColumnParser('root', this.basic_)
      .addColumnParser('chord', this.basic_)
      .addColumnParser('frets', this.basic_)
      .addColumnParser('fingering', this.basic_)
      .addColumnParser('cagedOrder', this.basic_)
      .addColumnParser('fingeringWhenCaged', this.basic_)
};

/**
 * @param {string} instrument
 * @param {string} tuning
 * @param {string} csv
 * @param {Function} callback
 * @return {FrettedInstrumentParser}
 */
FrettedInstrumentParser.prototype.parse = function(instrument, tuning, csv, callback) {
    this.instrument_ = instrument;
    this.tuning_ = tuning;
    this.callback_ = callback;

    if (_.isEmpty(csv)) {
        this.done_(null, []);
        return;
    }
    this.csvParser_.parse(csv, _.bind(this.assemble_, this));
    return this;
};

FrettedInstrumentParser.prototype.assemble_ = function(error, rows) {
    if (error) {
        this.done_(error);
        return;
    }
    this.done_(null, rows)
};


FrettedInstrumentParser.prototype.done_ = function(error, data) {
    this.callback_(error || null, {
        instrument: this.instrument_,
        tuning: this.tuning_,
        data: data
    });
    this.callback_ = null;
};

FrettedInstrumentParser.prototype.basic_ = function(value) {
    return string.trim(value || '') || null;
};

module.exports = exports = FrettedInstrumentParser;



