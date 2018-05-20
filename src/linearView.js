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
        .attr('width', width)

    infoVisualization(headContainer, information);

    let sourceKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        targetKeys = [11, 12, 13, 14, 15, 16, 17, 18, 19];

    let topPosition = 100,
        bottomPosition = 350;

    let sourceMarkers = markers(linearViewVis, sourceKeys, chromosomeMap, topPosition);
    let targetMarkers = markers(linearViewVis, targetKeys, chromosomeMap, bottomPosition);

    let filteredAlignmentCollection = filterAlignmentList(sourceKeys, targetKeys, alignmentList);

    let linksUpdated = _.map(filteredAlignmentCollection, (alignment) => {

        let firstLink = alignment.links[0];
        let lastLink = alignment.links[alignment.links.length - 1];

        let sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source];
        let targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target];

        _.each([0, 1], (value) => {
            sourceGenes[value] = genomeLibrary.get(sourceGenes[value]).start;
            targetGenes[value] = genomeLibrary.get(targetGenes[value]).start;
        })

        let sourceChromosome = chromosomeMap.get(alignment.sourceKey);
        let targetChromosome = chromosomeMap.get(alignment.targetKey);

        let sourceMarker = _.find(sourceMarkers, (o) => o.key == alignment.sourceKey);
        let targetMarker = _.find(targetMarkers, (o) => o.key == alignment.targetKey);

        let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx / 2);
        let sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx);
        let targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx);

        sourceGeneWidth = Math.max(sourceGeneWidth, 2);

        return {

            source: {
                'x': sourceMarker.x + sourceX + sourceGeneWidth,
                'y': topPosition
            },
            target: {
                'x': targetMarker.x + targetX + sourceGeneWidth,
                'y': bottomPosition
            },
            key: alignment.sourceKey,
            width: sourceGeneWidth
        }


    })

    function link(d) {

        // big changes here obviously, more comments to follow
        var x0 = d.source.x,
            x1 = d.target.x,
            y0 = d.source.y,
            y1 = d.target.y,
            yi = d3.interpolateNumber(y0, y1),
            y2 = yi(0.65),
            y3 = yi(1 - 0.65);

        // ToDo - nice to have - allow flow up or down! Plenty of use cases for starting at the bottom,
        // but main one is trickle down (economics, budgets etc), not up

        return "M" + x0 + "," + y0 // start (of SVG path)
            +
            "C" + x0 + "," + y2 // CP1 (curve control point)
            +
            " " + x1 + "," + y3 // CP2
            +
            " " + x1 + "," + y1; // end
    }

    // stroke width takes half the width so we draw a line and depending on the width needed offset the x position 
    // so that x is reduced by half of the intended width :-)

    linearViewVis.append("g")
        .selectAll('.link')
        .data(linksUpdated)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            return link(d);
        })
        .style("stroke-width", function(d) {
            return d.width;
        })
        .style('stroke', (d, i) => {
            return d3.schemeCategory10[d.key - 1];
        });
}


function filterAlignmentList(sourceKeys, targetKeys, alignmentList) {
    return _.filter(alignmentList, (alignment) => {
        let sourceAndTarget = alignment.sourceKey && alignment.targetKey && (sourceKeys.indexOf(alignment.sourceKey) > -1) && (targetKeys.indexOf(alignment.targetKey) > -1);
        return (sourceAndTarget);
    });
}


function markers(svgContainer, keys, chromosomeCollection, positionFromTop) {

    let width = svgContainer.node().clientWidth;
    // 90% of the total width is used for markers and the rest is used 
    // for creating gap between the markers except for the first marker
    let scaleFactor = (width * 0.90) / _.sumBy(keys, (key) => chromosomeCollection.get(key).width),
        markerPaddingToLeft = (width * 0.10) / (keys.length - 1);

    // keep track of width that has been consumed to the left of the current element
    let previousWidthStore = 0;

    let markers = _.map(keys, (key, index) => {
        let marker = {
            'key': key,
            // marker start point = used space + padding of element (no padding for first element)
            'x': previousWidthStore + (index == 0 ? 0 : markerPaddingToLeft),
            // width of the marker
            'dx': (scaleFactor * chromosomeCollection.get(key).width)
        }
        previousWidthStore = marker.x + marker.dx;
        return marker;
    })

    let markerContainer = svgContainer
        .append('g')
        .attr('class', 'markerContainer-new')

    let chromosomeMarkers = markerContainer
        .selectAll('.marker')
        .data(markers)
        .enter()
        .append('line')
        .attr('class', 'marker')
        .style('stroke', (d, i) => {
            return d3.schemeCategory10[i];
        })
        .style('stroke-width', '7.5px')
        .style('stroke-linecap', 'round')
        .attr('x1', (d) => d.x)
        .attr('y1', positionFromTop)
        .attr('x2', (d) => {
            return (d.x + d.dx);
        })
        .attr('y2', positionFromTop);

    return markers;

}