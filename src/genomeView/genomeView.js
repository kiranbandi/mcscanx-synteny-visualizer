import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';
import processAlignment from '../filterAlignments';
import chromosomeView from '../chromosomeView/chromosomeView';

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
            .attr('height', configuration.genomeView.height)
            .attr('width', configuration.genomeView.width);
    }

    //set theming based on configuration params
    genomeViewSVG.classed('darkPlot', configuration.isDarkTheme);

    // clear existing chromosomeView or BlockView assets if any
    container.select('.chromosomeViewContainer').remove();
    container.select('.blockViewContainer').remove();

    if (configuration.markers.source.length == 0 || configuration.markers.target.length == 0) {
        genomeViewSVG.classed('hide', true);
        container.select('.chromosomeViewSVG').classed('hide', true);
        genomeViewHeader.text("Source or Target Empty");
    } else if (configuration.markers.source.length == 1 && configuration.markers.target.length == 1) {
        configuration.chromosomeView.markers = configuration.markers;
        chromosomeView(container, configuration, alignmentList, genomeLibrary, chromosomeMap);
    } else {

        genomeViewSVG.classed('hide', false);
        genomeViewHeader.text("Genome View");

        configuration = markerSetup(genomeViewSVG, configuration, chromosomeMap, function(sourceMarkerID, targetMarkerID) {
            configuration.chromosomeView.markers = { 'source': [sourceMarkerID], 'target': [targetMarkerID] };
            // process alignments for selected markers
            let updatedAlignmentList = processAlignment(configuration.chromosomeView.markers, alignmentList);
            chromosomeView(container, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        });
        linkSetup(genomeViewSVG, configuration, alignmentList, chromosomeMap, genomeLibrary);
    }
}