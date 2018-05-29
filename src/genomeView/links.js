import _ from 'lodash';
import * as d3 from 'd3';

export default function(svg, configuration, alignmentList, chromosomeMap, genomeLibrary) {

    let links = initialiseLinks(configuration, alignmentList, genomeLibrary, chromosomeMap);
    drawLinks(svg, links, configuration);

}

function initialiseLinks(configuration, alignmentList, genomeLibrary, chromosomeMap) {
    return _.map(alignmentList, (alignment) => {

        let firstLink = alignment.links[0],
            lastLink = alignment.links[alignment.links.length - 1];

        let sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source];
        let targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target];

        _.each([0, 1], (value) => {
            sourceGenes[value] = genomeLibrary.get(sourceGenes[value]).start;
            targetGenes[value] = genomeLibrary.get(targetGenes[value]).start;
        })

        let sourceChromosome = chromosomeMap.get(alignment.source),
            targetChromosome = chromosomeMap.get(alignment.target);

        let sourceMarker = _.find(configuration.markerPositions.source, (o) => o.key == alignment.source),
            targetMarker = _.find(configuration.markerPositions.target, (o) => o.key == alignment.target);

        let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx / 2),
            targetGeneWidth = ((targetGenes[1] - targetGenes[0]) / (targetChromosome.width)) * (targetMarker.dx / 2),
            sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
            targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
            // pick the one with the smaller width and ensure the minimum is 2px
            linkWidth = Math.max(Math.min(sourceGeneWidth, targetGeneWidth), 2);

        // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
        return {
            source: {
                'x': sourceMarker.x + sourceX + linkWidth,
                'y': configuration.verticalPositions.source + 10
            },
            target: {
                'x': targetMarker.x + targetX + linkWidth,
                'y': configuration.verticalPositions.target - 10
            },
            alignment,
            width: linkWidth
        };
    })
}


function drawLinks(svg, links, configuration) {

    let linkContainer = d3.select('.linkContainer');

    // intialise container if the markers are being drawn for the first time
    if (!linkContainer.node()) {
        linkContainer = svg
            .append('g')
            .attr('class', 'linkContainer');
    }

    // stroke width takes half the width so we draw a line and depending on the width needed offset the x position 
    // so that x is reduced by half of the intended width :-)
    let genomicLinks = linkContainer
        .selectAll('.link')
        .data(links);

    genomicLinks.exit().remove();

    genomicLinks = genomicLinks
        .enter()
        .append("path")
        .merge(genomicLinks)
        .attr("class", (d) => {
            return 'link hover-link' + " link-source-" + d.alignment.source;
        })
        .attr("d", function(d) {
            return createLinkPath(d);
        })
        .style("stroke-width", function(d) {
            return d.width;
        })
        .style('stroke', (d, i) => {
            let sourceIndex = configuration.markers.source.indexOf(d.alignment.source);
            return ((sourceIndex == -1) || sourceIndex > 9) ? '#808080' : d3.schemeCategory10[sourceIndex];
        })
        // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
        .append('title')
        .text((d) => {
            return d.alignment.source + " => " + d.alignment.target +
                "\n type : " + d.alignment.type +
                "\n E value : " + d.alignment.e_value +
                "\n score : " + d.alignment.score +
                "\n count : " + d.alignment.count
        });
}

function createLinkPath(d) {

    let curvature = 0.65;
    // code block sourced from d3-sankey https://github.com/d3/d3-sankey for drawing curved blocks
    var x0 = d.source.x,
        x1 = d.target.x,
        y0 = d.source.y,
        y1 = d.target.y,
        yi = d3.interpolateNumber(y0, y1),
        y2 = yi(curvature),
        y3 = yi(1 - curvature);

    return "M" + x0 + "," + y0 + // svg start point
        "C" + x0 + "," + y2 + // curve point 1
        " " + x1 + "," + y3 + // curve point 2
        " " + x1 + "," + y1; // end point
}