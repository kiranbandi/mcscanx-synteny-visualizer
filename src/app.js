import d3 from 'd3';
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import linearView from './linearView';
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

function start(information, alignmentList, genomeLibrary, chromosomeMap) {
    linearView(information, alignmentList, genomeLibrary, chromosomeMap);
}