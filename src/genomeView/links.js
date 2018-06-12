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

        let sourceMarker = _.find(configuration.genomeView.markerPositions.source, (o) => o.key == alignment.source),
            targetMarker = _.find(configuration.genomeView.markerPositions.target, (o) => o.key == alignment.target);

        let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx),
            targetGeneWidth = ((targetGenes[1] - targetGenes[0]) / (targetChromosome.width)) * (targetMarker.dx),
            sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
            targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
            // pick the one with the smaller width and ensure the minimum is 2px
            linkWidth = Math.max(sourceGeneWidth, targetGeneWidth, 2);

        // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
        return {
            source: {
                'x': sourceMarker.x + sourceX,
                'y': configuration.genomeView.verticalPositions.source + 10,
                'x1': sourceMarker.x + sourceX + sourceGeneWidth
            },
            target: {
                'x': targetMarker.x + targetX,
                'y': configuration.genomeView.verticalPositions.target - 10,
                'x1': targetMarker.x + targetX + targetGeneWidth
            },
            alignment,
            width: linkWidth
        };
    })
}

function drawLinks(svg, links, configuration) {

    let linkContainer = svg.select('.linkContainer');

    // intialise container if the markers are being drawn for the first time
    if (!linkContainer.node()) {
        linkContainer = svg
            .append('g')
            .attr('class', 'linkContainer');
    }

    // split links into two parts , the links that have widths of less than 2 px can be drawn as lines 
    // and the other are drawn as polygon links
    let link_collection = _.partition(links, function(link) { return link.width == '2'; });

    // Draw links lines for small links
    let genomicLinks = linkContainer
        .selectAll('.link')
        .data(link_collection[0]);

    genomicLinks.exit().remove();

    genomicLinks = genomicLinks
        .enter()
        .append("path")
        .merge(genomicLinks)
        .attr("class", (d) => {
            return 'genome-link link hover-link' + " link-source-" + d.alignment.source;
        })
        .attr("d", function(d) {
            return createLinkLinePath(d);
        })
        .style("stroke-width", function(d) {
            return d.width;
        })
        .style('stroke', (d, i) => {
            let sourceIndex = configuration.markers.source.indexOf(d.alignment.source);
            return ((sourceIndex == -1) || sourceIndex > 9) ? '#808080' : d3.schemeCategory10[sourceIndex];
        })

    // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
    genomicLinks.append('title')
        .text((d) => {
            return d.alignment.source + " => " + d.alignment.target +
                "\n type : " + d.alignment.type +
                "\n E value : " + d.alignment.e_value +
                "\n score : " + d.alignment.score +
                "\n count : " + d.alignment.count
        });

    // Draw links Polygons for large links
    let genomicPolygonLinks = linkContainer
        .selectAll('.link-polygon')
        .data(link_collection[1]);

    genomicPolygonLinks.exit().remove();

    genomicPolygonLinks = genomicPolygonLinks
        .enter()
        .append("path")
        .merge(genomicPolygonLinks)
        .attr("class", (d) => {
            return 'genome-link link-polygon hover-link-polygon' + " link-source-" + d.alignment.source;
        })
        .attr("d", function(d) {
            return createLinkPolygonPath(d);
        })
        .style('fill', (d, i) => {
            let sourceIndex = configuration.markers.source.indexOf(d.alignment.source);
            return ((sourceIndex == -1) || sourceIndex > 9) ? '#808080' : d3.schemeCategory10[sourceIndex];
        })

    // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
    genomicPolygonLinks.append('title')
        .text((d) => {
            return d.alignment.source + " => " + d.alignment.target +
                "\n type : " + d.alignment.type +
                "\n E value : " + d.alignment.e_value +
                "\n score : " + d.alignment.score +
                "\n count : " + d.alignment.count
        });


}

function createLinkLinePath(d) {
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

function createLinkPolygonPath(d) {

    let curvature = 0.65;
    // code block sourced from d3-sankey https://github.com/d3/d3-sankey for drawing curved blocks
    var x = d.source.x,
        x1 = d.target.x,
        y = d.source.y,
        y1 = d.target.y,
        yi = d3.interpolateNumber(y, y1),
        y2 = yi(curvature),
        y3 = yi(1 - curvature),
        p0 = d.target.x1,
        p1 = d.source.x1,
        q0 = d.target.y,
        q1 = d.source.y,
        qi = d3.interpolateNumber(q0, q1),
        q2 = qi(curvature),
        q3 = qi(1 - curvature);

    return "M" + x + "," + y + // svg start point
        "C" + x + "," + y2 + // 1st curve point 1
        " " + x1 + "," + y3 + // 1st curve point 2
        " " + x1 + "," + y1 + // 1st curve end point
        "L" + p0 + "," + q0 + // bottom line
        "C" + p0 + "," + q2 + // 2nd curve point 1
        " " + p1 + "," + q3 + // 2nd curve point 2
        " " + p1 + "," + q1 // end point and move back to start
}