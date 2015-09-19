var _ = require('underscore');
var str = require('underscore.string');
var teoria = require('teoria');
var music = require('../knowledge/music');
var utils = require('../utils');

/**
 * @constructor
 */
function FrettedBuildModel(tuning) {
    this.tuning = _.map(this.stringListParser(tuning, '-'), music.extractRoot);
}

/**
 * @param {Array.<string>} row
 * @param {FrettedBuildModel} prev
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.deserialize = function(row, prev) {

    this.name = '';
    this.displayName = row[0] || prev.displayName;

    this.priority_ = 0;

    this.aliases_ = this.stringListParser(row[1], ',') || prev.aliases_;
    this.bass_ = row[2] || prev.bass_;
    this.chord_ = row[3] || prev.chord_;

    this.own_ = {
        frets: this.fretListParser(row[4]),
        fingering: this.fretListParser(row[5])
    };

    this.alternateSources_ = this.stringListParser(row[6], ' ');

    this.alternateDefinitions_ = {
        priority_: row[8] ? parseInt(row[8], 10) : 0,
        frets: this.fretListParser(row[9]) || this.own_.frets,
        fingering: this.fretListParser(row[10]) || this.own_.fingering
    };

    // validation
    try {
        teoria.note(this.bass_);
    } catch(error) {
        console.warn('invalid chord', chord);
    }

    var invalidAliases = [];
    this.verifiedAliases_ = _.filter(this.aliases_, function(alias) {
        try {
            return !!teoria.chord(alias);
        } catch(error) {
            invalidAliases.push({
                alias: alias,
                error:  error.message
            });
        }
        return false;
    }, this);

    if (_.isEmpty(this.verifiedAliases_)) {
        console.log('invalid aliases', invalidAliases);
        console.log('----');
    }
    return this;
};

/**
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.clone = function() {
    return _.extend(new FrettedBuildModel(), utils.clone(this));
};

/**
 * @param {string} value
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.setBass = function(value) {
    this.bass_ = value;
    return this;
};

/**
 * @param {string} value
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.setName = function(value) {
    this.name = value;
    return this;
};

/**
 * @param {Object.<string, FrettedBuildModel>} map
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.alternates = function(map) {
    var alts = _.sortBy(this.alternateDefinitions_, 'priority_');
    console.log(alts);
    return this;
};

FrettedBuildModel.prototype.buildUsingDefinition = function(map, ownerList) {
    if (!_.isEmpty(this.alternateSources_)) {
        // console.log(this.name, 'has', this.alternateSources_.length, 'alternate sources');
        // var distance = notes.distanceInSemitones()
    }

    _.forEach(this.alternateSources_, function(sourceBassNote) {
        // TODO: offset distance according to bass of first string
        var sourceName = music.transformChord(this.name, sourceBassNote);
        var sourceList = map[sourceName];
        if (_.isEmpty(sourceList)) {
            console.log('failed finding source', this.name, sourceName);
            return;
        }

        var alternates = _.map(sourceList, function(chord) {
            console.log(chord.getFirstNote());
        });

    }, this);
    return this;
};

FrettedBuildModel.prototype.getFirstNote = function() {
    var note = null;
    _.find(this.own_.frets, function(fret, index) {
        if (fret > -1) {
            note = this.tuning[index];
            return true;
        }
        return false;
    }, this);
    return note;
};

/**
 * @param {number} offset
 * @return {Array.<number>}
 */
FrettedBuildModel.prototype.getFretWhenUsedAsDerivate = function(offset) {
    return _.map(this.alternateDefinitions_.frets || this.own_.frets, function(fret) {
        if (fret === -1) {
            return fret;
        }
        return fret + offset;
    });
};

/**
 * @return {Array.<number>}
 */
FrettedBuildModel.prototype.getFingeringWhenUsedAsDerivate = function() {
    return this.alternateDefinitions_.fingering || this.own_.fingering;
};

/**
 * @param {Object.<string, Array.<FrettedBuildModel>>} map
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.register = function(map) {
    _.forEach(this.verifiedAliases_, function(alias) {
        if (music.extractRoot(alias) === this.bass_) {
            // not a slash chord
            this.registerAlias_(alias, null, map);
        } else {
            // slash chord
            this.registerAlias_(alias, this.bass_, map);
            // if slash chord is an accidental register the respective opposite
            if (music.isAccidental(this.bass_)) {
                this.registerAlias_(alias, music.reverseAccidental(this.bass_), map);
            }
        }
    }, this);
    return this;
};

FrettedBuildModel.prototype.registerAlias_ = function(alias, bass, map) {
    var name = alias + (bass ? ('/' + bass) : '');
    var list = map[name] || [];
    list.push(this.clone()
        .setBass(bass)
        .setName(name)
    );
    map[name] = list;
};

/**
 * @param {string} value
 * @param {string=} delimiter
 * @returns {Array.<number> | null}
 */
FrettedBuildModel.prototype.fretListParser = function(value, delimiter) {
    if (!value) {
        return null;
    }
    delimiter = delimiter || ' ';
    var ret = _.chain(value.split(delimiter))
      .map(function(string) {
          var num = parseInt(utils.removeAllWhiteSpace(string), 10);
          return isNaN(num) ? -1 : num;
      })
      .value();
    return _.isEmpty(ret) ? null : ret;
};

/**
 * @param {string} value
 * @param {string} delimiter
 * @returns {Array.<string> | null}
 */
FrettedBuildModel.prototype.stringListParser = function(value, delimiter) {
    if (!value) {
        return null;
    }

    var ret = _.chain(value.split(delimiter))
      .map(utils.removeAllWhiteSpace)
      .compact()
      .value();

    return _.isEmpty(ret) ? null : ret;
};


module.exports = exports = FrettedBuildModel;



