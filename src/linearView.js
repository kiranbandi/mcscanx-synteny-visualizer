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
        targetKeys = [11, 12, 13, 14, 15, 16, 17, 18, 19];


    let sourceMarkerInfo = drawmarkers(linearViewVis, sourceKeys, chromosomeMap, 100, 'source', 'red'),
        targetMarkerInfo = drawmarkers(linearViewVis, targetKeys, chromosomeMap, 350, 'target', 'black');

    let filteredAlignmentList = filterAlignmentList(sourceKeys, targetKeys, alignmentList);


    //     _.each(_.sortBy(filteredAlignmentList, (o) => o.count), (alignment) => {

    //         let firstLink = alignment.links.slice(0, 1)[0],
    //             lastLink = alignment.links.slice(-1)[0];

    //         let sourceMarkerStartForChromosome = sourceMarkerInfo.markerCoordinatesMap[alignment.sourceKey];
    //         let targetMarkerStartForChromosome = targetMarkerInfo.markerCoordinatesMap[alignment.targetKey];

    //         let sourceChromosome = chromosomeMap.get(alignment.sourceKey);
    //         let targetChromosome = chromosomeMap.get(alignment.targetKey);

    //         // polygon coordinates numbering start in a circular fashion from top left to bottom left
    //         let polygonCoordinates_1 = genomeLibrary.get(firstLink.source).start;
    //         let polygonCoordinates_2 = genomeLibrary.get(lastLink.source).start;
    //         let polygonCoordinates_3 = genomeLibrary.get(firstLink.target).start;
    //         let polygonCoordinates_4 = genomeLibrary.get(lastLink.target).start;

    //         polygonCoordinates_1 = ((polygonCoordinates_1 - sourceChromosome.start) / (sourceChromosome.end - sourceChromosome.start))
    //         polygonCoordinates_2 = ((polygonCoordinates_2 - sourceChromosome.start) / (sourceChromosome.end - sourceChromosome.start))

    //         polygonCoordinates_3 = ((polygonCoordinates_3 - targetChromosome.start) / (targetChromosome.end - targetChromosome.start))
    //         polygonCoordinates_4 = ((polygonCoordinates_4 - targetChromosome.start) / (targetChromosome.end - targetChromosome.start))

    //         console.log(alignment.type, polygonCoordinates_2 - polygonCoordinates_1, polygonCoordinates_4 - polygonCoordinates_3);
    //     })
    // }


    _.each(filteredAlignmentList, (alignment) => {

        let firstLink = alignment.links.slice(0, 1)[0];

        let sourceMarkerStartForChromosome = sourceMarkerInfo.markerCoordinatesMap[alignment.sourceKey];
        let targetMarkerStartForChromosome = targetMarkerInfo.markerCoordinatesMap[alignment.targetKey];

        let sourceChromosome = chromosomeMap.get(alignment.sourceKey);
        let targetChromosome = chromosomeMap.get(alignment.targetKey);

        // polygon coordinates numbering start in a circular fashion from top left to bottom left
        let polygonCoordinates_1 = genomeLibrary.get(firstLink.source).start;
        let polygonCoordinates_2 = genomeLibrary.get(lastLink.source).start;
        let polygonCoordinates_3 = genomeLibrary.get(firstLink.target).start;
        let polygonCoordinates_4 = genomeLibrary.get(lastLink.target).start;

        polygonCoordinates_1 = ((polygonCoordinates_1 - sourceChromosome.start) / (sourceChromosome.end - sourceChromosome.start))
        polygonCoordinates_2 = ((polygonCoordinates_2 - sourceChromosome.start) / (sourceChromosome.end - sourceChromosome.start))

        polygonCoordinates_3 = ((polygonCoordinates_3 - targetChromosome.start) / (targetChromosome.end - targetChromosome.start))
        polygonCoordinates_4 = ((polygonCoordinates_4 - targetChromosome.start) / (targetChromosome.end - targetChromosome.start))

        console.log(alignment.type, polygonCoordinates_2 - polygonCoordinates_1, polygonCoordinates_4 - polygonCoordinates_3);
    })
}


function filterAlignmentList(sourceKeys, targetKeys, alignmentList) {
    return _.filter(alignmentList, (alignment) => {
        let sourceAndTarget = alignment.sourceKey && alignment.targetKey && (sourceKeys.indexOf(alignment.sourceKey) > -1) && (targetKeys.indexOf(alignment.targetKey) > -1),
            targetAndSrouce = alignment.sourceKey && alignment.targetKey && (sourceKeys.indexOf(alignment.targetKey) > -1) && (targetKeys.indexOf(alignment.sourceKey) > -1);
        return sourceAndTarget;
    });
}

function drawmarkers(svgContainer, keys, chromosomeCollection, positionFromTop, markerIndex, markerColor = 'green') {

    let chromosomeWidthList = [],
        sumStore = 0,
        width = svgContainer.node().clientWidth;

    _.each(keys, (chromosomeKey) => {
        let chromosomeWidth = chromosomeCollection.get(chromosomeKey).end - chromosomeCollection.get(chromosomeKey).start
        chromosomeWidthList.push([sumStore, chromosomeWidth]);
        sumStore += chromosomeWidth;
    })

    // gap of 0.1% to account for rounded corners around the chromosome markers which extend beyond the width
    // so complete width is not used and a small area is left free
    let scaleFactor = (width * 0.89) / _.sumBy(chromosomeWidthList, (o) => o[1]),
        markerPadding = (width * 0.10) / keys.length;

    // calculate x positions of markers and return them so that they can be used for placing connector lines
    let markerCoordinates = _.map(chromosomeWidthList, (chromosomeWidth, index) => {
        return [(chromosomeWidth[0] * scaleFactor) + ((index + 1) * markerPadding), ((chromosomeWidth[0] + chromosomeWidth[1]) * scaleFactor) + ((index + 1) * markerPadding)];
    })

    let chromosomeMarkers = svgContainer
        .append('g')
        .attr('class', 'markerContainer' + '-' + markerIndex)
        .selectAll('.marker')
        .data(markerCoordinates)
        .enter()
        .append('line')
        .attr('class', 'marker')
        .style('stroke', markerColor)
        .style('stroke-width', '0.75em')
        .style('stroke-linecap', 'round')
        .attr('x1', (d) => d[0])
        .attr('y1', positionFromTop)
        .attr('x2', (d) => d[1])
        .attr('y2', positionFromTop);

    let markerCoordinatesMap = {};

    // create an object map with chromosomeMapKeys and their coordinates
    _.each(keys, (key, index) => {
        markerCoordinatesMap[key] = markerCoordinates[index];
    })

    return { scaleFactor, markerCoordinatesMap };
}