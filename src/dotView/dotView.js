import * as d3 from 'd3';
import _ from 'lodash';
import axisLines from './axisLines';
import linkPoints from './linkPoints';

export default function(svg, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    let side_margin = 75,
        dotInnerContainer = d3.select('.dotInnerContainer');

    configuration.dotView.innerWidth = configuration.dotView.width - (2 * side_margin);
    configuration.dotView.offset = side_margin;

    // if container doesnt exist create it 
    if (!dotInnerContainer.node()) {
        dotInnerContainer = svg
            .append('g')
            .attr('class', 'dotInnerContainer');
    }

    dotInnerContainer
        .attr('width', configuration.dotView.width)
        .attr('height', configuration.dotView.width)

    let linePositions = axisLines(dotInnerContainer, configuration, chromosomeMap);
    linkPoints(dotInnerContainer, configuration, chromosomeMap, alignmentList, genomeLibrary, linePositions);
}