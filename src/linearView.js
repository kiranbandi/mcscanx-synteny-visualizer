import * as d3 from 'd3';
import _ from 'lodash';
import infoVisualization from './infoVisualization';
import markerSetup from './markers';

export default function(syntenyInformation, alignmentList, genomeLibrary, chromosomeMap) {

    let linearViewMainContainer = d3.select("#root")
        .append('div')
        .attr('class', 'linearViewMainContainer'),

        headContainer = linearViewMainContainer.append('div')
        .attr('class', 'headContainer row'),

        filterContainer = headContainer.append('div')
        .attr('class', 'subContainer filterContainer col s12'),

        width = linearViewMainContainer.node().clientWidth,

        linearViewVis = linearViewMainContainer.append('svg')
        .attr('class', 'linearViewVis')
        .attr('height', width)
        .attr('width', width)

    infoVisualization(headContainer, syntenyInformation);

    // markerPositions and links are populated 
    let linearViewConfig = {
        'width': width,
        'verticalPositions': {
            'source': 100,
            'target': 350
        },
        'markers': {
            'source': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            'target': [11, 12, 13, 14, 15, 16, 17, 18, 19]
        },
        'markerPositions': {},
        'links': []
    };

    linearViewConfig = markerSetup(linearViewConfig, chromosomeMap, linearViewVis);

    let processedAlignmentList = filterAndFlipAlignmentList(linearViewConfig, alignmentList);
    let abc = [];

    let links = _.map(processedAlignmentList, (alignment) => {

        let firstLink = alignment.links[0];
        let lastLink = alignment.links[alignment.links.length - 1];

        let sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source];
        let targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target];

        _.each([0, 1], (value) => {
            sourceGenes[value] = genomeLibrary.get(sourceGenes[value]).start;
            targetGenes[value] = genomeLibrary.get(targetGenes[value]).start;
        })

        let sourceChromosome = chromosomeMap.get(alignment.sourceKey);
        let targetChromosome = chromosomeMap.get(alignment.targetKey);

        let sourceMarker = _.find(linearViewConfig.markerPositions.source, (o) => o.key == alignment.sourceKey);
        let targetMarker = _.find(linearViewConfig.markerPositions.target, (o) => o.key == alignment.targetKey);

        let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx / 2);
        let targetGeneWidth = ((targetGenes[1] - targetGenes[0]) / (targetChromosome.width)) * (targetMarker.dx / 2);
        let sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx);
        let targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx);
        // pick the one with the smaller width and ensure the minimum is 2px
        let linkWidth = Math.max(Math.min(sourceGeneWidth, targetGeneWidth), 2);

        return {
            source: {
                'x': sourceMarker.x + sourceX + linkWidth,
                'y': linearViewConfig.verticalPositions.source
            },
            target: {
                'x': targetMarker.x + targetX + linkWidth,
                'y': linearViewConfig.verticalPositions.target
            },
            key: alignment.sourceKey,
            width: linkWidth
        }
    })

    function link(d) {

        // big changes here obviously, more comments to follow
        var x0 = d.source.x,
            x1 = d.target.x,
            y0 = d.source.y,
            y1 = d.target.y,
            yi = d3.interpolateNumber(y0, y1),
            y2 = yi(0.65),
            y3 = yi(1 - 0.65);

        return "M" + x0 + "," + y0 // start (of SVG path)
            +
            "C" + x0 + "," + y2 // CP1 (curve control point)
            +
            " " + x1 + "," + y3 // CP2
            +
            " " + x1 + "," + y1; // end
    }

    // stroke width takes half the width so we draw a line and depending on the width needed offset the x position 
    // so that x is reduced by half of the intended width :-)

    linearViewVis.append("g")
        .selectAll('.link')
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            return link(d);
        })
        .style("stroke-width", function(d) {
            return d.width;
        })
        .style('stroke', (d, i) => {
            let sourceIndex = linearViewConfig.markers.source.indexOf(d.key);
            return ((sourceIndex == -1) || sourceIndex > 9) ? 'black' : d3.schemeCategory10[sourceIndex];
        });
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