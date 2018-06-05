import _ from 'lodash';
import * as d3 from 'd3';

export default function(svg, configuration, chromosomeMap, alignmentList, genomeLibrary, linePositions) {

    let alignmentLinePositions = _.map(alignmentList, (alignment, index) => {

        let firstLink = alignment.links[0],
            lastLink = alignment.links[alignment.links.length - 1];
        let sourceChromosome = chromosomeMap.get(alignment.source),
            targetChromosome = chromosomeMap.get(alignment.target);
        let sourceLinePosition = _.find(linePositions.source, (o) => o.key == alignment.source),
            targetLinePosition = _.find(linePositions.target, (o) => o.key == alignment.target);

        let first_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(firstLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
        let last_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(lastLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
        let first_link_y = targetLinePosition.y1 + ((genomeLibrary.get(firstLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);
        let last_link_y = targetLinePosition.y1 + ((genomeLibrary.get(lastLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);

        return {
            'x1': first_link_x,
            'x2': last_link_x,
            'y1': first_link_y,
            'y2': last_link_y,
            alignment
        };
    })

    let alignmentLines = svg
        .selectAll('.alignment-link-lines')
        .data(alignmentLinePositions);

    alignmentLines.exit().remove();

    alignmentLines = alignmentLines
        .enter()
        .append('line')
        .merge(alignmentLines)
        .attr('class', (d, i) => {
            return 'alignment-link-lines alignment-link-source-' + d.alignment.source + ' alignment-link-target-' + d.alignment.target;
        })
        .style('stroke-width', '3px')
        .attr('x1', (d) => d.x1)
        .attr('x2', (d) => d.x2)
        .attr('y1', (d) => d.y1)
        .attr('y2', (d) => d.y2)

    // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
    alignmentLines.append('title')
        .text((d) => {
            return d.alignment.source + " => " + d.alignment.target +
                "\n type : " + d.alignment.type +
                "\n E value : " + d.alignment.e_value +
                "\n score : " + d.alignment.score +
                "\n count : " + d.alignment.count
        });

}