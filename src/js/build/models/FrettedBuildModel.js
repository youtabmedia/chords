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

    this.derivatePointerNotes_ = this.stringListParser(row[6], ' ');

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

FrettedBuildModel.prototype.serialize = function() {
    return {
        displayName: this.displayName,
        name: this.name,
        frets: this.own_.frets,
        fingering: this.own_.fingering// ,
        // fretsFingering: _.zip(this.own_.frets, this.own_.fingering)
    }
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
 * @param {string} value
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.setDisplayName = function(value) {
    this.displayName = value;
    return this;
};

/**
 * @param {Object.<string, FrettedBuildModel>} map
 * @returns {FrettedBuildModel}
 */
FrettedBuildModel.prototype.alternates = function(map) {
    var alts = _.sortBy(this.alternateDefinitions_, 'priority_');
    // console.log(alts);
    return this;
};

FrettedBuildModel.prototype.buildUsingPointers = function(map, results, listItem) {
    if (!_.isEmpty(this.derivatePointerNotes_)) {
        // console.log(this.name, 'has', this.derivatePointerNotes_.length, 'alternate sources');
        // var distance = notes.distanceInSemitones()
    }

    _.forEach(this.derivatePointerNotes_, function(pointerBassNote) {
        // TODO: offset distance according to bass of first string
        var sourceName = music.transformChord(this.name, pointerBassNote);
        var sourceList = map[sourceName];
        if (_.isEmpty(sourceList)) {
            console.log('failed finding source', this.name, sourceName);
            return;
        }

        var created = _.chain(sourceList)
          .map(function(chord) {
              var firstStringNote = chord.getFirstNote();
              // console.log(this.name, sourceName, firstStringNote);
              if (_.isNull(firstStringNote)) {
                  console.log('mapped to chord with no frets', this.name, sourceName);
                  return null;
              }
              var distance = music.positiveDistanceInSemitones(firstStringNote, this.name);
              return chord.clone()
                .setName(this.name)
                .setDisplayName(this.displayName)
                .deriveFrets(distance)
                .deriveFingering();
          }, this)
          .compact()
          .value();

        if (!_.isEmpty(created)) {
            results.splice(results.indexOf(listItem) + 1, 0, created);
        }

        //if (music.extractRoot(this.name) === 'C') {
        //    _.forEach(created, function(c) {
        //        console.log(c.serialize());
        //    });
        //    // console.log(JSON.stringify(created, null, 2));
        //}


    }, this);
    return this;
};

FrettedBuildModel.prototype.getFirstNote = function() {
    var note = null;
    _.find(this.own_.frets, function(fret, index) {
        if (fret > -1) {
            note = music.transposeNote(this.tuning[index], fret);
            return true;
        }
        return false;
    }, this);
    return note;
};

/**
 * @param {number} offset
 * @return {FrettedBuildModel}
 */
FrettedBuildModel.prototype.deriveFrets = function(offset) {
    this.own_.frets = _.map(this.alternateDefinitions_.frets || this.own_.frets, function(fret) {
        if (fret === -1) {
            return fret;
        }
        return fret + offset;
    });
    return this;
};

/**
 * @return {FrettedBuildModel}
 */
FrettedBuildModel.prototype.deriveFingering = function() {
    var offset = 0;
    if (_.isEqual(this.alternateDefinitions_.fingering, this.own_.fingering)) {
        offset = 1;
    }
    this.own_.fingering = _.map(this.alternateDefinitions_.fingering, function(finger) {
        if (finger === -1) {
            return finger;
        }
        return finger + offset;
    });
    return this;
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



