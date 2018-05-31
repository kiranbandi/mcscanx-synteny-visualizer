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
import navbar from './navbar';
import { sampleSourceMapper } from './sampleSourceMapper';

/* GOLDEN RULES written by  "He who must not be named" - do not alter ¯\_(ツ)_/¯  */
// Load the Data gff file and syteny collinearity file 
// Parse the Data and store it in appropriate data structures 
// Filter it for useful information and mine it to decide on what to represent 
// Create the plots 
// Refine the plots 
// Add interactivity to the plots 

// get the source name based on window query params or set to default 'bn'(brassica napus - canola)
let sourceName = processQueryParams().source || 'bn';

//initialise navbar functionality
navbar();

// Loading the gff file 
axios.get('assets/files/' + sourceName + '_coordinate.gff').then(function(coordinateFile) {
    let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);

    // Loading the collinearity file 
    axios.get('assets/files/' + sourceName + '_collinear.collinearity').then(function(collinearFile) {

        d3.select('#loader-container').classed('hide', true);

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

        genomeViewContainer = rootContainer.append('div')
        .attr('class', 'genomeViewContainer'),

        dotViewContainer = rootContainer.append('div')
        .attr('class', 'dotViewContainer hide');


    // markerPositions and links are populated  
    // need to reconfigure seperately for each plot indivually at some point in the not so far future
    let configuration = {
        'width': width,
        'isDarkTheme': false, // default theme is light 
        'verticalPositions': {
            'source': 50,
            'target': 375
        },
        'markers': sampleSourceMapper[sourceName], // default preset markers are loaded from the sampleSourceMapper
        'markerPositions': {},
        'links': [],
        'dotView': {
            'width': width
        }
    };

    displayInformation(headContainer, syntenyInformation);

    let filterContainer = headContainer.append('div')
        .attr('class', 'subContainer filterContainer col s12 center-align');

    filterPanel(filterContainer, configuration, chromosomeMap, function(selectedMarkers, isDarkTheme, isDotPlot) {
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

    let processedAlignmentList = processAlignment(configuration.markers, alignmentList);
    genomeView(genomeViewContainer, configuration, processedAlignmentList, genomeLibrary, chromosomeMap);
}