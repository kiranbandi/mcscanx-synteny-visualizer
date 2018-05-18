import * as d3 from 'd3';
import _ from 'lodash';
import infoVisualization from './infoVisualization';

export default function(information, alignmentList, genomeLibrary, chromosomeMap) {

    let colorScale = d3.schemeCategory10;

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


    let sourceMarkerInfo = drawmarkers(linearViewVis, sourceKeys, chromosomeMap, 100, 'source', true, colorScale),
        targetMarkerInfo = drawmarkers(linearViewVis, targetKeys, chromosomeMap, 350, 'target', false, colorScale);

    let filteredAlignmentList = filterAlignmentList(sourceKeys, targetKeys, alignmentList);

    let linksVis = _.map(filteredAlignmentList, (alignment) => {

        let firstLink = alignment.links[0];

        if (alignment.isFlipped) {

            let sourceMarkerStartForChromosome = sourceMarkerInfo.markerCoordinatesMap[alignment.targetKey];
            let targetMarkerStartForChromosome = targetMarkerInfo.markerCoordinatesMap[alignment.sourceKey];

            let sourceChromosome = chromosomeMap.get(alignment.targetKey);
            let targetChromosome = chromosomeMap.get(alignment.sourceKey);

            // polygon coordinates numbering start in a circular fashion from top left to bottom left
            let polygonCoordinates_1 = genomeLibrary.get(firstLink.target).start;
            let polygonCoordinates_4 = genomeLibrary.get(firstLink.source).start;

            polygonCoordinates_1 = sourceMarkerStartForChromosome[0] + ((polygonCoordinates_1 - sourceChromosome.start) * sourceMarkerInfo.scaleFactor)
            polygonCoordinates_4 = targetMarkerStartForChromosome[0] + ((polygonCoordinates_4 - targetChromosome.start) * targetMarkerInfo.scaleFactor)

            return [alignment.targetKey, polygonCoordinates_1, polygonCoordinates_4];

        }


        let sourceMarkerStartForChromosome = sourceMarkerInfo.markerCoordinatesMap[alignment.sourceKey];
        let targetMarkerStartForChromosome = targetMarkerInfo.markerCoordinatesMap[alignment.targetKey];

        let sourceChromosome = chromosomeMap.get(alignment.sourceKey);
        let targetChromosome = chromosomeMap.get(alignment.targetKey);

        // polygon coordinates numbering start in a circular fashion from top left to bottom left
        let polygonCoordinates_1 = genomeLibrary.get(firstLink.source).start;
        let polygonCoordinates_4 = genomeLibrary.get(firstLink.target).start;

        polygonCoordinates_1 = sourceMarkerStartForChromosome[0] + ((polygonCoordinates_1 - sourceChromosome.start) * sourceMarkerInfo.scaleFactor)
        polygonCoordinates_4 = targetMarkerStartForChromosome[0] + ((polygonCoordinates_4 - targetChromosome.start) * targetMarkerInfo.scaleFactor)

        return [alignment.sourceKey, polygonCoordinates_1, polygonCoordinates_4];
    })

    linearViewVis.selectAll('alignmentLink')
        .data(linksVis)
        .enter()
        .append('line')
        .style('stroke', (d) => {
            return colorScale[d[0] - 1];
        })
        .style('opacity', 0.50)
        .attr('class', 'alignmentLink')
        .attr('x1', (d) => d[1])
        .attr('y1', 100)
        .attr('x2', (d) => d[2])
        .attr('y2', 350)
}


function filterAlignmentList(sourceKeys, targetKeys, alignmentList) {
    let sourceKeysCopy = [1, 3, 9];
    return _.filter(alignmentList, (alignment) => {
        let sourceAndTarget = alignment.sourceKey && alignment.targetKey && (sourceKeysCopy.indexOf(alignment.sourceKey) > -1) && (targetKeys.indexOf(alignment.targetKey) > -1),
            targetAndSrouce = alignment.sourceKey && alignment.targetKey && (sourceKeysCopy.indexOf(alignment.targetKey) > -1) && (targetKeys.indexOf(alignment.sourceKey) > -1);

        if (targetAndSrouce) {
            alignment.isFlipped = true;
        }

        return (sourceAndTarget || targetAndSrouce);
    });
}

function drawmarkers(svgContainer, keys, chromosomeCollection, positionFromTop, markerIndex, isSource = false, colorScale) {

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

    let markerContainer = svgContainer
        .append('g')
        .attr('class', 'markerContainer' + '-' + markerIndex);

    let chromosomeMarkers = markerContainer
        .selectAll('.marker')
        .data(markerCoordinates)
        .enter()
        .append('line')
        .attr('class', 'marker')
        .style('stroke', (d, i) => {
            if (isSource) {
                return colorScale[i];
            } else {
                return (i % 2) == 0 ? 'black' : 'grey';
            }
        })
        .style('stroke-width', '0.75em')
        .style('stroke-linecap', 'round')
        .attr('x1', (d) => d[0])
        .attr('y1', positionFromTop)
        .attr('x2', (d) => d[1])
        .attr('y2', positionFromTop);


    let chromosomeMarkerTexts = markerContainer
        .selectAll('.markerText')
        .data(keys)
        .enter()
        .append('text')
        .attr('class', 'markerText')
        .style('color', (d, i) => {
            return 'black';
        })
        .attr('y', (d) => {
            return (positionFromTop + ((isSource ? -1 : 1) * 25))
        })
        .text((d) => {
            return "Chr " + d;
        })
        .attr('x', function(d, i) {
            let position = ((markerCoordinates[i][0] + markerCoordinates[i][1]) / 2);
            // subtracting the elements own width ensure its centered above the chromosome
            return position - (this.clientWidth / 2);
        })

    let markerCoordinatesMap = {};

    // create an object map with chromosomeMapKeys and their coordinates
    _.each(keys, (key, index) => {
        markerCoordinatesMap[key] = markerCoordinates[index];
    })

    return { scaleFactor, markerCoordinatesMap };
}