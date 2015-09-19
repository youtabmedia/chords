var _ = require('underscore');

var sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var flats  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

var twoOctaveSharps = sharps.concat(sharps);
var twoOctaveFlats = flats.concat(flats);

var sharpToFlatMap = _.object(sharps, flats);
var flatToSharpMap = _.object(flats, sharps);

function reverseAccidental(value) {
    var ret = sharpToFlat(value) || flatToSharp(value);
    if (!ret) {
        throw new Error('invalid note: ' + value);
    }
    return ret;
}

function isAccidental(value) {
    return reverseAccidental(value) !== value;
}

function sharpToFlat(value) {
    return sharpToFlatMap[value];
}

function flatToSharp(value) {
    return flatToSharpMap[value];
}

function isSharp(value) {
    return value.charAt(1) === '#';
}

function isNote(value) {
    return !!sharpToFlatMap[value] || !!flatToSharpMap[value];
}

function distanceInSemitones(from, to, offset) {
    offset = offset || 0;
    var normalizedFrom = extractRoot(flatToSharp(from) || from);
    var start = sharps.indexOf(normalizedFrom);
    if (start == -1) {
        throw new Error('invalid from value: ' + from);
    }
    var normalizedTo = extractRoot(flatToSharp(to) || to);
    var end = sharps.indexOf(normalizedTo);
    if (end === -1) {
        throw new Error('invalid to value: ' + to);
    }
    return (end - start + offset) % 12;
}

function positiveDistanceInSemitones(from, to, offset) {
    return (12 + distanceInSemitones(from, to, offset)) % 12;
}

function extractRoot(chord) {
    if (chord.charAt(1) === 'b' || chord.charAt(1) === '#') {
        return chord.substr(0, 2);
    }
    return chord.charAt(0);
}

function extractBass(chord) {
    return chord.split('/')[1] || null;
}

function transformChord(chord, newRoot) {
    if (!chord) {
        throw new Error('invalid chord name:' + chord)
    }

    var root = extractRoot(chord);

    var parts = chord.split('/');
    var bass = parts.pop();

    var ret;
    if (parts.length > 0 && isNote(bass)) {
        var index = (indexOfNote(newRoot) + distanceInSemitones(root, bass)) ;
        ret = newRoot + parts.join('/').substring(root.length) + '/' + (isSharp(bass) ? getNote(index, sharps) : getNote(index, flats));
    } else {
        ret = newRoot + chord.substring(root.length);
    }

    return ret;
}

function getNote(index, list) {
    if (index < 0) {
        index = 12 + index;
    }
    return list[index % 12];
}

function indexOfNote(value) {
    if (isSharp(value)) {
        return sharps.indexOf(value);
    } else {
        return flats.indexOf(value);
    }
}

exports.reverseAccidental = reverseAccidental;
exports.isAccidental = isAccidental;
exports.transformChord = transformChord;
exports.distanceInSemitones = distanceInSemitones;
exports.positiveDistanceInSemitones = positiveDistanceInSemitones;
exports.extractRoot = extractRoot;

