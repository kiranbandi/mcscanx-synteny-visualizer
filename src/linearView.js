import * as d3 from 'd3';
import _ from 'lodash';

export default function(information, alignmentList, genomeLibrary, chromosomeMap) {

    let { clientWidth } = document.body,
        width = clientWidth < window.innerHeight ? clientWidth : window.innerHeight;

    let linearViewMainContainer = d3.select("#root")
        .append('div')
        .attr('class', 'linearViewMainContainer'),

        headContainer = linearViewMainContainer.append('div')
        .attr('class', 'headContainer row'),

        filterConainter = headContainer.append('div')
        .attr('class', 'subContainer filterConainter col s12');

    makeInfoVisualization(headContainer, information);
}

function parseAlignmentDetails(alignmentDetails) {
    let alignmentDetailsList = alignmentDetails.split(' ');
    return {
        'score': alignmentDetailsList[3].split('=')[1].trim(),
        'e_value': alignmentDetailsList[4].split('=')[1].trim(),
        'count': alignmentDetailsList[5].split('=')[1].trim(),
        'type': alignmentDetailsList[7].trim(),
        'source': alignmentDetailsList[6].split('&')[0].trim(),
        'target': alignmentDetailsList[6].split('&')[1].trim()
    };
}

function makeInfoVisualization(headContainer, information) {

    let infoContainer = headContainer.append('div')
        .attr('class', 'subContainer infoContainer col s12 m6 center-align'),

        graphicContainer = headContainer.append('div')
        .attr('class', 'subContainer graphicContainer col s12 m6 center-align');

    infoContainer.append('h4')
        .text('Information')
        .attr('class', 'red-text text-lighten-2');

    graphicContainer.append('h4')
        .text('Share of Collinear Genes')
        .attr('class', 'red-text text-lighten-2');

    infoContainer
        .selectAll('.subInfoTitle')
        .data(information.parameters)
        .enter()
        .append('h6')
        .attr('class', 'subInfoTitle')
        .text((d) => d[0] + " : " + d[1]);


    let width = (graphicContainer.node().clientWidth) / 2,
        radius = width / 2;

    let color = d3.scaleOrdinal()
        .range(['#be1522', '#1d1d1b']);

    let vis = graphicContainer
        .append("svg")
        .data([
            [information.stats.percentage, 100 - information.stats.percentage]
        ])
        .attr("width", width)
        .attr("height", width)
        .append("svg:g")
        .attr('transform', 'translate(' + radius + ',' + radius + ')'),

        arc = d3.arc()
        .innerRadius(radius / 1.25)
        .outerRadius(radius),

        pie = d3.pie()
        .startAngle(-90 * (Math.PI / 180))
        .endAngle(90 * (Math.PI / 180))
        .padAngle(.02)
        .sort(null)
        .value((d) => d),

        arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("svg:g")
        .attr("class", "slice")
        .append("svg:path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc),

        textFiller = vis.append('svg:text')
        .attr('class', 'pieText')
        .attr('transform', 'translate(-' + 0.2 * radius + ',-' + 0.2 * radius + ')')
        .text(information.stats.percentage + " %");
}