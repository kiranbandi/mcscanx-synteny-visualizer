import _ from 'lodash';
import * as d3 from 'd3';

// variable scope blocked locally
let currentClickState;

export default function(svg, configuration, chromosomeCollection, isGenomeView, chromosomeViewCallback) {
    currentClickState = {
        'clicked': false,
        'sourceMarkerId': -1,
        'targetMarkerId': -1
    }
    configuration.markerPositions = initialiseMarkers(configuration, chromosomeCollection);
    drawMarkers(svg, configuration, isGenomeView, chromosomeViewCallback);
    return configuration;
}

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
    let scaleFactor = (configuration.width * 0.80) / maxGeneticWidthMarkerList.width;

    // no we initialise the markers and set the width directly on the markers lists directly 
    let markers = {};
    _.each(configuration.markers, (chromosomeList, markerId) => {
        // the remaining width is 20% for the maximum width marker list but will change for others
        let remainingWidth = (configuration.width - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
            markerPadding = remainingWidth / (chromosomeList.length),
            widthUsedSoFar = 0,
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
        markers[markerId] = markerList;
    })
    return markers;
}

function drawMarkers(svg, configuration, isGenomeView, chromosomeViewCallback) {

    let markerContainer = svg.select('.markerContainer');

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

        if (isGenomeView) {
            markerLines
                .on('mouseover', markerHover.bind({ markerListId }))
                .on('mouseout', markerOut.bind({ markerListId }))
                .on('click', markerClick.bind({ markerListId, chromosomeViewCallback }))
                .on('dblclick', resetClick);
        } else {
            // switch of events
            markerLines
                .on('mouseover', null)
                .on('mouseout', null)
                .on('click', null)
                .on('dblclick', null);
        }

        markerLines.transition()
            .duration(500)
            .attr('class', (d, i) => {
                return 'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key;
            })
            .style('stroke', (d, i) => {
                if (markerListId == 'source') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    return ((sourceIndex == -1) || sourceIndex > 9) ? '#808080' : d3.schemeCategory10[sourceIndex];

                    return d3.schemeCategory10[i];
                } else {
                    return (i % 2 == 0) ? '#3a3a3a' : 'grey';
                }
            })
            .style('stroke-width', '20px')
            .style('stroke-linecap', 'round')
            .attr('x1', (d) => {
                return d.x;
            })
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
            .text((d) => d.key)
            .attr('class', ' markersText marker-text-' + markerListId)
            .attr('x', function(d) {
                return d.x + (d.dx / 2) - (this.getBoundingClientRect().width / 2);
            })
            .attr('y', configuration.verticalPositions[markerListId] + 5);

        if (isGenomeView) {
            markerTextUnits
                .on('mouseover', markerHover.bind({ markerListId }))
                .on('mouseout', markerOut.bind({ markerListId }))
                .on('click', markerClick.bind({ markerListId, chromosomeViewCallback }))
                .on('dblclick', resetClick);
        } else {
            // switch of events
            markerTextUnits
                .on('mouseover', null)
                .on('mouseout', null)
                .on('click', null)
                .on('dblclick', null);
        }
    })

}

function markerHover(d) {
    if (this.markerListId == 'source' && !currentClickState.clicked) {
        d3.selectAll(".link").classed('hiddenLink', true);
        d3.selectAll('.link-source-' + d.key).classed('activeLink', true);
    }
}

function markerOut(d) {
    if (this.markerListId == 'source' && !currentClickState.clicked) {
        d3.selectAll('.hiddenLink').classed('hiddenLink', false);
        d3.selectAll('.activeLink').classed('activeLink', false);
    }
}

function markerClick(d) {
    if (this.markerListId == 'source') {
        // reset other active links if any 
        d3.selectAll('.hiddenLink').classed('hiddenLink', false);
        d3.selectAll('.activeLink').classed('activeLink', false);
        // set current source links to active
        d3.selectAll(".link").classed('hiddenLink', true);
        d3.selectAll('.link-source-' + d.key).classed('activeLink', true);
        currentClickState.clicked = true;
        currentClickState.sourceMarkerId = d.key;
    } else if (this.markerListId == 'target' && currentClickState.sourceMarkerId != -1) {
        currentClickState.targetMarkerId = d.key;
        this.chromosomeViewCallback(currentClickState.sourceMarkerId, currentClickState.targetMarkerId);
    }
}

function resetClick() {
    currentClickState = {
        'clicked': false,
        'sourceMarkerId': -1,
        'targetMarkerId': -1
    };
    d3.selectAll('.hiddenLink').classed('hiddenLink', false);
    d3.selectAll('.activeLink').classed('activeLink', false);
}