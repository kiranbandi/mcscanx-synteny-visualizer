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
        .attr('class', 'linearViewVis')
        // temporarily hardcoded to 500 pixels
        .attr('height', 500)
        .attr('width', width)

    displayInformation(headContainer, syntenyInformation);
    linearView(linearViewVis, alignmentList, genomeLibrary, chromosomeMap);

}