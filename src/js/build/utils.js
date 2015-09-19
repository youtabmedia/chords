var _ = require('underscore');

function clone(object) {
    if (_.isArray(object)) {
        return _.map(object, clone);
    }
    if (_.isObject(object)) {
        return _.mapObject(object, clone);
    }
    return object;
}

function removeAllWhiteSpace(string) {
    if (!string) {
        return '';
    }
    return string.replace(/\s/gim, '');
}

exports.clone = clone;
exports.removeAllWhiteSpace = removeAllWhiteSpace;