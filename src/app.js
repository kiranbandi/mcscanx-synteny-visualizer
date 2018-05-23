import * as d3 from 'd3';
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import linearView from './linearView/linearView';
import dotView from './dotView/dotView';
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

const getParams = query => {
    if (!query) {
        return {};
    }
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [key, value] = param.split('=');
            params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
        }, {});
};

let sourceName = getParams(window.location.search).source || 'bn';

// Loading the gff file 
axios.get('assets/files/' + sourceName + '_coordinate.gff').then(function(coordinateFile) {
    let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);
    // Loading the collinearity file 
    axios.get('assets/files/' + sourceName + '_collinear.collinearity').then(function(collinearFile) {
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
        dotViewWidth = Math.min(width, 750),

        linearViewVis = rootContainer.append('svg')
        .attr('class', 'linearViewVis')
        // temporarily hardcoded to 500 pixels
        .attr('height', 400)
        .attr('width', width);

    let dotViewVis = rootContainer.append('svg')
        .attr('class', 'dotViewVis hide')
        // temporarily hardcoded to 500 pixels
        .attr('height', dotViewWidth)
        .attr('width', dotViewWidth);

    // markerPositions and links are populated  
    // need to reconfigure seperately for each plot indivually at some point in the not so far future
    let configuration = {
        'width': width,
        'verticalPositions': {
            'source': 50,
            'target': 375
        },
        'markers': {
            'source': [1, 2, 3],
            'target': [4, 5]
        },
        'markerPositions': {},
        'links': [],
        'dotView': {
            'width': dotViewWidth
        }
    };

    displayInformation(headContainer, syntenyInformation);

    let filterContainer = headContainer.append('div')
        .attr('class', 'subContainer filterContainer col s12 center-align');

    filterPanel(filterContainer, configuration, chromosomeMap, function(selectedMarkers, isDarkTheme, isDotPlot) {
        //  hadle theming 
        linearViewVis.classed('darkPlot', isDarkTheme);
        dotViewVis.classed('darkPlot', isDarkTheme);
        // show hide plots based on options
        linearViewVis.classed('hide', isDotPlot);
        dotViewVis.classed('hide', !isDotPlot);
        // filter markers
        configuration.markers = selectedMarkers;
        let updatedAlignmentList = processAlignment(configuration.markers, alignmentList);
        // call plot functions depending on the options
        if (isDotPlot) {
            dotView(dotViewVis, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        } else {
            linearView(linearViewVis, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        }
    });

    let processedAlignmentList = processAlignment(configuration.markers, alignmentList);
    linearView(linearViewVis, configuration, processedAlignmentList, genomeLibrary, chromosomeMap);
}