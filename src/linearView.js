import * as d3 from 'd3';
import _ from 'lodash';
import infoVisualization from './infoVisualization'

export default function(information, alignmentList, genomeLibrary, chromosomeMap) {

    let linearViewMainContainer = d3.select("#root")
        .append('div')
        .attr('class', 'linearViewMainContainer'),

        headContainer = linearViewMainContainer.append('div')
        .attr('class', 'headContainer row'),

        filterConainter = headContainer.append('div')
        .attr('class', 'subContainer filterConainter col s12'),

        width = linearViewMainContainer.node().clientWidth,

        linearViewVis = linearViewMainContainer.append('svg')
        .attr('class', 'linearViewVis')
        .attr('height', width)
        .attr('width', width);

    infoVisualization(headContainer, information);

    let sourceKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        targetKeys = [11, 12, 13, 14, 15, 16, 17, 18, 19],
        sourceWidth = [],
        sumStore = 0,
        targetStore = 0,
        targetWidth = [];
    //  reduce throwing an error in prod build so using each instead
    _.each(sourceKeys, (chromosomeKey) => {
        let chromosomeWidth = chromosomeMap.get(chromosomeKey).end - chromosomeMap.get(chromosomeKey).start
        sourceWidth.push([sumStore, chromosomeWidth]);
        sumStore += chromosomeWidth;
    })
    _.each(targetKeys, (chromosomeKey) => {
            let chromosomeWidth = chromosomeMap.get(chromosomeKey).end - chromosomeMap.get(chromosomeKey).start
            targetWidth.push([targetStore, chromosomeWidth]);
            targetStore += chromosomeWidth;
        })
        // gap of 0.1% to account for rounded corners around the chromosome markers which extend beyond the width
        // so complete width is not used and a small area is left free
    let sourceScaleFactor = (width * 0.89) / _.sumBy(sourceWidth, (o) => o[1]),
        targetScaleFactor = (width * 0.89) / _.sumBy(targetWidth, (o) => o[1]),
        sourcePaddingTop = width * 0.1;

    let linePaddingSource = (width * 0.10) / sourceKeys.length,
        linePaddingTarget = (width * 0.10) / targetKeys.length;

    let distanceBetweenTracks = 0.1 * width;

    let sourceChromosomeMarkers = linearViewVis
        .append('g')
        .attr('class', 'sourceMarkerContainer')
        .selectAll('.sourceMarker')
        .data(sourceWidth)
        .enter()
        .append('line')
        .attr('class', 'sourceMaker')
        .style('stroke', 'green')
        .style('stroke-width', '0.75em')
        .style('stroke-linecap', 'round')
        .attr('x1', (d, i) => {
            return (d[0] * sourceScaleFactor) + ((i + 1) * linePaddingSource);
        })
        .attr('y1', sourcePaddingTop)
        .attr('x2', (d, i) => {
            return ((d[0] + d[1]) * sourceScaleFactor) + ((i + 1) * linePaddingSource);
        })
        .attr('y2', sourcePaddingTop);

    let targetChromosomeMarkers = linearViewVis
        .append('g')
        .attr('class', 'targetMarkerContainer')
        .selectAll('.targetMarker')
        .data(targetWidth)
        .enter()
        .append('line')
        .style('stroke', 'black')
        .style('stroke-width', '0.75em')
        .style('stroke-linecap', 'round')
        .attr('x1', (d, i) => {
            return (d[0] * targetScaleFactor) + ((i + 1) * linePaddingTarget);
        })
        .attr('y1', sourcePaddingTop + distanceBetweenTracks)
        .attr('x2', (d, i) => {
            return ((d[0] + d[1]) * targetScaleFactor) + ((i + 1) * linePaddingTarget);
        })
        .attr('y2', sourcePaddingTop + distanceBetweenTracks);

}

function parseAlignmentDetails(alignmentDetails) {
    let alignmentDetailsList = alignmentDetails.split(' ');
    return {
        'score': alignmentDetailsList[3].split('=')[1].trim(),
        'e_value': alignmentDetailsList[4].split('=')[1].trim(),
        'count': alignmentDetailsList[5].split('=')[1].trim(),
        'type': alignmentDetailsList[7].trim(),
        'source': alignmentDetailsList[6].split('&')[0].trim(),
        'target': alignmentDetailsList[6].split('&')[1].trim()
    };
}