export default function(gffData) {

    var genomeEntry,
        genomeLibrary = new Map(),
        chromosomeMap = new Map();

    gffData.split('\n').forEach(function(line, index) {

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

    // once all parsing is done set width of each chromosome
    chromosomeMap.forEach((chromosome) => {
        chromosome.width = chromosome.end - chromosome.start;
    })

    return { genomeLibrary, chromosomeMap };
};