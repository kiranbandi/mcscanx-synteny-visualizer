import * as d3 from 'd3';
import _ from 'lodash';
import markerSetup from './markers';
import linkSetup from './links';

export default function(svg, alignmentList, genomeLibrary, chromosomeMap) {

    let width = svg.attr('width');
    // markerPositions and links are populated 
    let linearViewConfig = {
        'width': width,
        'verticalPositions': {
            'source': 100,
            'target': 350
        },
        'markers': {
            'source': [1, 2, 3, 4, 5, 6],
            'target': [11, 12, 13, 14, 15]
        },
        'markerPositions': {},
        'links': []
    };

    linearViewConfig = markerSetup(svg, linearViewConfig, chromosomeMap);
    let processedAlignmentList = filterAndFlipAlignmentList(linearViewConfig, alignmentList);
    linkSetup(svg, linearViewConfig, processedAlignmentList, chromosomeMap, genomeLibrary);
}

function filterAndFlipAlignmentList(linearViewConfig, alignmentList) {

    let sourceKeyList = linearViewConfig.markers.source,
        targetKeyList = linearViewConfig.markers.target,
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