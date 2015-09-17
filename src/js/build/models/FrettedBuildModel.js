var _ = require('underscore');
var teoria = require('teoria');

/**
 * @param {Array.<string>} row
 * @param {FrettedBuildModel} prev
 * @constructor
 */
function FrettedBuildModel(row, prev) {
    this.sharps_ = {
        'C': 'C',
        'C#': 'Db',
        'D': 'D',
        'D#': 'Eb',
        'E': 'E',
        'E#': 'F',
        'F': 'F',
        'F#': 'Gb',
        'G': 'G',
        'G#': 'Ab',
        'A': 'A',
        'A#': 'Bb',
        'B': 'B',
        'B#': 'C'
    };

    this.flats_ = _.extend({'Cb': 'B'}, _.invert(this.sharps_));

    this.priority = 0;

    this.displayName = row[0] || prev.displayName;
    this.aliases = this.stringListParser(row[1]) || prev.aliases;
    this.bass = row[2] || prev.bass;
    this.chord = row[3] || prev.chord;

    this.own = {
        frets: this.fretParser(row[4]),
        fingering: this.fretParser(row[5])
    };

    this.alternateSources = this.stringListParser(row[6]);

    this.alternateDefinitions = {
        priority: row[8] ? parseInt(row[8]) : 0,
        frets: this.fretParser(row[9]) || this.own.frets,
        fingering: this.fretParser(row[10]) || this.own.fingering
    };
}

/**
 * @param {Object.<string, FrettedBuildModel>} map
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.alternates = function(map) {
    return this;
};

/**
 * @param {Object.<string, Array.<FrettedBuildModel>>} map
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.register = function(map) {
    _.forEach(this.aliases, function(alias) {
        var note;
        try {
            note = teoria.note(this.bass);
        } catch (err) {
            throw new Error('invalid bass note: ' + this.bass);
        }

        if (alias.indexOf(this.bass) !== 0) {
            if (note.accidentalValue() === -1) {
                console.log('mapping', this.bass, this.flats_[this.bass]);
                map[alias + '/' + this.flats_[this.bass]] = [this];
            } else if (note.accidentalValue() === 1) {
                console.log('mapping', this.bass, this.sharps_[this.bass]);
                map[alias + '/' + this.sharps_[this.bass]] = [this];
            }
            map[alias + '/' + this.bass] = [this];
        } else {
            map[alias] = [this];
        }

    }, this);
    return this;
};

/**
 * @param {string} value
 * @returns {Array.<number> | null}
 */
FrettedBuildModel.prototype.fretParser = function(value) {
    if (!value) {
        return null;
    }
    return _.map(value.split(' '), function(value) {
        var val = parseInt(value, 10);
        return isNaN(val) ? -1 : val;
    });
};

/**
 * @param {string} value
 * @returns {Array.<string> | null}
 */
FrettedBuildModel.prototype.stringListParser = function(value) {
    if (!value) {
        return null;
    }
    return value.split(' ');
};


module.exports = exports = FrettedBuildModel;



