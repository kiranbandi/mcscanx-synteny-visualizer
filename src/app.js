import * as d3 from 'd3';
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import linearView from './linearView/linearView';
import displayInformation from './displayInformation';

// Load the Data gff file and syteny collinearity file 
// Parse the Data and store it in appropriate data structures 
// Filter it for useful information and mine it to decide on what to represent 
// Create the plots 
// Refine the plots 
// Add interactivity to the plots 

// Loading the gff file 
axios.get('assets/files/coordinate.gff').then(function(coordinateFile) {
    let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);
    // Loading the collinearity file 
    axios.get('assets/files/collinear_max_5_hits.collinearity').then(function(collinearFile) {
        let { information, alignmentList } = processCollinear(collinearFile.data);
        console.log('Data loading and processing complete...');
        start(information, alignmentList, genomeLibrary, chromosomeMap);
    });
});

function start(syntenyInformation, alignmentList, genomeLibrary, chromosomeMap) {


    let plotContainer = d3.select("#root")
        .append('div')
        .attr('class', 'plotContainer'),

        headContainer = plotContainer.append('div')
        .attr('class', 'headContainer row'),

        filterContainer = headContainer.append('div')
        .attr('class', 'subContainer filterContainer col s12'),

        width = plotContainer.node().clientWidth,

        linearViewVis = plotContainer.append('svg')
        .attr('class', 'darkPlot svgPLot linearViewVis')
        // temporarily hardcoded to 500 pixels
        .attr('height', 375)
        .attr('width', width);

    // markerPositions and links are populated 
    let linearViewConfig = {
        'width': width,
        'verticalPositions': {
            'source': 50,
            'target': 325
        },
        'markers': {
            'source': [1, 2, 3, 4],
            'target': [11, 12, 13, 14, 15]
        },
        'markerPositions': {},
        'links': []
    };

    displayInformation(headContainer, syntenyInformation);


    let processedAlignmentList = filterAndFlipAlignmentList(linearViewConfig.markers, alignmentList);

    linearView(linearViewVis, linearViewConfig, processedAlignmentList, genomeLibrary, chromosomeMap);
}

function filterAndFlipAlignmentList(markers, alignmentList) {

    let sourceKeyList = markers.source,
        targetKeyList = markers.target,
        filteredList = [];

    _.each(alignmentList, (alignment) => {

        let { sourceKey, targetKey } = alignment;

        if (sourceKey && targetKey) {
            // if the alignment is from source to target we return the alignment directly 
            if ((sourceKeyList.indexOf(sourceKey) > -1) && (targetKeyList.indexOf(targetKey) > -1)) {
                filteredList.push(alignment);
            }
            // if the alignment is from target to source we flip the alignment  
            else if ((sourceKeyList.indexOf(targetKey) > -1) && (targetKeyList.indexOf(sourceKey) > -1)) {

                let flippedAlignment = _.clone(alignment);

                flippedAlignment.source = alignment.target;
                flippedAlignment.target = alignment.source;
                flippedAlignment.sourceKey = alignment.targetKey;
                flippedAlignment.targetKey = alignment.sourceKey;
                flippedAlignment.links = _.map(alignment.links, (link) => {
                    return {
                        'source': link.target,
                        'target': link.source,
                        'e_value': link.e_value
                    };
                });
                filteredList.push(flippedAlignment);
            }
        }
    });
    return filteredList;
}