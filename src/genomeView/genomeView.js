import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';

export default function(container, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    let genomeViewSVG = container.select('.genomeViewSVG');
    // if svg doesnt exist create it 
    if (!genomeViewSVG.node()) {
        genomeViewSVG = container
            .append('svg')
            .attr('class', 'genomeViewSVG')
            // temporarily hardcoded to 400 pixels
            .attr('height', 400)
            .attr('width', configuration.width);

    }
    //set theming based on configuration params
    genomeViewSVG.classed('darkPlot', configuration.isDarkTheme);

    configuration = markerSetup(genomeViewSVG, configuration, chromosomeMap, invokeChromosomeView);
    linkSetup(genomeViewSVG, configuration, alignmentList, chromosomeMap, genomeLibrary);
}

function invokeChromosomeView(sourceMarkerId, targetMarkerId) {

}