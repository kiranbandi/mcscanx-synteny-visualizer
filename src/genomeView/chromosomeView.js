import * as d3 from 'd3';
import markerSetup from './markers';
import linkSetup from './links';

export default function(container, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    // unlike earlier cases the container here is cleared and added as fresh svg everytime
    // this ensure that zooming and panning works smoothly without colidding with earlier assets

    // change header text to chromosome view
    container.select('.genomeViewHeader').text('Chromosome View');
    // hide genomeViewSVG
    container.select('.genomeViewSVG').classed('hide', true);
    // clear its contents to ensure no cross issues
    container.select('.genomeViewSVG').selectAll('*').remove();

    let chromosomeViewRootSVG = container
        .append('svg')
        .attr('class', 'chromosomeViewRootSVG')
        // temporarily hardcoded to 425 pixels
        .attr('height', 425)
        .attr('width', configuration.width);

    let chromosomeViewSVG = chromosomeViewRootSVG
        .append('g')
        .attr('class', 'chromosomeViewSVG')
        // temporarily hardcoded to 425 pixels
        .attr('height', 425)
        .attr('width', configuration.width);

    //set theming based on configuration params
    chromosomeViewRootSVG.classed('darkPlot', configuration.isDarkTheme);

    // create an instance of d3 zoom
    let zoomInstance = d3.zoom()
        .scaleExtent([1, 4])
        .filter(() => {
            if (d3.event.type == 'dblclick') {
                return false;
            }
            return true;
        })
        .on("zoom", () => {
            chromosomeViewSVG.attr("transform", d3.event.transform);
        })
    chromosomeViewRootSVG.call(zoomInstance);

    let markerConfiguration = markerSetup(chromosomeViewSVG, configuration, chromosomeMap, false);
    linkSetup(chromosomeViewSVG, markerConfiguration, alignmentList, chromosomeMap, genomeLibrary, false, zoomInstance);

    // reset button 
    chromosomeViewRootSVG
        .append('rect')
        .attr('class', 'chromosomeViewReset')
        .style('cursor', 'pointer')
        .attr('x', configuration.width - 50)
        .attr('y', 20)
        .attr('height', 24)
        .attr('width', 24)
        .style('fill', configuration.isDarkTheme ? 'black' : 'white')
        .on('click', resetEffects.bind(this));

    // icon for reset button
    chromosomeViewRootSVG
        .append('svg')
        .attr('x', configuration.width - 50)
        .attr('y', 20)
        .append('path')
        .style('cursor', 'pointer')
        .style('fill', '#2bbbad')
        .style('pointer-events', 'all')
        .attr('d', 'M 15.324219 4.445313 C 13.496094 3.640625 11.433594 3.515625 9.515625 4.121094 C 5.871094 5.269531 3.507813 8.726563 3.753906 12.53125 L 1.265625 12.695313 C 0.945313 7.738281 4.027344 3.238281 8.765625 1.742188 C 11.539063 0.867188 14.546875 1.171875 17.097656 2.550781 L 19.484375 0 L 20.121094 7.074219 L 12.628906 7.324219 Z M 15.230469 22.257813 C 14.179688 22.585938 13.089844 22.753906 12.007813 22.753906 C 10.242188 22.753906 8.488281 22.296875 6.90625 21.445313 L 4.515625 24 L 3.882813 16.925781 L 11.371094 16.675781 L 8.679688 19.554688 C 10.5 20.355469 12.5625 20.484375 14.480469 19.878906 C 18.125 18.726563 20.492188 15.265625 20.246094 11.46875 L 22.730469 11.304688 C 23.058594 16.253906 19.972656 20.757813 15.230469 22.257813 Z ')
        .on('click', resetEffects.bind(this));

    function resetEffects() {
        chromosomeViewRootSVG.call(zoomInstance.transform, d3.zoomIdentity.scale(1).translate(0, 0));
        d3.selectAll('.hiddenLink').classed('hiddenLink', false);
        d3.selectAll('.activeLink').classed('activeLink', false);
    }

}