import * as d3 from 'd3';
import _ from 'lodash';

export default function(container, configuration, chromosomeMap, callback) {

    container.append('h4')
        .text('Options Panel')
        .attr('class', 'filterheader red-text text-lighten-2 center-align');

    let sourceSelectContainer = container.append('div')
        .attr('class', 'sourceSelectContainer input-field col s12 m6 l3');

    let sourceSelect = sourceSelectContainer
        .append("select")
        .attr('class', 'sourceSelect')
        // null doesnt work but an empty string works when setting only one attribute because d3 is ¯\_(ツ)_/¯
        .attr('multiple', '');

    sourceSelect.append('option')
        .attr('value', '')
        .attr('disabled', '')
        .text('Select Chromosomes');

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

    sourceSelectContainer
        .append('label')
        .text('Source Chromosomes');

    let targetSelectContainer = container.append('div')
        .attr('class', 'targetSelectContainer input-field col s12 m6 l3');

    let targetSelect = targetSelectContainer
        .append("select")
        .attr('class', 'targetSelect')
        .attr('multiple', '');

    targetSelect.append('option')
        .attr('value', '')
        .attr('disabled', '')
        .text('Select Chromosomes');

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

    targetSelectContainer
        .append('label')
        .text('Target Chromosomes');

    let themeAndPlotOptionContainer = container.append('div')
        .attr('class', 'themeAndPlotOptionContainer col m6 l5');

    themeAndPlotOptionContainer.append('h4')
        .attr('class', 'col s3')
        .style('font-size', '1.4em')
        .text('Dark Theme')

    themeAndPlotOptionContainer.append('div')
        .attr('class', 'col s3 switch')
        .style('margin-top', '1.52em')
        .html('<label>OFF<input type="checkbox" id="darkTheme"><span class="lever"></span>ON</label>');

    themeAndPlotOptionContainer.append('h4')
        .attr('class', 'col s3')
        .style('font-size', '1.4em')
        .text('Plot Type')

    themeAndPlotOptionContainer.append('div')
        .attr('class', 'col s3 switch')
        .style('margin-top', '1.52em')
        .html('<label>BAR<input type="checkbox" id="plotType" ><span class="lever"></span>DOT</label>');

    let sourceSelectInstance = M.FormSelect.init(document.querySelector('.sourceSelectContainer select'), { 'classes': 'chromosomeSelect', dropdownOptions: {} }),
        targetSelectInstance = M.FormSelect.init(document.querySelector('.targetSelectContainer select'), { 'classes': 'chromosomeSelect', dropdownOptions: {} });

    let generateButtonContainer = container.append('div')
        .attr('class', 'generateButtonContainer col m6 l1 ')
        .append('a')
        .style('margin-top', '1em')
        .attr('class', 'waves-effect waves-light btn')
        .html('<i class="material-icons right">cached</i>GO')
        .on('click', () => {
            callback({
                'source': sourceSelectInstance.getSelectedValues(),
                'target': targetSelectInstance.getSelectedValues(),
            }, d3.select("#darkTheme").property("checked"), d3.select("#plotType").property("checked"));
        });

}

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