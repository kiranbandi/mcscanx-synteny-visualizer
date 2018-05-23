import * as d3 from 'd3';
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import linearView from './linearView/linearView';
import displayInformation from './displayInformation';
import filterPanel from './filterPanel';
import processAlignment from './filterAlignments';

/* GOLDEN RULES written by ancient druid - do not alter ¯\_(ツ)_/¯  */
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

    let rootContainer = d3.select("#root")
        .append('div')
        .attr('class', 'rootContainer'),

        headContainer = rootContainer.append('div')
        .attr('class', 'headContainer row'),

        width = rootContainer.node().clientWidth,

        linearViewVis = rootContainer.append('svg')
        .attr('class', 'svgPLot linearViewVis')
        // temporarily hardcoded to 500 pixels
        .attr('height', 375)
        .attr('width', width);

    // markerPositions and links are populated  
    // need to reconfigure seperately for each plot indivually at some point in the not so far future
    let configuration = {
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

    let filterContainer = headContainer.append('div')
        .attr('class', 'subContainer filterContainer col s12 center-align');

    filterPanel(filterContainer, configuration, chromosomeMap, function(selectedMarkers, isDarkTheme, isDotPlot) {
        configuration.markers = selectedMarkers;
        let updatedAlignmentList = processAlignment(configuration.markers, alignmentList);
        linearView(linearViewVis, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        linearViewVis.classed('darkPlot', isDarkTheme);
    });

    let processedAlignmentList = processAlignment(configuration.markers, alignmentList);
    linearView(linearViewVis, configuration, processedAlignmentList, genomeLibrary, chromosomeMap);
}