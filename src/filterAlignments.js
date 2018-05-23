export default function(markers, alignmentList) {

    let sourceKeyList = markers.source,
        targetKeyList = markers.target,
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