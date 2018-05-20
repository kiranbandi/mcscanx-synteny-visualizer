import * as d3 from 'd3';

export default function(container, information) {

    let infoContainer = container.append('div')
        .attr('class', 'subContainer infoContainer col s12 m6 center-align'),

        graphicContainer = container.append('div')
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

    let width = (graphicContainer.node().getBoundingClientRect().width) / 2,
        radius = width / 2;

    let color = d3.scaleOrdinal()
        .range(['#be1522', '#1d1d1b']);

    let vis = graphicContainer
        .append("svg")
        .data([
            [information.stats.percentage, 100 - information.stats.percentage]
        ])
        .attr("width", width)
        .attr("height", width / 2)
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
        .text(information.stats.percentage + "%")

    textFiller.attr('transform', function() {
        return 'translate(-' + (this.clientWidth / 2) + ',-' + 0.2 * radius + ')';
    })

}