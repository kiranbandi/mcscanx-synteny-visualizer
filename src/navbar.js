import * as d3 from 'd3';

export default function() {

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