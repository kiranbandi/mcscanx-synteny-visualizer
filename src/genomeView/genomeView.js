import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';
import processAlignment from '../filterAlignments';
import chromosomeView from '../chromosomeView/chromosomeView';

export default function(container, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    let genomeViewSVG = container.select('.genomeViewSVG'),
        genomeViewHeader = container.select('.genomeViewHeader'),
        genomeViewFilterHeader = container.select('.genomeViewFilterHeader');

    // if svg doesnt exist create it 
    if (!genomeViewSVG.node()) {

        genomeViewHeader = container.append('h4')
            .attr('class', 'genomeViewHeader red-text text-lighten-2 center-align');

        genomeViewSVG = container
            .append('svg')
            .attr('class', 'genomeViewSVG')
            .attr('height', configuration.genomeView.height)
            .attr('width', configuration.genomeView.width);

        genomeViewFilterHeader = container.append('h5')
            .attr('class', 'genomeViewFilterHeader red-text text-lighten-2 center-align');


    }

    //set theming based on configuration params
    genomeViewSVG.classed('darkPlot', configuration.isDarkTheme);

    // clear existing chromosomeView or BlockView assets if any
    container.select('.chromosomeViewContainer').remove();
    container.select('.blockViewContainer').remove();

    if (configuration.markers.source.length == 0 || configuration.markers.target.length == 0) {
        genomeViewSVG.classed('hide', true);
        container.select('.chromosomeViewSVG').classed('hide', true);
        genomeViewHeader.text("Source or Target Empty");
    } else if (configuration.markers.source.length == 1 && configuration.markers.target.length == 1) {
        configuration.chromosomeView.markers = configuration.markers;
        genomeViewSVG.classed('hide', true);
        genomeViewHeader.text("");
        genomeViewFilterHeader.text("");
        // remove slider and any content 
        container.selectAll('.genomeViewFilter').remove();
        chromosomeView(container, configuration, alignmentList, genomeLibrary, chromosomeMap);
    } else {

        genomeViewSVG.classed('hide', false);
        genomeViewHeader.text("Genome View");
        genomeViewFilterHeader.text('Drag the slider to filter smaller blocks');

        configuration = markerSetup(genomeViewSVG, configuration, chromosomeMap, function(sourceMarkerID, targetMarkerID) {
            configuration.chromosomeView.markers = { 'source': [sourceMarkerID], 'target': [targetMarkerID] };
            // process alignments for selected markers
            let updatedAlignmentList = processAlignment(configuration.chromosomeView.markers, alignmentList);
            chromosomeView(container, configuration, updatedAlignmentList, genomeLibrary, chromosomeMap);
        });

        linkSetup(genomeViewSVG, configuration, alignmentList, chromosomeMap, genomeLibrary);

        let x = d3.scaleLinear()
            .domain([0, _.maxBy(alignmentList, function(o) { return o.count; }).count])
            .range([0, 0.80 * configuration.genomeView.width])
            .clamp(true);

        // remove slider and any content 
        container.selectAll('.genomeViewFilter').remove();

        let genomeViewFilter = container
            .append('svg')
            .attr('class', 'genomeViewFilter')
            .attr('height', 30)
            .attr('width', configuration.genomeView.width)
            .style('margin-bottom', '25px');

        let slider = genomeViewFilter.append("g")
            .attr("class", "slider")
            .style("transform", "translate(" + (0.10 * configuration.genomeView.width) + "px," + 0 + "10px)");

        let sliderTrack = slider.append("line")
            .attr("class", "track")
            .attr("x1", x.range()[0])
            .attr("x2", x.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay");

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(x.ticks(10))
            .enter().append("text")
            .attr("x", x)
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });

        let handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9);

        sliderTrack.call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
                let maxCount = x.invert(d3.event.x);
                handle.attr("cx", x(maxCount));
                let filteredAlignment = _.filter(alignmentList, function(o) { return o.count > maxCount; });
                linkSetup(genomeViewSVG, configuration, filteredAlignment, chromosomeMap, genomeLibrary);
            }));

    }
}