import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';

export default function(svg, configuration, alignmentList, genomeLibrary, chromosomeMap) {

    configuration = markerSetup(svg, configuration, chromosomeMap);
    let processedAlignmentList = filterAndFlipAlignmentList(configuration, alignmentList);
    linkSetup(svg, configuration, processedAlignmentList, chromosomeMap, genomeLibrary);
}

function filterAndFlipAlignmentList(configuration, alignmentList) {

    let sourceKeyList = configuration.markers.source,
        targetKeyList = configuration.markers.target,
        filteredList = [];

    _.each(alignmentList, (alignment) => {

        let { sourceKey, targetKey } = alignment;

        if (sourceKey && targetKey) {
            // if the alignment is from source to target we return the alignment directly 
            if ((sourceKeyList.indexOf(sourceKey) > -1) && (targetKeyList.indexOf(targetKey) > -1)) {
                filteredList.push(alignment);
            }
            // if the alignment is from target to source we flip the alignment  
            else if ((sourceKeyList.indexOf(targetKey) > -1) && (targetKeyList.indexOf(sourceKey) > -1)) {

                let flippedAlignment = _.clone(alignment);

                flippedAlignment.source = alignment.target;
                flippedAlignment.target = alignment.source;
                flippedAlignment.sourceKey = alignment.targetKey;
                flippedAlignment.targetKey = alignment.sourceKey;
                flippedAlignment.links = _.map(alignment.links, (link) => {
                    return {
                        'source': link.target,
                        'target': link.source,
                        'e_value': link.e_value
                    };
                });
                filteredList.push(flippedAlignment);
            }
        }
    });
    return filteredList;
}