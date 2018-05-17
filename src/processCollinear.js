export default function(collinearityData) {

    // The first 11 lines contain information regarding the MCSCANX Parameters
    // and can be processed seperately 

    var FileLines = collinearityData.split('\n'),
        information = parseInformation(FileLines.slice(0, 11)),
        alignmentList = [],
        alignmentBuffer = {};

    // remove the first 11 lines and then process the file line by line
    FileLines.slice(11).forEach(function(line, index) {
            if (line.indexOf('Alignment') > -1) {
                // store the previous alignment in list , 
                // and skip for the first iteration since buffer is empty
                if (alignmentBuffer.links) {
                    alignmentList.push(alignmentBuffer);
                }
                alignmentBuffer = parseAlignmentDetails(line);
                alignmentBuffer.links = [];
            } else {
                alignmentBuffer.links.push(parseLink(line));
            }
        })
        // push the last alignment still in the buffer
    alignmentList.push(alignmentBuffer);

    return { information, alignmentList };
};


function parseInformation(informationLines) {
    return {
        'PARAMS': {
            'MATCH_SCORE': informationLines[1].split(':')[1].trim(),
            'MATCH_SIZE': informationLines[2].split(':')[1].trim(),
            'GAP_PENALTY': informationLines[3].split(':')[1].trim(),
            'OVERLAP_WINDOW': informationLines[4].split(':')[1].trim(),
            'E_VALUE': informationLines[5].split(':')[1].trim(),
            'MAX_GAPS': informationLines[6].split(':')[1].trim()
        },
        'STATS': {
            'NO_OF_COLLINEAR_GENES': informationLines[8].split(',')[0].split(":")[1].trim(),
            'PERCENTAGE': informationLines[8].split(',')[1].split(":")[1].trim(),
            'NO_OF_ALL_GENES': informationLines[8].split(',')[1].split(":")[1].trim()
        }
    };
}


function parseAlignmentDetails(alignmentDetails) {
    let alignmentDetailsList = alignmentDetails.split(' ');
    return {
        'score': alignmentDetailsList[3].split('=')[1].trim(),
        'e_value': alignmentDetailsList[4].split('=')[1].trim(),
        'count': alignmentDetailsList[5].split('=')[1].trim(),
        'type': alignmentDetailsList[7].trim(),
        'source': alignmentDetailsList[6].split('&')[0].trim(),
        'target': alignmentDetailsList[6].split('&')[1].trim()
    };
}

function parseLink(link) {
    let linkInfo = link.split('\t');
    return {
        'score': linkInfo[1].trim(),
        'target': linkInfo[2].trim(),
        'e_value': linkInfo[3].trim()
    };
}