import * as d3 from 'd3';
import _ from 'lodash';

// code for clone change type legend
export default function(container) {

    let legends = [
        [d3.schemeCategory10[0], 'Direct Alignment'],
        [d3.schemeCategory10[3], 'Flipped Alignment']
    ];

    let globalLegends = container.append('div')
        .attr('class', 'legendContainer row center-align')
        .selectAll('.changeLegend')
        .data(legends)
        .enter()
        .each(function(legend) {
            let legendBox = d3.select(this).append('div')
                .attr('class', 'globalLegendBox center-align')
                .style('margin-top', '10px')

            legendBox.append('div')
                .attr('class', 'changeLegend col s1')
                .style('opacity', '0.7')
                .style('height', '23px')
                .style("background-color", (d) => d[0])

            legendBox.append('h5')
                .attr('class', 'globalLegendText col s11 blue-text text-lighten-2')
                .style('margin', '0px')
                .style('line-height', '100%')
                .text((d) => d[1]);
        })

}