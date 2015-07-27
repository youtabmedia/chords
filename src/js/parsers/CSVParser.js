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
     * @type {Array}
     * @private
     */
    this.result_ = [];

    /**
     * @type {string}
     * @private
     */
    this.delimiter_ = ',';

    /**
     * @type {number}
     * @private
     */
    this.startRow_ = 0;
};

/**
 * @return {CSVParser}
 */
CSVParser.prototype.reset = function() {
    this.startRow_ = 0;
    this.columns_ = [];
    this.result_ = [];
    return this;
};

/**
 * @param {number} value
 * @return {CSVParser}
 */
CSVParser.prototype.setStartLine = function(value) {
    this.startRow_ = value;
    return this;
};

CSVParser.prototype.addColumnParser = function(key, parser) {
    this.columns_.push({
        key: key,
        parser: parser
    });
    return this;
};

CSVParser.prototype.parse = function(source, callback) {
    csv.parse(source, _.bind(this.onParsed_, this, callback));
    return this;
};

CSVParser.prototype.onParsed_ = function(callback, error, result) {
    if (error) {
        callback(error);
        return;
    }
    this.result_ = _.map(_.rest(result, this.startRow_), this.parseRow_, this);
    callback(null, this.result_);
};

CSVParser.prototype.parseRow_ = function(row) {
    var o = {};
    _.forEach(this.columns_, function(column, index) {
        o[column.key] = column.parser(row[index]);
    }, this);
    return o;
};


module.exports = exports = CSVParser;



