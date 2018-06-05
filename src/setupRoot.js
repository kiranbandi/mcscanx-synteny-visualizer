import * as d3 from 'd3';
import documentationTemplate from './template/documentation.html';
import loaderTemplate from './template/loader.html';

export default function() {

    // load the documentation and loader template files
    d3.select('#doc-root').html(documentationTemplate);
    d3.select('#tool-root').append('div').html(loaderTemplate);

    //materialize instantiate navbar
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, {});
    });

    d3.selectAll('.nav-link')
        .on('click', function() {
            d3.event.preventDefault();
            d3.selectAll('.root-container').classed('hide', true);
            if (d3.select(this).attr('class').indexOf('doc') > -1) {
                d3.select('#doc-root').classed('hide', false);
            } else {
                d3.select('#tool-root').classed('hide', false);
            }
        })
}