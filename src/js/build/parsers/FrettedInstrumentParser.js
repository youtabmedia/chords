var _ = require('underscore');
var string = require('underscore.string');
var CSVParser = require('./CSVParser');
var ValueParser = require('./ValueParser');
/**
 * @constructor
 */
FrettedInstrumentParser = function () {
    this.instrument_ = null;
    this.tuning_ = null;
    this.callback_ = null;

    /**
     * @dict
     * @private
     */
    this.cagedSourceChords_ = {};

    /**
     */
    this.csvParser_ = new CSVParser()
      .setStartLine(1)
      .addColumnParser('name', ValueParser.basic)
      .addColumnParser('aliases', ValueParser.aliasList)
      .addColumnParser('root', ValueParser.basic)
      .addColumnParser('chords', ValueParser.aliasList)
      .addColumnParser('frets', ValueParser.positionList)
      .addColumnParser('fingering', ValueParser.positionList)
      .addColumnParser('alternateFrets', ValueParser.positionList)
      .addColumnParser('alternateFingering', ValueParser.positionList)
      .addColumnParser('cagedOrder', ValueParser.stringList)
      .addColumnParser('fingeringWhenUsedAsCaged', ValueParser.positionList)
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
        return this;
    }
    this.csvParser_.parse(csv, _.bind(this.assemble_, this));
    return this;
};

FrettedInstrumentParser.prototype.assemble_ = function(error, sourceChordList) {
    if (error) {
        this.done_(error);
        return;
    }

    this.csvParser_ = this.csvParser_.destroy();

    this.createGAGEDSources_(sourceChordList);
    this.done_(null, sourceChordList)
};

/**
 * create a lookup table defining the shapes of CAGED chords
 * @param {Array} sourceChordList
 * @private
 */
FrettedInstrumentParser.prototype.createGAGEDSources_ = function(sourceChordList) {
    _.forEach(sourceChordList, function(sourceChord) {
        var frets = sourceChord.alternateFrets || sourceChord.frets;
        var fingering = sourceChord.alternateFingering || sourceChord.frets;
        if (sourceChord.name && frets) {
            var rootContainer = this.cagedSourceChords_[sourceChord.root];
            if (!rootContainer) {
                rootContainer = this.cagedSourceChords_[sourceChord.root] = {};
            }
            _.forEach(sourceChord.chords, function(chord) {
                rootContainer[chord] = {
                    fingering: fingering,
                    frets: frets
                };
            })
        }
    }, this);
};

FrettedInstrumentParser.prototype.assembleGroups_ = function(row, index, rows) {
    var group;
    if (row.name) {
        group = [];
        this.groups_.push(group);
    } else {
        group = _.last(this.groups_);
    }
    group.push(row);
};

FrettedInstrumentParser.prototype.summarize_ = function() {
    _.forEach(this.groups_, function(group) {
        var first = _.first(group);
        console.log(first.name);
        _.forEach(group, function(chord) {
            console.log('\t', first.name, first.aliases, chord.fingering, chord.cagedOrder);
        })
    }, this)
};


FrettedInstrumentParser.prototype.done_ = function(error, data) {
    this.callback_(error || null, {
        instrument: this.instrument_,
        tuning: this.tuning_,
        data: data
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



