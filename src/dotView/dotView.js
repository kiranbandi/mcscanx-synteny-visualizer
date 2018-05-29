import * as d3 from 'd3';
import _ from 'lodash';
import axisLines from './axisLines';
import linkPoints from './linkPoints';

export default function(container, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    let side_margin = 75,
        dotViewSVG = container.select('.dotViewSVG'),
        dotInnerContainer = d3.select('.dotInnerContainer');

    configuration.dotView.width = Math.min(configuration.dotView.width, 750);

    // if svg doesnt exist create it 
    if (!dotViewSVG.node()) {

        dotViewSVG = container
            .append('svg')
            .attr('class', 'dotViewSVG')
            .attr('height', configuration.dotView.width)
            .attr('width', configuration.dotView.width);

        dotInnerContainer = dotViewSVG
            .append('g')
            .attr('class', 'dotInnerContainer')
            .attr('width', configuration.dotView.width)
            .attr('height', configuration.dotView.width);

        configuration.dotView.innerWidth = configuration.dotView.width - (2 * side_margin);
        configuration.dotView.offset = side_margin;

    }
    //set theming based on configuration params
    dotViewSVG.classed('darkPlot', configuration.isDarkTheme);

    let linePositions = axisLines(dotInnerContainer, configuration, chromosomeMap);
    linkPoints(dotInnerContainer, configuration, chromosomeMap, alignmentList, genomeLibrary, linePositions);
}