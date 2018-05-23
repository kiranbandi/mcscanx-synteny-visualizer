export default function(svgContainer, configuration, chromosomeMap) {
    let linePositions = initialisePostions(configuration, chromosomeMap);
    drawPositionalLines(svgContainer, configuration, linePositions);
    return linePositions;
}

function drawPositionalLines(svgContainer, configuration, positions) {
    // Lots of repetitions happening here but can be changed later 

    // Drawing Vertical Lines 
    svgContainer.append('line')
        .attr('class', 'y-axis')
        .style('stroke', '#3a3a3a')
        .style('stroke-width', '2px')
        .attr('x1', configuration.dotView.offset)
        .attr('y1', configuration.dotView.offset)
        .attr('x2', configuration.dotView.offset)
        .attr('y2', configuration.dotView.innerWidth + configuration.dotView.offset)


    let verticalLines = svgContainer
        .selectAll('.marker-x-lines')
        .data(positions.source);

    verticalLines.exit().remove();

    verticalLines = verticalLines
        .enter()
        .append('line')
        .merge(verticalLines)
        .attr('class', (d, i) => {
            return 'marker-x-lines marker-x-source-' + d.key;
        })
        .style('stroke', '#3a3a3a')
        .style('stroke-width', '2px')
        .transition()
        .duration(500)
        .attr('x1', (d) => d.x2)
        .attr('x2', (d) => d.x2)
        .attr('y1', (d) => d.y1)
        .attr('y2', (d) => d.y2)

    let verticalLineTexts = svgContainer
        .selectAll('.marker-x-lines-text')
        .data(positions.source);

    verticalLineTexts.exit().remove();

    verticalLineTexts = verticalLineTexts.enter()
        .append('text')
        .merge(verticalLineTexts)
        .text((d) => d.data.chromosomeName)
        .attr('class', (d) => 'marker-x-lines-text dot-plot-markers marker-x-lines-text-' + d.key)
        .attr('x', function(d) {
            return (d.x1 + ((d.x2 - d.x1) / 2)) - (this.getBoundingClientRect().width / 2);
        })
        .attr('y', (d) => d.y1 - 10);


    // Drawing Horizontal Lines 
    svgContainer.append('line')
        .attr('class', 'x-axis')
        .style('stroke', '#3a3a3a')
        .style('stroke-width', '2px')
        .attr('x1', configuration.dotView.offset)
        .attr('y1', configuration.dotView.offset)
        .attr('x2', configuration.dotView.innerWidth + configuration.dotView.offset)
        .attr('y2', configuration.dotView.offset)


    let horizontalLines = svgContainer
        .selectAll('.marker-y-lines')
        .data(positions.target);

    horizontalLines.exit().remove();

    horizontalLines = horizontalLines
        .enter()
        .append('line')
        .merge(horizontalLines)
        .attr('class', (d, i) => {
            return 'marker-y-lines marker-x-target-' + d.key;
        })
        .style('stroke', '#3a3a3a')
        .style('stroke-width', '2px')
        .transition()
        .duration(750)
        .attr('x1', (d) => d.x1)
        .attr('x2', (d) => d.x2)
        .attr('y1', (d) => d.y2)
        .attr('y2', (d) => d.y2)


    let horizontalLineTexts = svgContainer
        .selectAll('.marker-y-lines-text')
        .data(positions.target);

    horizontalLineTexts.exit().remove();

    horizontalLineTexts = horizontalLineTexts.enter()
        .append('text')
        .merge(horizontalLineTexts)
        .text((d) => d.data.chromosomeName)
        .attr('class', (d) => 'marker-y-lines-text dot-plot-markers marker-y-lines-text-' + d.key)
        .attr('y', function(d) {
            return ((d.y1 + ((d.y2 - d.y1) / 2)) + ((this.getBoundingClientRect().height) / 2));
        })
        .attr('x', (d) => d.x1 - 45);

}

function initialisePostions(configuration, chromosomeCollection) {

    let maxWidthAvailable = configuration.dotView.innerWidth;

    let maximumWidthX = _.sumBy(configuration.markers.source, (key) => chromosomeCollection.get(key).width),
        maximumWidthY = _.sumBy(configuration.markers.target, (key) => chromosomeCollection.get(key).width);

    let scaleFactorX = maxWidthAvailable / maximumWidthX,
        scaleFactorY = maxWidthAvailable / maximumWidthY

    let posistions = {};

    let sourceWidthUsedSoFar = configuration.dotView.offset;
    posistions.source = _.map(configuration.markers.source, (sourceKey, index) => {
        let sourceBit = {
            'data': chromosomeCollection.get(sourceKey),
            'key': sourceKey,
            'x1': sourceWidthUsedSoFar,
            'x2': sourceWidthUsedSoFar + (scaleFactorX * (chromosomeCollection.get(sourceKey).width)),
            'y1': configuration.dotView.offset,
            'y2': configuration.dotView.innerWidth + configuration.dotView.offset
        }
        sourceWidthUsedSoFar = sourceBit.x2;
        return sourceBit;
    });

    let targetWidthUsedSoFar = configuration.dotView.offset;
    posistions.target = _.map(configuration.markers.target, (targetKey, index) => {
        let targetBit = {
            'data': chromosomeCollection.get(targetKey),
            'key': targetKey,
            'y1': targetWidthUsedSoFar,
            'y2': targetWidthUsedSoFar + (scaleFactorY * (chromosomeCollection.get(targetKey).width)),
            'x1': configuration.dotView.offset,
            'x2': configuration.dotView.innerWidth + configuration.dotView.offset
        }
        targetWidthUsedSoFar = targetBit.y2;
        return targetBit;
    });

    return posistions;
}