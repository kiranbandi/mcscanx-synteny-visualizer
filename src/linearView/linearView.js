import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';

export default function(svg, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    configuration = markerSetup(svg, configuration, chromosomeMap);
    linkSetup(svg, configuration, alignmentList, chromosomeMap, genomeLibrary);
}