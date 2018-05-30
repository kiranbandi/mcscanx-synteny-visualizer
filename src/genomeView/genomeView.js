import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';
import processAlignment from '../filterAlignments';

export default function(container, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    let genomeViewSVG = container.select('.genomeViewSVG'),
        genomeViewHeader = container.select('.genomeViewHeader');

    // if svg doesnt exist create it 
    if (!genomeViewSVG.node()) {

        genomeViewHeader = container.append('h4')
            .attr('class', 'genomeViewHeader red-text text-lighten-2 center-align');

        genomeViewSVG = container
            .append('svg')
            .attr('class', 'genomeViewSVG')
            // temporarily hardcoded to 400 pixels
            .attr('height', 400)
            .attr('width', configuration.width);

    }

    //set theming based on configuration params
    genomeViewSVG.classed('darkPlot', configuration.isDarkTheme);

    if (configuration.markers.source.length == 0 || configuration.markers.target.length == 0) {
        genomeViewSVG.classed('hide', true);
        genomeViewHeader.text("Source or Target Empty");
    } else if (configuration.markers.source.length == 1 && configuration.markers.target.length == 1) {
        genomeViewSVG.classed('hide', false);
        genomeViewHeader.text("Chromosome View");
        let markerConfiguration = markerSetup(genomeViewSVG, configuration, chromosomeMap, false);
        linkSetup(genomeViewSVG, markerConfiguration, alignmentList, chromosomeMap, genomeLibrary);

    } else {
        genomeViewSVG.classed('hide', false);
        genomeViewHeader.text("Genome View");
        configuration = markerSetup(genomeViewSVG, configuration, chromosomeMap, true, function(sourceMarkerID, targetMarkerID) {

            genomeViewHeader.text("Chromosome View");
            configuration.markers = { 'source': [sourceMarkerID], 'target': [targetMarkerID] };
            // process alignments for selected markers
            let updatedAlignmentList = processAlignment(configuration.markers, alignmentList);
            let markerConfig = markerSetup(genomeViewSVG, configuration, chromosomeMap, false);
            linkSetup(genomeViewSVG, markerConfig, updatedAlignmentList, chromosomeMap, genomeLibrary);

        });
        linkSetup(genomeViewSVG, configuration, alignmentList, chromosomeMap, genomeLibrary);
    }

}