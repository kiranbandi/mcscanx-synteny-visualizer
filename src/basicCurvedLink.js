            function link(d) {
                // stroke width takes half the width so we draw a line and depending on the width needed offset the x position 
                // so that x is reduced by half of the intended width :-)
                // big changes here obviously, more comments to follow
                var x0 = d.source.x,
                    x1 = d.target.x,
                    y0 = d.source.y,
                    y1 = d.target.y,
                    yi = d3.interpolateNumber(y0, y1),
                    y2 = yi(0.65),
                    y3 = yi(1 - 0.65);

                // ToDo - nice to have - allow flow up or down! Plenty of use cases for starting at the bottom,
                // but main one is trickle down (economics, budgets etc), not up

                return "M" + x0 + "," + y0 // start (of SVG path)
                    +
                    "C" + x0 + "," + y2 // CP1 (curve control point)
                    +
                    " " + x1 + "," + y3 // CP2
                    +
                    " " + x1 + "," + y1; // end
            }