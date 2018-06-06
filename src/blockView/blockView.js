import * as d3 from 'd3';

export default function(container, configuration, alignment, genomeLibrary, chromosomeMap) {

    // This div is removed everytime and populated as when the users opens it similar to the blockView
    // to ensure no mix up in zoom and pan effects
    if (container.select('.blockViewContainer').node()) {
        container.select('.blockViewContainer').remove();
    }

    let blockViewContainer = container.append('div')
        .attr('class', 'blockViewContainer');

    blockViewContainer.append('h4')
        .attr('class', 'blockViewHeader red-text text-lighten-2 center-align')
        .text('Block View');

    let blockViewInfoContainer = blockViewContainer.append('div')
        .attr('class', 'section center-align');

    let alignmentInfo = [
        ['Source Chromosome', 'source'],
        ['Target Chromosome', 'target'],
        ['Alignment Type', 'type'],
        ['Alignment Count', 'count'],
        ['Alignment Score', 'score'],
        ['E Value', 'e_value']
    ]

    blockViewInfoContainer.selectAll('.blockViewSubHeader')
        .data(alignmentInfo)
        .enter()
        .append('h6')
        .attr('class', 'blockViewSubHeader subInfoTitle blue-text')
        .text((d) => d[0] + ' : ' + alignment[d[1]]);

    let blockViewRootSVG = blockViewContainer
        .append('svg')
        .attr('class', 'blockViewRootSVG')
        // temporarily hardcoded to 300 pixels
        .attr('height', 320)
        .attr('width', configuration.blockView.width)
        //set theming based on configuration params
        .classed('darkPlot', configuration.isDarkTheme);

    configuration.blockView.innerWidth = configuration.blockView.width * 0.80;
    configuration.blockView.leftOffeset = configuration.blockView.width * 0.10;

    let blockViewSVG = blockViewRootSVG
        .append('g')
        .attr('class', 'blockViewSVG')
        // temporarily hardcoded to 300 pixels
        .attr('height', 320)
        .attr('width', configuration.blockView.width);

    // create an instance of d3 zoom
    let zoomInstance = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", () => {
            blockViewSVG.style("transform", "translate(" + d3.event.transform.x + "px," + "0px) scale(" + d3.event.transform.k + ",1)");
        });
    blockViewRootSVG.call(zoomInstance);


    let firstLink = alignment.links[0],
        lastLink = alignment.links[alignment.links.length - 1],
        sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source],
        targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target],
        sourceTrack = {
            'start': genomeLibrary.get(sourceGenes[0]).start,
            'end': genomeLibrary.get(sourceGenes[1]).end,
        },
        targetTrack = {
            'start': genomeLibrary.get(targetGenes[0]).start,
            'end': genomeLibrary.get(targetGenes[1]).end,
        };

    let maxWidthInBasePairs = Math.max((sourceTrack.end - sourceTrack.start), (targetTrack.end - targetTrack.start)),
        scalingFactor = configuration.blockView.innerWidth / maxWidthInBasePairs;

    // Make tracks for source and target 
    let markerTracks = blockViewSVG
        .selectAll('.marker-tracks')
        .data([0, 1])
        .enter()
        .append('line')
        .attr('class', 'marker-tracks')
        .style('stroke', (d) => {
            return (d == 0) ? '#04abda' : 'grey';
        })
        .style('opacity', '0.5')
        .style('stroke-width', '20px')
        .attr('x1', configuration.blockView.leftOffeset)
        .attr('y1', (d) => {
            return d == 0 ? configuration.blockView.verticalPositions['source'] : configuration.blockView.verticalPositions['target']
        })
        .attr('x2', (d) => {
            return configuration.blockView.leftOffeset + configuration.blockView.innerWidth;
        })
        .attr('y2', (d) => {
            return d == 0 ? configuration.blockView.verticalPositions['source'] : configuration.blockView.verticalPositions['target']
        })

    //Eventually need to also add ticks on the marker tracks here

    // Find the marker positions 
    let markerPositions = _.map(alignment.links, (link) => {
        // the marker height is 10 px so we add and reduce that to the y postion for top and bottom

        let sourceGene = genomeLibrary.get(link.source),
            targetGene = genomeLibrary.get(link.target);

        return {
            source: {
                'x1': configuration.blockView.leftOffeset + ((sourceGene.start - sourceTrack.start) * scalingFactor),
                'x2': configuration.blockView.leftOffeset + ((sourceGene.end - sourceTrack.start) * scalingFactor),
                'y': configuration.blockView.verticalPositions.source
            },
            target: {
                'x1': configuration.blockView.leftOffeset + ((targetGene.start - targetTrack.start) * scalingFactor),
                'x2': configuration.blockView.leftOffeset + ((targetGene.end - targetTrack.start) * scalingFactor),
                'y': configuration.blockView.verticalPositions.target
            },
            link
        };
    })

    // Make small chevron shaped markers here based on on positions for each gene ID in both target and source 
    let linkMarkerPairList = blockViewSVG
        .selectAll('blockView-markers')
        .data(markerPositions)
        .enter();

    // draw all source markers
    let sourceMarkers = linkMarkerPairList.append('line')
        .attr('class', 'blockView-markers source-marker')
        .style('stroke', d3.schemeCategory10[0])
        .style('stroke-width', '20px')
        .attr('x1', (d) => d.source.x1)
        .attr('x2', (d) => d.source.x2)
        .attr('y1', (d) => d.source.y)
        .attr('y2', (d) => d.source.y);

    // draw all source markers
    let targetMarkers = linkMarkerPairList.append('line')
        .attr('class', 'blockView-markers target-marker')
        .style('stroke', '#0c0b0b')
        .style('stroke-width', '20px')
        .attr('x1', (d) => d.target.x1)
        .attr('x2', (d) => d.target.x2)
        .attr('y1', (d) => d.target.y)
        .attr('y2', (d) => d.target.y);

    let polygonLinks = blockViewSVG
        .selectAll('blockView-polylinks')
        .data(markerPositions)
        .enter()
        .append('polygon')
        .attr('class', 'blockView-polylinks')
        .attr('points', (d) => {
            return d.source.x1 + "," + (d.source.y + 10) +
                " " + d.source.x2 + "," + (d.source.y + 10) +
                " " + d.target.x2 + "," + (d.target.y - 10) +
                " " + d.target.x1 + "," + (d.target.y - 10);
        })
        .style('fill', d3.schemeCategory10[0]);

    // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
    polygonLinks
        .append('title')
        .text((d) => {
            return d.link.source + " => " + d.link.target;
        });
    sourceMarkers
        .append('title')
        .text((d) => {
            return d.link.source;
        });
    targetMarkers
        .append('title')
        .text((d) => {
            return d.link.target;
        });


    // reset button 
    blockViewRootSVG
        .append('rect')
        .attr('class', 'blockViewReset')
        .style('cursor', 'pointer')
        .attr('x', configuration.blockView.width - 50)
        .attr('y', 20)
        .attr('height', 24)
        .attr('width', 24)
        .style('fill', configuration.isDarkTheme ? 'black' : 'white')
        .on('click', resetEffects.bind(this));

    // icon for reset button
    blockViewRootSVG
        .append('svg')
        .attr('x', configuration.blockView.width - 50)
        .attr('y', 20)
        .append('path')
        .style('cursor', 'pointer')
        .style('fill', '#2bbbad')
        .style('pointer-events', 'all')
        .attr('d', 'M 15.324219 4.445313 C 13.496094 3.640625 11.433594 3.515625 9.515625 4.121094 C 5.871094 5.269531 3.507813 8.726563 3.753906 12.53125 L 1.265625 12.695313 C 0.945313 7.738281 4.027344 3.238281 8.765625 1.742188 C 11.539063 0.867188 14.546875 1.171875 17.097656 2.550781 L 19.484375 0 L 20.121094 7.074219 L 12.628906 7.324219 Z M 15.230469 22.257813 C 14.179688 22.585938 13.089844 22.753906 12.007813 22.753906 C 10.242188 22.753906 8.488281 22.296875 6.90625 21.445313 L 4.515625 24 L 3.882813 16.925781 L 11.371094 16.675781 L 8.679688 19.554688 C 10.5 20.355469 12.5625 20.484375 14.480469 19.878906 C 18.125 18.726563 20.492188 15.265625 20.246094 11.46875 L 22.730469 11.304688 C 23.058594 16.253906 19.972656 20.757813 15.230469 22.257813 Z ')
        .on('click', resetEffects.bind(this));


    // invert button 
    blockViewRootSVG
        .append('rect')
        .attr('class', 'blockViewInvert')
        .style('cursor', 'pointer')
        .attr('x', configuration.blockView.width - 110)
        .attr('y', 20)
        .attr('height', 24)
        .attr('width', 24)
        .style('fill', configuration.isDarkTheme ? 'black' : 'white')
        .on('click', invertTargetClick.bind({ targetMarkers, polygonLinks, configuration }));

    // icon for reset button
    blockViewRootSVG
        .append('svg')
        .attr('x', configuration.blockView.width - 110)
        .attr('y', 20)
        .append('path')
        .style('cursor', 'pointer')
        .style('fill', '#2bbbad')
        .style('pointer-events', 'all')
        .attr('d', 'M32,16.009c0-0.267-0.11-0.522-0.293-0.714  l-9.899-9.999c-0.391-0.395-1.024-0.394-1.414,0c-0.391,0.394-0.391,1.034,0,1.428l8.193,8.275H1c-0.552,0-1,0.452-1,1.01  s0.448,1.01,1,1.01h27.586l-8.192,8.275c-0.391,0.394-0.39,1.034,0,1.428c0.391,0.394,1.024,0.394,1.414,0l9.899-9.999  C31.894,16.534,31.997,16.274,32,16.009z')
        .on('click', invertTargetClick.bind({ targetMarkers, polygonLinks, configuration }));

    function resetEffects() {
        blockViewRootSVG.call(zoomInstance.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    function invertTargetClick() {
        d3.event.stopPropagation();
        invertTarget(this.targetMarkers, this.polygonLinks, this.configuration);
    }

}

function invertTarget(markers, polygons, configuration) {
    // draw all source markers
    markers
        .transition()
        .duration(500)
        .attr('x1', function(d) {
            return configuration.blockView.width - d3.select(this).attr('x1');
        })
        .attr('x2', function(d) {
            return configuration.blockView.width - d3.select(this).attr('x2');
        })

    // draw all source markers
    polygons
        .transition()
        .duration(500)
        .attr('points', function(d) {
            let currentPoints = d3.select(this).attr('points').split(" "),
                third_vertex_coordinates = currentPoints[2].split(","),
                fourth_vertex_coordinates = currentPoints[3].split(",");

            third_vertex_coordinates[0] = configuration.blockView.width - third_vertex_coordinates[0];
            fourth_vertex_coordinates[0] = configuration.blockView.width - fourth_vertex_coordinates[0];

            return currentPoints[0] +
                " " + currentPoints[1] +
                " " + fourth_vertex_coordinates.join(',') +
                " " + third_vertex_coordinates.join(',');
        })
}