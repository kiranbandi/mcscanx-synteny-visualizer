import * as d3 from 'd3';
import _ from 'lodash';
import filterPanelTemplate from './template/filter.html';

export default function(container, configuration, chromosomeMap, callback) {

    container.append('div')
        .attr('class', 'subContainer filterContainer col s12 center-align')
        //append filter panel basic template
        .html(filterPanelTemplate);

    let sourceSelect = container.select('.sourceSelect');

    sourceSelect.selectAll('.sourceOption')
        .data([...chromosomeMap].sort(sortAlphaNum))
        .enter()
        .append('option')
        .attr('class', 'sourceOption')
        .attr('value', (d) => d[0])
        .text((d) => d[0])
        .filter((d) => {
            return configuration.markers.source.indexOf(d[0]) > -1;
        })
        .attr('selected', '');

    let targetSelect = container.select('.targetSelect');

    targetSelect.selectAll('.sourceOption')
        .data([...chromosomeMap].sort(sortAlphaNum))
        .enter()
        .append('option')
        .attr('class', 'sourceOption')
        .attr('value', (d) => d[0])
        .text((d) => d[0])
        .filter((d) => {
            return configuration.markers.target.indexOf(d[0]) > -1;
        })
        .attr('selected', '');

    // Materialize instantiate the dropdown selectors
    let sourceSelectInstance = M.FormSelect.init(sourceSelect.node(), { 'classes': '', dropdownOptions: {} }),
        targetSelectInstance = M.FormSelect.init(targetSelect.node(), { 'classes': '', dropdownOptions: {} });

    // attach filter button callback
    container.select('.filterButton')
        .on('click', () => {
            callback({
                'source': sourceSelectInstance.getSelectedValues(),
                'target': targetSelectInstance.getSelectedValues(),
            }, d3.select("#darkTheme").property("checked"), d3.select("#plotType").property("checked"));
        });
}

// Sorting the available chromosome markers alpha numerically code blurb sourced from stackoverflow
// https://stackoverflow.com/questions/41972652/how-to-sort-mixed-numeric-alphanumeric-array-in-javascript
function sortAlphaNum(a, b) {
    let reA = /[^a-zA-Z]/g;
    let reN = /[^0-9]/g;
    let aA = a[0].replace(reA, "");
    let bA = b[0].replace(reA, "");
    if (aA === bA) {
        let aN = parseInt(a[0].replace(reN, ""), 10);
        let bN = parseInt(b[0].replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}