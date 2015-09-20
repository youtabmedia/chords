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

function distanceInSemitones(from, to, base) {
    var offset = base ? indexOfNote(base) : 0;
    var start = getIndexOfAny(from);
    if (start == -1) {
        throw new Error('invalid from value: ' + from);
    }
    var end = getIndexOfAny(to);
    if (end === -1) {
        throw new Error('invalid to value: ' + to);
    }
    return (end - start + offset) % 12;
}

function getIndexOfAny(value) {
    var normalized = extractRoot(value);
    normalized = flatToSharp(normalized) || normalized;
    return sharps.indexOf(normalized);
}

function positiveDistanceInSemitones(from, to, base) {
    return (12 + distanceInSemitones(from, to, base)) % 12;
}

function extractRoot(chord) {
    if (chord.charAt(1) === 'b' || chord.charAt(1) === '#') {
        return chord.substr(0, 2);
    }
    return chord.charAt(0);
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

function transposeNote(note, offset) {
    var index = indexOfNote(note) + offset;
    if (isSharp(note)) {
        return getNote(index, sharps);
    } else {
        return getNote(index, flats);
    }
}

exports.reverseAccidental = reverseAccidental;
exports.isAccidental = isAccidental;
exports.transformChord = transformChord;
exports.distanceInSemitones = distanceInSemitones;
exports.positiveDistanceInSemitones = positiveDistanceInSemitones;
exports.extractRoot = extractRoot;
exports.transposeNote = transposeNote;

