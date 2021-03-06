var _ = require('underscore');
var string = require('underscore.string');

module.exports = exports = {
    /**
     * @param {string} source
     * @return {string | null}
     */
    basic: function(source) {
        return string.trim(source || '') || null;
    },
    baseOrder: function(source) {
        if (!source) {
            source = '1';
        }
        return parseInt(source) - 1;
    },
    /**
     * @param {string} source
     * @return {Array.<string> | null}
     */
    aliasList: function(source) {
        if (!source) {
            return ['M']
        }
        return _.map(source.split(','), function(value) {
            return string.trim(value);
        });
    },
    /**
     * @param {string} source
     * @return {Array.<string> | null}
     */
    stringList: function(source) {
        if (!source) {
            return null;
        }
        return _.map(source.split(' '), function(value) {
            return string.trim(value);
        });
    },
    /**
     * @param {string} source
     * @return {Array.<number> | null}
     */
    positionList: function(source) {
        if (!source) {
            return null;
        }
        return _.map(source.split(' '), function(value) {
            var num = parseInt(value);
            if (isNaN(num)) {
                return -1;
            }
            return num;
        });
    }
};
