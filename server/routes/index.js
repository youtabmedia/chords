var express = require('express');
var router = express.Router();

var _ = require('underscore');

var chords = require('../../dist/chords.json');

console.log(chords);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Chords',
        chords: chords,
        jtab: jtab
    });
});

function jtab(chord) {
    // %7/2.X/X.7/3.7/4.6/1.X/X[Bm7b5]
    try {
        var arr = [];
        _.forEach(chord.frets, function(fret, index) {
            var fretNum = fret >= 0 ? fret : 'X';
            var fingNum = chord.fingering[index] >= 0 ? chord.fingering[index] : 'X';
            arr.push(fretNum + '/' + fingNum);
        });
        if (!arr.length) {
            return null;
        }
        return '%' + arr.join('.') + '[' + chord.name + ']';
    } catch (err) {
        return null
    }
}

module.exports = router;
