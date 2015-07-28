var _ = require('underscore');
var string = require('underscore.string');
var csv = require('csv');
/**
 * @constructor
 */
CSVParser = function () {
    /**
     * @type {Array.<{key: string, parser:Function}>}
     * @private
     */
    this.columns_ = [];

    /**
     * @type {number}
     * @private
     */
    this.startRow_ = 0;
};

/**
 * @return {null}
 */
CSVParser.prototype.destroy = function() {
    this.callback_ = null;
    this.columns_ = null;
    return null;
};

/**
 * @param {number} value
 * @return {CSVParser}
 */
CSVParser.prototype.setStartLine = function(value) {
    this.startRow_ = value;
    return this;
};

/**
 * @param {string} key
 * @param {function(string):*} parser
 * @return {CSVParser}
 */
CSVParser.prototype.addColumnParser = function(key, parser) {
    this.columns_.push({
        key: key,
        parser: parser
    });
    return this;
};

/**
 * @param {string} source
 * @param {Function} callback
 * @return {CSVParser}
 */
CSVParser.prototype.parse = function(source, callback) {
    this.callback_ = callback;
    csv.parse(source, _.bind(this.done_, this));
    return this;
};

/**
 * @param {Error} error
 * @param {Array.<Array.<string>>} rows
 * @private
 */
CSVParser.prototype.done_ = function(error, rows) {
    if (error) {
        this.callback_(error);
    } else {
        var items = null;
        try {
            items = _.map(_.rest(rows, this.startRow_), this.parseRow_, this);
        } catch (error) {
        }
        this.callback_(error, items);
    }
};

CSVParser.prototype.parseRow_ = function(row) {
    var o = {};
    _.forEach(this.columns_, function(column, index) {
        o[column.key] = column.parser(row[index]);
    }, this);
    return o;
};


module.exports = exports = CSVParser;



