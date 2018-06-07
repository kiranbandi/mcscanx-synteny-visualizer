import * as d3 from 'd3';
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import processQueryParams from './processQueryParams';
import genomeView from './genomeView/genomeView';
import dotView from './dotView/dotView';
import displayInformation from './displayInformation';
import filterPanel from './filterPanel';
import processAlignment from './filterAlignments';
import setupRoot from './setupRoot';
import { sampleSourceMapper } from './sampleSourceMapper';

/* BASIC FUNCTIONALITY RULES written by  "He who must not be named" - do not alter ¯\_(ツ)_/¯  */
// Load the Data gff file and syteny collinearity file 
// Parse the Data and store it in appropriate data structures 
// Filter it for useful information and mine it to decide on what to represent 
// Create the plots 
// Refine the plots 
// Add interactivity to the plots 

//initialise root and navbar
setupRoot();

// get the source name based on window query params or set to default 'bn'(brassica napus - canola)
let sourceName = processQueryParams().source || 'bn';

// Loading the gff file  - Will Eventually be moved into the file loader container
axios.get('assets/files/' + sourceName + '_coordinate.gff').then(function(coordinateFile) {
    let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);
    // Loading the collinearity file 
    axios.get('assets/files/' + sourceName + '_collinear.collinearity').then(function(collinearFile) {
        let { information, alignmentList } = processCollinear(collinearFile.data);
        //hide loader one file loading and processing is complete
        d3.select('#loader-container').classed('hide', true);
        console.log('Data loading and processing complete...');
        start(information, alignmentList, genomeLibrary, chromosomeMap);
    });
});

function start(syntenyInformation, alignmentList, genomeLibrary, chromosomeMap) {

    let rootContainer = d3.select("#tool-root")
        .append('div')
        .attr('class', 'rootContainer'),
        headContainer = rootContainer.append('div')
        .attr('class', 'headContainer row'),
        genomeViewContainer = rootContainer.append('div')
        .attr('class', 'genomeViewContainer'),
        dotViewContainer = rootContainer.append('div')
        .attr('class', 'dotViewContainer hide');

    // markerPositions and links are populated  
    // need to reconfigure seperately for each plot indivually at some point in the not so far future
    let configuration = {
        'isDarkTheme': false, // default theme is light 
        'markers': sampleSourceMapper[sourceName], // default preset markers are loaded from the sampleSourceMapper
        'dotView': {
            'width': rootContainer.node().clientWidth
        },
        'genomeView': {
            'verticalPositions': {
                'source': 50,
                'target': 375
            },
            'height': 425,
            'width': rootContainer.node().clientWidth,
        },
        'chromosomeView': {
            'verticalPositions': {
                'source': 50,
                'target': 375
            },
            'markers': {},
            'height': 425,
            'width': rootContainer.node().clientWidth,
        },
        'blockView': {
            'verticalPositions': {
                'source': 50,
                'target': 275
            },
            'height': 325,
            'width': rootContainer.node().clientWidth
        }
    };

    // Display basic information regarding the synteny present in the output file of McScanX
    displayInformation(headContainer, syntenyInformation);

    // Initialise Filter Panel
    filterPanel(headContainer, configuration, chromosomeMap, function(selectedMarkers, isDarkTheme, isDotPlot) {
        // show hide plots based on options
        genomeViewContainer.classed('hide', isDotPlot);
        dotViewContainer.classed('hide', !isDotPlot);
        // filter markers
        configuration.markers = selectedMarkers;
        configuration.isDarkTheme = isDarkTheme;
        // process alignments for given markers
        let updatedAlignmentList = processAlignment(configuration.markers, alignmentList);
        // call the respective plot generating functions
        if (isDotPlot) {
            dotView(dotViewContainer, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        } else {
            genomeView(genomeViewContainer, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        }
    });
}