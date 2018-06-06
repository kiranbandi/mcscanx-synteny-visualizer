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

    let blockViewRootSVG = blockViewContainer
        .append('svg')
        .attr('class', 'blockViewRootSVG')
        // temporarily hardcoded to 300 pixels
        .attr('height', 300)
        .attr('width', configuration.blockView.width)
        //set theming based on configuration params
        .classed('darkPlot', configuration.isDarkTheme);

    configuration.blockView.innerWidth = configuration.blockView.width * 0.90;
    configuration.blockView.leftOffeset = configuration.blockView.width * 0.05;

    let blockViewSVG = blockViewRootSVG
        .append('g')
        .attr('class', 'blockViewSVG')
        // temporarily hardcoded to 300 pixels
        .attr('height', 300)
        .attr('width', configuration.blockView.width);


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
            }
        };
    })

    // Make small chevron shaped markers here based on on positions for each gene ID in both target and source 
    let linkMarkerPairList = blockViewSVG
        .selectAll('blockView-markers')
        .data(markerPositions)
        .enter()

    // draw all source markers
    linkMarkerPairList.append('line')
        .attr('class', 'blockView-markers source-marker')
        .style('stroke', d3.schemeCategory10[0])
        .style('stroke-width', '20px')
        .attr('x1', (d) => d.source.x1)
        .attr('x2', (d) => d.source.x2)
        .attr('y1', (d) => d.source.y)
        .attr('y2', (d) => d.source.y)

    // draw all source markers
    linkMarkerPairList.append('line')
        .attr('class', 'blockView-markers target-marker')
        .style('stroke', 'black')
        .style('stroke-width', '20px')
        .attr('x1', (d) => d.target.x1)
        .attr('x2', (d) => d.target.x2)
        .attr('y1', (d) => d.target.y)
        .attr('y2', (d) => d.target.y)

    let polygonLink = blockViewSVG
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

}