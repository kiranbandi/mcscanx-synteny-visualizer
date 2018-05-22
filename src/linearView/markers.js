import _ from 'lodash';
import * as d3 from 'd3';

function initialiseMarkers(configuration, chromosomeCollection) {

    let maxWidthAvailable = configuration.width;
    // To arrange the markers in a proper way we find the marker List that has the maximum genome width
    //  We need this to fit in the maximum available width so we use this and find the scale factor 
    // we then fit all the other markers using the same scale factors
    // this way the chromosome width ratio is maintainer across all the marker list while at the same time they are
    //  fit relative to the webpage width

    // find the widths for each marker list 
    let widthCollection = _.map(configuration.markers, (chromosomeList, markerId) => {
        // for each list we calculate the sum of all the widths of chromosomes in it 
        return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeCollection.get(key).width) };
    })

    // find the marker list that has the maximum width
    let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);
    //  we use 90% of the available width for the actual markers and the remaining 10% is used as padding between the markers 
    let scaleFactor = (configuration.width * 0.80) / maxGeneticWidthMarkerList.width,
        markerPadding = (configuration.width * 0.20) / (configuration.markers[maxGeneticWidthMarkerList.markerId].length);

    // no we initialise the markers and set the width directly on the markers lists directly 
    let markers = {};
    _.each(configuration.markers, (chromosomeList, markerId) => {
        let widthUsedSoFar = 0,
            markerList = _.map(chromosomeList, (key, index) => {
                let marker = {
                        'data': chromosomeCollection.get(key),
                        'key': key,
                        // marker start point = used space + half marker padding 
                        'x': widthUsedSoFar + (markerPadding / 2),
                        // width of the marker
                        'dx': (scaleFactor * chromosomeCollection.get(key).width)
                    }
                    // total width used = previous used space + half marker padding + width + end marker padding
                widthUsedSoFar = marker.x + marker.dx + (markerPadding / 2);
                return marker;
            })

        // for marker lists that dont use the full width which is basically every marker list other than the one with the maximum genetic width we 
        //  align them to the center of the screen to make things look more presentable - faaaaancy but meh !
        // we do this by finding the remaining width and then dividing that by half and adding this to the x for each the marker in the lists we want center aligned
        if (maxGeneticWidthMarkerList.markerId != markerId) {
            let paddingToleft = (configuration.width - widthUsedSoFar) / 2;
            markerList = _.map(markerList, (marker) => {
                marker.x = marker.x + paddingToleft;
                return marker;
            })
        }
        markers[markerId] = markerList;
    })
    return markers;
}

function drawMarkers(svg, configuration) {

    let markerContainer = d3.select('.markerContainer');

    // if container doesnt exist create it 
    if (!markerContainer.node()) {
        markerContainer = svg
            .append('g')
            .attr('class', 'markerContainer');
    }

    _.map(configuration.markerPositions, (markerList, markerListId) => {

        let markerLines = markerContainer
            .selectAll('.marker-' + markerListId)
            .data(markerList);

        markerLines.exit().remove();

        markerLines = markerLines
            .enter()
            .append('line')
            .merge(markerLines)
            .transition()
            .duration(500)
            .attr('class', (d, i) => {
                return 'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key;
            })
            .style('stroke', (d, i) => {
                if (markerListId == 'source') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    return ((sourceIndex == -1) || sourceIndex > 9) ? 'black' : d3.schemeCategory10[sourceIndex];

                    return d3.schemeCategory10[i];
                } else {
                    return (i % 2 == 0) ? '#3a3a3a' : 'grey';
                }
            })
            .style('stroke-width', '20px')
            .style('stroke-linecap', 'round')
            .attr('x1', (d) => d.x)
            .attr('y1', configuration.verticalPositions[markerListId])
            .attr('x2', (d) => {
                return (d.x + d.dx);
            })
            .attr('y2', configuration.verticalPositions[markerListId]);


        let markerTextUnits = markerContainer
            .selectAll('.marker-text-' + markerListId)
            .data(markerList);

        markerTextUnits.exit().remove();

        markerTextUnits = markerTextUnits.enter()
            .append('text')
            .merge(markerTextUnits)
            .text((d) => d.data.chromosomeName)
            .attr('class', ' markersText marker-text-' + markerListId)
            .transition()
            .duration(500)
            .attr('x', function(d) {
                return d.x + (d.dx / 2) - (this.getBoundingClientRect().width / 2);
            })
            .attr('y', configuration.verticalPositions[markerListId] + 5)
    })

}

export default function(svg, configuration, chromosomeCollection) {
    configuration.markerPositions = initialiseMarkers(configuration, chromosomeCollection);
    drawMarkers(svg, configuration);
    return configuration;
}