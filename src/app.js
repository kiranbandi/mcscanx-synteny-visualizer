import d3 from 'd3';
import axios from 'axios';

// Load the Data gff file and syteny collinearity file 
// Parse the Data and store it in appropriate data structures 
// Filter it for useful information and mine it to decide on what to represent 
// Create the plots 
// Refine the plots 
// Add interactivity to the plots 

var genomeLibrary = new Map();
var chromosomeMap = new Map();

// Loading the gff file 
axios.get('assets/files/coordinate.gff').then(function (response) {

    var genomeEntry;


    response.data.split('\n').forEach(function (line, index) {

        genomeEntry = line.split("\t");
        // 4 tab seperated entries , 1st in chromosome index , 2nd is unique gene id ,3rd and 4th are the start and end positions

        var chromosomeId = parseInt(genomeEntry[0].slice(2));
        var geneStart = parseInt(genomeEntry[2]);
        var geneEnd = parseInt(genomeEntry[3]);
        var geneId = genomeEntry[1];

        // Taking in only non scafflod entries - unwanted entries end up being parsed as NaN and this filters them
        if (chromosomeId) {
            genomeLibrary.set(geneId, {
                'start': geneStart,
                'end': geneEnd,
                // the first 2 characters are the genome name and can be removed
                'chromosomeId': chromosomeId
            })
            // To create a list of the start and end of all chromosomes
            if (!chromosomeMap.has(chromosomeId)) {
                chromosomeMap.set(chromosomeId, {
                    start: geneStart,
                    end: geneEnd
                });
            } else {
                var entry = chromosomeMap.get(chromosomeId);
                if (geneStart < entry.start) {
                    entry.start = geneStart;
                }
                if (geneEnd > entry.end) {
                    entry.end = geneEnd;
                }
                chromosomeMap.set(chromosomeId, entry);
            }
        }
    })

    debugger;

}).catch(function () {
    console.log("There was an error in loading the GFF file");
})