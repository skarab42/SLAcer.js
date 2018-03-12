// -----------------------------------------------------------------------------
// Variables
// -----------------------------------------------------------------------------
//window.localStorage.clear();
var settings = new SLAcer.Settings({
    file: {
        panel: {
            collapsed: false,
            position : 0
        }
    },
    slicer: {
        layers: {
            height: 100, // μm
            bottom: 3
        },
        light: {
            on : 12000,
            bottom: 60000,
            off: 500,
            strength: 225
        },
        zip: true,
        folder: false,
        wow: true,
        svg: false,
        png: false,
        speed: true,
        speedDelay: 10, // ms
        panel: {
            collapsed: false,
            position : 1
        },
        lifting: {
            speed : 30, // mm/min
            decline: 100, // mm/min
            height: 5,  // mm
        }
    },
    mesh: {
        panel: {
            collapsed: false,
            position : 2
        }
    },
    transform: {
        panel: {
            collapsed: false,
            position : 3
        },
        mirror: false
    },
    buildVolume: {
        size     : { x: 102,  y: 56,  z: 125 }, // mm
        unit     : 'mm',                         // mm or in
        color    : 0xcccccc,
        opacity  : 0.1,
        panel    : {
            collapsed: false,
            position : 4
        }
    },
    resin: {
        density  : 1.1, // g/cm3
        price    : 60,   // $
        panel    : {
            collapsed: false,
            position : 5
        }
    },
    screen: {
        width    : 854,//window.screen.width,
        height   : 480,//window.screen.height,
        diagonal : { size: 4.6, unit: 'in' },
        panel    : {
            collapsed: false,
            position : 6
        }
    },
    colors: {
        mesh : '#eb0984',
        slice: '#88ee11',
        panel: {
            collapsed: false,
            position : 7
        }
    },
    viewer3d: {
        color: 0xffffff
    }
});

// -----------------------------------------------------------------------------
// Error handler
// -----------------------------------------------------------------------------
function errorHandler(error) {
    console.error(error);
}

// -----------------------------------------------------------------------------
// Slicer
// -----------------------------------------------------------------------------
var slicer = new SLAcer.Slicer();
var shapes, slices;

function removeShapes() {
    if (shapes && shapes.length) {
        for (var i = 0, il = shapes.length; i < il; i++) {
            viewer3d.removeObject(shapes[i]);
        }
    }
}

function removeSlices() {
    if (slices && slices.length) {
        for (var i = 0, il = slices.length; i < il; i++) {
            viewer2d.removeObject(slices[i]);
        }
    }

    sliceImage('none');
}

function hexToDec(hex) {
    return parseInt(hex.toString().replace('#', ''), 16);
}

function sliceImage(dataURL) {
    settings.set('slice.dataURL', dataURL || 'none');
}

function getSlice(layerNumber) {
    // remove old shapes
    removeSlices();
    removeShapes();

    // debug
    // console.log("layerNumber", layerNumber)

    // ...
    $slicerLayerValue.html(layerNumber);


    if (layerNumber < 1) {
        viewer2d.render();
        viewer3d.render();
        return;
    }


    if (transformations.update) {
        throw 'transformations not applyed...';
    }

    // get position
    layerHeight = settings.get('slicer.layers.height') / 1000;
    zPosition   = layerNumber * layerHeight;

    // get faces
    var faces = slicer.getFaces(zPosition);

    //console.log('layer number:', layerNumber);
    //console.log('z position  :', zPosition);

    // get new shapes list
    shapes = faces.meshes;
    zPosition -= viewer3d.buildVolume.size.z / 2;

    // slices
    slices = [];
    var slice, shape;
    var sliceColor = hexToDec(settings.get('colors.slice'));

    // add new shapes
    for (var i = 0, il = shapes.length; i < il; i++) {
        shape = shapes[i];
        slice = shape.clone();

        slice.material = slice.material.clone();
        slice.material.color.setHex(0xffffff);
        viewer2d.addObject(slice);
        slices.push(slice);

        shape.material.color.setHex(sliceColor);
        shape.material.depthTest = false;
        shape.position.z = zPosition;
        viewer3d.scene.add(shape);
    }

    // render 3D view
    viewer3d.render();

    // render 2D view
    viewer2d.screenshot(function(dataURL) {
        sliceImage(dataURL);

        if (PNGExport) {
            var fileName = layerNumber + '.png';
            var imgData  = dataURL.substr(dataURL.indexOf(',') + 1);
            if (settings.get('slicer.folder')) {
                zipFolder.file(fileName, imgData, {base64: true});
            }
        }else if (WOWExport) {
            //console.log('layer number:', layerNumber);
            //console.log('z position :', zPosition);

            convertURIToImageData(dataURL).then(function(imageData) {
                // Here you can use imageData
                /*
                 var red = data[i];
                 var green = data[i+1];
                 var blue = data[i+2];
                 var alpha = data[i+3];
                 2 Options:
                 Black red=0, green=0, blue=0, alpha=255;
                 White red=255, green=255, blue=255, alpha=255;
                 */
                var width = settings.get('screen.width');
                var height = settings.get('screen.height');
                var pixel = 0;
                var array = new Uint8Array(width*height/8);
                var data = imageData.data;

                for(var w=0; w<data.length/height*4; w+=4) {
                    for(var h=w; h<width*height*4; h+=(4*width)) {
                        if(data[h]!==0){
                            array[~~(pixel/8)] += Math.pow(2,(pixel%8))
                        }
                        pixel++;
                    }
                }

                if(WOWExport) {// GCode logic
                    wowFile += ";L:" + layerNumber + ";\nM106 S0;\nG1 Z" + settings.get('slicer.lifting.height') +
                        " F" + settings.get('slicer.lifting.speed') +
                        ";\nG1 Z-" + (settings.get('slicer.lifting.height') - settings.get('slicer.layers.height') / 1000) +
                        " F" + settings.get('slicer.lifting.decline') + ";\n{{\n"

                    //var binary_layer = (new TextDecoder("utf-8")).decode(array)
                    wowFile += bin2string(array);
                    //wowFile += array.map(intBytetoHexBin);
                    wowFile += "\n";

                    if (settings.get('slicer.folder')) {
                        // Backup text file
                        zipFolder.file(layerNumber + ".txt", array);
                    }

                    //bottom layer
                    var exposure_time;
                    if(layerNumber<=settings.get('slicer.layers.bottom')){
                        exposure_time = settings.get('slicer.light.bottom');
                    }else{
                        exposure_time = settings.get('slicer.light.on');
                    }
                    wowFile += "}}\nM106 S"+settings.get('slicer.light.strength')+";\nG4 S" + exposure_time / 1000 + ";\n"
                }
            });

        }
    });

    // SVG export
    if (SVGExport) {
        // offset for positive coords
        var xOffset = Math.abs(slicer.mesh.geometry.boundingBox.min.x);
        var yOffset = Math.abs(slicer.mesh.geometry.boundingBox.min.y);

        function SVGPath(actions, dir) {
            var path = [];
            var area = 0;
            var a, b, c, x, y;

            if (dir != 'ccw') {
                dir = 'cw';
            }

            actions.push({ action: 'lineTo', args: actions[0].args });

            for (var i = 0, il = actions.length; i < il; i++) {
                a = actions[i];

                if (i > 0) {
                    b = actions[i - 1];
                    area += a.args[0] * b.args[1];
                    area -= b.args[0] * a.args[1];
                }

                c = a.action == 'moveTo' ? 'M' : 'L';
                x = (a.args[0] + xOffset);
                y = (a.args[1] + yOffset);

                path.push(c + x + ' ' + y);
            }

            if (dir == 'cw' && area < 0 || dir == 'ccw' && area > 0) {
                path = path.reverse();
                path[0] = path[0].replace(/^L/, 'M');
                path[actions.length - 1] = path[actions.length - 1].replace(/^M/, 'L');
            }

            return path.join(' ') + ' Z ';
        }

        // svg start
        var size = slicer.mesh.getSize();
        var svg = '<svg version="1.1" width="' + size.x + '" height="' + size.y + '" baseProfile="full" xmlns="http://www.w3.org/2000/svg">\n';

        // svg background
        svg += '<rect x="0" y="0" width="100%" height="100%" style="fill:black; stroke:none"/>\n';

        // fix coordinate system (rotate 180°)
        svg += '<g transform="translate(0, ' + size.y + ') scale(1, -1)">\n';

        // draw main paths
        var actions;
        for (var i = 0, il = faces.shapes.length; i < il; i++) {
            actions = faces.shapes[i].actions;

            // path start
            svg += '<path d="';

            // main paths
            svg += SVGPath(actions, 'cw');

            // holes paths
            var holes = faces.shapes[i].holes;
            for (var j = 0, jl = holes.length; j < jl; j++) {
                svg += SVGPath(holes[j].actions, 'ccw');
            }

            // path end
            svg += '" style="fill:white; stroke:none" />\n';
        }

        // svg end
        svg += '</g>';
        svg += '</svg>';

        if (settings.get('slicer.folder')) {
            // add svg file to zip
            zipFolder.file(layerNumber + '.svg', svg);
        }
    }

}

function convertURIToImageData(URI) {
    return new Promise(function(resolve, reject) {
        if (URI == null) return reject();
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            image = new Image();
        image.addEventListener('load', function() {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
        }, false);
        image.src = URI;
    });
}

function bin2string(array){
    var result = "";
    for(var i = 0; i < array.length; ++i){
        result+= (String.fromCharCode(array[i]));
        //result+= intBytetoHexBin(array[i]);
    }
    return result;
}
// array.map(intBytetoHexBin);
function intBytetoHexBin(value){
    //var hex_array = ["\x00","\x01","\x02","\x03","\x04","\x05","\x06","\x07","\x08","\x09","\x0A","\x0B","\x0C","\x0D","\x0E","\x0F","\x10","\x11","\x12","\x13","\x14","\x15","\x16","\x17","\x18","\x19","\x1A","\x1B","\x1C","\x1D","\x1E","\x1F","\x20","\x21","\x22","\x23","\x24","\x25","\x26","\x27","\x28","\x29","\x2A","\x2B","\x2C","\x2D","\x2E","\x2F","\x30","\x31","\x32","\x33","\x34","\x35","\x36","\x37","\x38","\x39","\x3A","\x3B","\x3C","\x3D","\x3E","\x3F","\x40","\x41","\x42","\x43","\x44","\x45","\x46","\x47","\x48","\x49","\x4A","\x4B","\x4C","\x4D","\x4E","\x4F","\x50","\x51","\x52","\x53","\x54","\x55","\x56","\x57","\x58","\x59","\x5A","\x5B","\x5C","\x5D","\x5E","\x5F","\x60","\x61","\x62","\x63","\x64","\x65","\x66","\x67","\x68","\x69","\x6A","\x6B","\x6C","\x6D","\x6E","\x6F","\x70","\x71","\x72","\x73","\x74","\x75","\x76","\x77","\x78","\x79","\x7A","\x7B","\x7C","\x7D","\x7E","\x7F","\x80","\x81","\x82","\x83","\x84","\x85","\x86","\x87","\x88","\x89","\x8A","\x8B","\x8C","\x8D","\x8E","\x8F","\x90","\x91","\x92","\x93","\x94","\x95","\x96","\x97","\x98","\x99","\x9A","\x9B","\x9C","\x9D","\x9E","\x9F","\xA0","\xA1","\xA2","\xA3","\xA4","\xA5","\xA6","\xA7","\xA8","\xA9","\xAA","\xAB","\xAC","\xAD","\xAE","\xAF","\xB0","\xB1","\xB2","\xB3","\xB4","\xB5","\xB6","\xB7","\xB8","\xB9","\xBA","\xBB","\xBC","\xBD","\xBE","\xBF","\xC0","\xC1","\xC2","\xC3","\xC4","\xC5","\xC6","\xC7","\xC8","\xC9","\xCA","\xCB","\xCC","\xCD","\xCE","\xCF","\xD0","\xD1","\xD2","\xD3","\xD4","\xD5","\xD6","\xD7","\xD8","\xD9","\xDA","\xDB","\xDC","\xDD","\xDE","\xDF","\xE0","\xE1","\xE2","\xE3","\xE4","\xE5","\xE6","\xE7","\xE8","\xE9","\xEA","\xEB","\xEC","\xED","\xEE","\xEF","\xF0","\xF1","\xF2","\xF3","\xF4","\xF5","\xF6","\xF7","\xF8","\xF9","\xFA","\xFB","\xFC","\xFD","\xFE","\xFF"];
    //return hex_array[value];
    return ["\x00","\x01","\x02","\x03","\x04","\x05","\x06","\x07","\x08","\x09","\x0A","\x0B","\x0C","\x0D","\x0E","\x0F","\x10","\x11","\x12","\x13","\x14","\x15","\x16","\x17","\x18","\x19","\x1A","\x1B","\x1C","\x1D","\x1E","\x1F","\x20","\x21","\x22","\x23","\x24","\x25","\x26","\x27","\x28","\x29","\x2A","\x2B","\x2C","\x2D","\x2E","\x2F","\x30","\x31","\x32","\x33","\x34","\x35","\x36","\x37","\x38","\x39","\x3A","\x3B","\x3C","\x3D","\x3E","\x3F","\x40","\x41","\x42","\x43","\x44","\x45","\x46","\x47","\x48","\x49","\x4A","\x4B","\x4C","\x4D","\x4E","\x4F","\x50","\x51","\x52","\x53","\x54","\x55","\x56","\x57","\x58","\x59","\x5A","\x5B","\x5C","\x5D","\x5E","\x5F","\x60","\x61","\x62","\x63","\x64","\x65","\x66","\x67","\x68","\x69","\x6A","\x6B","\x6C","\x6D","\x6E","\x6F","\x70","\x71","\x72","\x73","\x74","\x75","\x76","\x77","\x78","\x79","\x7A","\x7B","\x7C","\x7D","\x7E","\x7F","\x80","\x81","\x82","\x83","\x84","\x85","\x86","\x87","\x88","\x89","\x8A","\x8B","\x8C","\x8D","\x8E","\x8F","\x90","\x91","\x92","\x93","\x94","\x95","\x96","\x97","\x98","\x99","\x9A","\x9B","\x9C","\x9D","\x9E","\x9F","\xA0","\xA1","\xA2","\xA3","\xA4","\xA5","\xA6","\xA7","\xA8","\xA9","\xAA","\xAB","\xAC","\xAD","\xAE","\xAF","\xB0","\xB1","\xB2","\xB3","\xB4","\xB5","\xB6","\xB7","\xB8","\xB9","\xBA","\xBB","\xBC","\xBD","\xBE","\xBF","\xC0","\xC1","\xC2","\xC3","\xC4","\xC5","\xC6","\xC7","\xC8","\xC9","\xCA","\xCB","\xCC","\xCD","\xCE","\xCF","\xD0","\xD1","\xD2","\xD3","\xD4","\xD5","\xD6","\xD7","\xD8","\xD9","\xDA","\xDB","\xDC","\xDD","\xDE","\xDF","\xE0","\xE1","\xE2","\xE3","\xE4","\xE5","\xE6","\xE7","\xE8","\xE9","\xEA","\xEB","\xEC","\xED","\xEE","\xEF","\xF0","\xF1","\xF2","\xF3","\xF4","\xF5","\xF6","\xF7","\xF8","\xF9","\xFA","\xFB","\xFC","\xFD","\xFE","\xFF"][value];
}

function BinToText(input) {
    return parseInt(input,2).toString(10);
}

function uintToString(buffer) {
    var encodedString = String.fromCharCode.apply(null, buffer),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

function convertHexToString(input) {

    // split input into groups of two
    var hex = input.match(/[\s\S]{2}/g) || [];
    var output = '';

    // build a hex-encoded representation of your string
    for (var i = 0, j = hex.length; i < j; i++) {
        output += '%' + ('0' + hex[i]).slice(-2);
    }

    // decode it using this trick
    output = decodeURIComponent(output);

    return output;
}

function arrayToHEXString(input) {

    var result = "";
    for(var i = 0; i < input.length; ++i){
        result+= "\X"+input[i].toString(16);
    }
    return result;
}

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------
// Main container
var $main = $('#main');

// Viewer 3D
var $viewer3d = $('#viewer3d');
var viewer3d  = new SLAcer.Viewer3D({
    color      : settings.get('viewer3d.color'),
    buildVolume: settings.get('buildVolume'),
    target     : $viewer3d[0]
});

// Triangulation algorithm
//THREE.Triangulation.setTimer(true);
THREE.Triangulation.setLibrary('earcut');
//THREE.Triangulation.setLibrary('libtess');
//THREE.Triangulation.setLibrary('poly2tri');

// Viewer 2D
var viewer2dWin   = null;
var $openViewer2D = $('#open-viewer-2d');

var viewer2d = new SLAcer.Viewer2D({
    target     : null, // off-screen
    color      : 0x000000,
    buildPlate : {
        size   : settings.get('buildVolume.size'),
        unit   : settings.get('buildVolume.unit'),
        color  : 0x000000,
        opacity: 0 // hide build plate
    },
    size: settings.get('screen')
});

$openViewer2D.click(function(e) {
    if (viewer2dWin == null || viewer2dWin.closed) {
        var screen  = settings.get('screen');
        var size    = 'width=' + screen.width + ', height=' + screen.height;
        var opts    = 'menubar=0, toolbar=0, location=0, directories=0, personalbar=0, status=0, resizable=1, dependent=0'

        viewer2dWin = window.open('viewer2d.html', 'SLAcerViewer2D', size + ', ' + opts);

        $(viewer2dWin).on('beforeunload', function(e) {
            viewer2dWin = null;
        })
        .load(function(e) {
            getSlice($sliderInput.slider('getValue'));
        });
    }
    else {
        viewer2dWin.focus();
    }

    return false;
});

// Slider
var $sliderInput = $('#slider input');

$sliderInput.slider({ reversed : true }).on('change', function(e) {
    getSlice(e.value.newValue);
});

var $sliderElement  = $('#slider .slider');
var $sliderMaxValue = $('#slider .max');

function updateSliderUI() {
    var layersHeight = settings.get('slicer.layers.height') / 1000;
    var layersNumber = Math.floor(slicer.mesh.getSize().z / layersHeight);

    // console.log("layersHeight", layersHeight);
    // console.log("layersNumber", layersNumber);

    $sliderInput.slider('setAttribute', 'max', layersNumber);
    $sliderMaxValue.html(layersNumber);
    $slicerLayersValue.html(layersNumber);

    $printTimeValue.html(msToTime(calcPrintTime(layersHeight, layersNumber)));
}
function calcPrintTime(layersHeight, layersNumber){
    // ([object height]/[layer height])([exposure time]+[uplift time]+[downlift time])+3([ground exposure time]-[exposure time])
    var result = 0;
    var uplift_time = settings.get('slicer.lifting.height')/settings.get('slicer.lifting.speed')*60*1000
    var downlift_time = (settings.get('slicer.lifting.height')-layersHeight)/settings.get('slicer.lifting.decline')*60*1000
    result = layersNumber*(parseInt(settings.get('slicer.light.on'))+uplift_time+downlift_time)+
        settings.get('slicer.layers.bottom')*(settings.get('slicer.light.bottom')-settings.get('slicer.light.on'))
    /*
    console.log("slicer.light.on (ms)", settings.get('slicer.light.on'));
    console.log("slicer.layers.bottom)", settings.get('slicer.layers.bottom'));
    console.log("slicer.light.bottom)", settings.get('slicer.light.bottom'));
    console.log("downlift_time (ms)", downlift_time);
    console.log("uplift_time (ms)", uplift_time);
    console.log("tmp 0 (ms)", parseInt(settings.get('slicer.light.on')) + uplift_time );
    console.log("tmp 1 (ms)", layersNumber*(parseInt(settings.get('slicer.light.on'))+uplift_time+downlift_time));
    console.log("tmp 2 (ms)", settings.get('slicer.layers.bottom')*(settings.get('slicer.light.bottom')-settings.get('slicer.light.on')));
    console.log("result (ms)", result);
    */

    return result;
}
function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

// Sidebar
var $sidebar = $('#sidebar');
var $panels  = $sidebar.find('.panel');

$sidebar.sortable({
    axis       : 'y',
    handle     : '.panel-heading',
    cancel     : '.panel-toggle',
    placeholder: 'panel-placeholder', forcePlaceholderSize: true,
    // update panel position
    stop: function(e, ui) {
        $sidebar.find('.panel').each(function(i, element) {
            settings.set(_.camelCase(element.id) + '.panel.position', i);
        });
    }
});

// Sort panels
var panels = [];
var panel;

_.forEach(settings.settings, function(item, namespace) {
    if (item && item.panel) {
        panels[item.panel.position] = $('#' + _.kebabCase(namespace));
    }
});

for (var i in panels) {
    $sidebar.append(panels[i]);
}

// Init panel
function initPanel(name) {
    var id    = _.kebabCase(name);
    var name  = _.camelCase(name);
    var $body = $('#' + id + '-body');

    $body.on('hidden.bs.collapse', function () {
        settings.set(name + '.panel.collapsed', true);
    });

    $body.on('shown.bs.collapse', function () {
        settings.set(name + '.panel.collapsed', false);
    });

    if (settings.get(name + '.panel.collapsed')) {
        $body.collapse('hide');
    }

    return $body;
}

// Unit converter
function parseUnit(value, unit) {
    return parseFloat(unit == 'in' ? (value / 25.4) : (value * 25.4));
}

// File panel
var $fileBody  = initPanel('file');
var $fileInput = $fileBody.find('#file-input');
var loadedFile = null;

$fileInput.on('change', function(e) {
    resetTransformValues();
    loadedFile = e.target.files[0];
    loader.loadFile(loadedFile);
});

// Mesh panel
var $meshBody     = initPanel('mesh');
var $meshFaces    = $meshBody.find('#mesh-faces');
var $meshVolume   = $meshBody.find('#mesh-volume');
var $meshWeight   = $meshBody.find('#mesh-weight');
var $meshCost     = $meshBody.find('#mesh-cost');
var $meshSizeX    = $meshBody.find('#mesh-size-x');
var $meshSizeY    = $meshBody.find('#mesh-size-y');
var $meshSizeZ    = $meshBody.find('#mesh-size-z');
var $meshSizeUnit = $meshBody.find('.mesh-size-unit');

function updateMeshInfoUI() {
    var mesh = slicer.mesh;
    var size = mesh.getSize();
    var unit = settings.get('buildVolume.unit');

    updateSliderUI();

    $meshSizeUnit.html(unit);

    if (unit == 'in') {
        size.x = parseUnit(size.x, 'in');
        size.y = parseUnit(size.y, 'in');
        size.z = parseUnit(size.z, 'in');
    }

    $meshSizeX.html(size.x.toFixed(2));
    $meshSizeY.html(size.y.toFixed(2));
    $meshSizeZ.html(size.z.toFixed(2));

    var volume = parseInt(mesh.getVolume() / 1000);                   // cm3/ml
    var weight = (volume * settings.get('resin.density')).toFixed(2); // g
    var cost   = volume * settings.get('resin.price') / 1000;

    $meshFaces.html(mesh.geometry.faces.length);

    // mirror bugfix
    $meshVolume.html(Math.abs(volume));
    $meshWeight.html(Math.abs(weight));
    $meshCost.html(Math.abs(weight));
}

// Slicer panel
var $slicerBody        = initPanel('slicer');
var $slicerLayerHeight = $slicerBody.find('#slicer-layers-height');
var $slicerLayersValue = $slicerBody.find('#slicer-layers-value');
var $slicerLayerValue  = $slicerBody.find('#slicer-layer-value');
var $slicerLightOff    = $slicerBody.find('#slicer-light-off');
var $slicerLightOn     = $slicerBody.find('#slicer-light-on');

//new
var $slicerLightStrength     = $slicerBody.find('#slicer-light-strength');
var $slicerLightBottum     = $slicerBody.find('#slicer-light-bottom');
var $slicerDeclineSpeed     = $slicerBody.find('#slicer-decline-speed');
var $slicerBottomLayers = settings.get('slicer.layers.bottom');
var $printTimeValue  = $slicerBody.find('#print-time');

var $slicerLiftingSpeed  = $slicerBody.find('#slicer-lifting-speed');
var $slicerLiftingHeight = $slicerBody.find('#slicer-lifting-height');

var $slicerExportPNG = $slicerBody.find('#slicer-image-extension-png');
var $slicerExportSVG = $slicerBody.find('#slicer-image-extension-svg');
var $slicerExportWOW = $slicerBody.find('#slicer-image-extension-wow');

var $slicerSpeedYes    = $slicerBody.find('#slicer-speed-yes');
var $slicerSpeedNo     = $slicerBody.find('#slicer-speed-no');
var $slicerSpeedDelay  = $slicerBody.find('#slicer-speed-delay');
var $slicerMakeZipYes  = $slicerBody.find('#slicer-make-zip-yes');
var $slicerMakeZipNo   = $slicerBody.find('#slicer-make-zip-no');

//new
var $slicerMakeFolderYes  = $slicerBody.find('#slicer-make-folder-yes');
var $slicerMakeFolderNo  = $slicerBody.find('#slicer-make-folder-no');

var $sliceButton       = $sidebar.find('#slice-button');
var $abortButton       = $sidebar.find('#abort-button');
var $zipButton         = $sidebar.find('#zip-button');

function updateSlicerUI() {
    var slicer = settings.get('slicer');

    $slicerSpeedDelay.val(slicer.speedDelay);
    $slicerLayerHeight.val(slicer.layers.height);
    $slicerLightOff.val(slicer.light.off);
    $slicerLightOn.val(slicer.light.on);
    //new
    $slicerLightStrength.val(slicer.light.strength);
    $slicerLightBottum.val(slicer.light.bottom);
    $slicerDeclineSpeed.val(slicer.lifting.decline);
    //$slicerBottomLayers.val(slicer.layers.bottom);

    $slicerLiftingSpeed.val(slicer.lifting.speed);
    $slicerLiftingHeight.val(slicer.lifting.height);
}

function updateSlicerSettings() {
    settings.set('slicer.layers.height', $slicerLayerHeight.val());
    settings.set('slicer.light.off', $slicerLightOff.val());
    settings.set('slicer.light.on', $slicerLightOn.val());

    //new
    settings.set('slicer.light.strength', $slicerLightStrength.val());
    settings.set('slicer.light.bottom', $slicerLightBottum.val());
    settings.set('slicer.lifting.decline', $slicerDeclineSpeed.val());
    //settings.set('slicer.layers.bottom', $slicerBottomLayers.val());

    settings.set('slicer.lifting.speed', $slicerLiftingSpeed.val());
    settings.set('slicer.lifting.height', $slicerLiftingHeight.val());

    settings.set('slicer.png', $slicerExportPNG[0].checked);
    settings.set('slicer.svg', $slicerExportSVG[0].checked);
    settings.set('slicer.wow', $slicerExportWOW[0].checked);

    settings.set('slicer.zip', $slicerMakeZipYes[0].checked);

    //new
    settings.set('slicer.folder', $slicerMakeFolderYes[0].checked);

    settings.set('slicer.speed', $slicerSpeedYes[0].checked);
    settings.set('slicer.speedDelay', $slicerSpeedDelay.val());

    getSlice($sliderInput.slider('getValue'));

    updateSliderUI();
}

var sliceInterval;
var expectedSliceInterval;
var currentSliceNumber;
var slicesNumber;
var zipFile;
var zipFolder;
var wowFile;

var WOWExport;
var SVGExport;
var PNGExport;

var layerHeight;
var zPosition;

var exposureTime;
var liftingSpeed;
var liftingHeight;
var liftingTime;
var estimatedTime;

function slice() {
    currentSliceNumber++;

    if (currentSliceNumber > slicesNumber) {
        return endSlicing();
    }

    // debug
    // console.log("currentSliceNumber", currentSliceNumber)

    getSlice(currentSliceNumber);

    $sliderInput.slider('setValue', currentSliceNumber);

    var time = Date.now();
    var diff = time - expectedSliceInterval;

    !settings.get('slicer.speed') && viewer2dWin && setTimeout(function() {
        sliceImage('none');
    }, settings.get('slicer.light.on'));

    expectedSliceInterval += sliceInterval;
    setTimeout(slice, Math.max(0, sliceInterval - diff));
}

function endSlicing() {

    if(WOWExport) {// GCode & export logic
        wowFile += "M106 S0;\nG1 Z20.0;\nG4 S300;\nM18;"

        zipFile.file("print.wow", wowFile, {binary: true});

        // hotfix for mirror bug
        flipGeometry();
    }

    sliceImage('none');
    $sidebar.find('input, button').prop('disabled', false);
    $sliderInput.slider('enable');
    $abortButton.addClass('hidden');
    $sliceButton.removeClass('hidden');
    $zipButton.prop('disabled', !zipFile);
}

function startSlicing() {
    var times = settings.get('slicer.light');

    if (settings.get('slicer.speed')) {
        sliceInterval = parseInt(settings.get('slicer.speedDelay'));
    }
    else {
        sliceInterval = parseInt(times.on) + parseInt(times.off);
    }

    expectedSliceInterval = Date.now() + sliceInterval;
    slicesNumber          = parseInt($slicerLayersValue.html());
    currentSliceNumber    = 0;

    zipFile   = null;
    zipFolder = null;
    wowFile   = null;
    WOWExport = null;
    SVGExport = null;
    PNGExport = null;

    if (settings.get('slicer.zip')) {
        zipFile   = new JSZip();
        if (settings.get('slicer.folder')) {
            zipFolder = zipFile.folder('slices');
        }
        zipFile.file("README.txt", 'Generated by SLAcer.js for SparkMaker\r\nhttps://n0sr3v.github.io/SLAcer.js/\r\n\r\nProject based on: \r\nhttps://github.com/lautr3k/SLAcer.js\r\nAppreciate this work!\r\n');
        zipFile.file("slacer.json", JSON.stringify({
            imageExtension: settings.get('slicer.png') ? 'png' : settings.get('slicer.svg') ? 'svg' : 'wow',
            imageDirectoryCreated: settings.get('slicer.folder') ? 'false' : 'true',
            imageDirectory: !settings.get('slicer.folder') ? '' : 'slices',
            screenWidth   : settings.get('screen.width'),
            screenHeight  : settings.get('screen.height'),
            screenSize    : settings.get('screen.diagonal.size'),
            screenUnit    : settings.get('screen.diagonal.unit'),
            layersNumber  : slicesNumber,
            layersHeight  : settings.get('slicer.layers.height') / 1000,     // mm
            exposureTime  : parseInt(settings.get('slicer.light.on')),       // ms
            exposureStrength  : parseInt(settings.get('slicer.light.strength')),       // ms
            bottomExposureTime  : parseInt(settings.get('slicer.light.bottom')),       // ms
            liftingSpeed  : parseInt(settings.get('slicer.lifting.speed')),  // mm/min
            declineSpeed  : parseInt(settings.get('slicer.lifting.decline')),  // mm/min
            liftingHeight : parseInt(settings.get('slicer.lifting.height'))  // mm
        }, null, 2));
        WOWExport = settings.get('slicer.wow')
        SVGExport = settings.get('slicer.svg');
        PNGExport = settings.get('slicer.png');
    }

    if(WOWExport){// GCode logic

        // hotfix for first layer bug - before flip geometry!
        $sliderInput.slider('setValue', currentSliceNumber);

        // hotfix for mirror bug
        flipGeometry();

        wowFile = "";

        // Tests
        /*
        var array = new Uint8Array(2);
        array[1]=255;
        console.log(array);
        var textDecoder = new TextDecoder("utf-8");
        var binary_layer = textDecoder.decode(array);
        console.log(binary_layer);
        */
        //console.log(textDecoder.encode(binary_layer));

        wowFile += "G21;\nG91;\nM17;\nM106 S0;\nG28 Z0;\n;W:480;\n;H:854;\n"
    }

    slicesNumber && slice();
}

function waitForZeroLayer(callback){
    if(currentSliceNumber === 0){
        callback();
    }
    else{
        setTimeout(waitForZeroLayer(callback), 250);
    }
}

$zipButton.on('click', function(e) {
    if (zipFile) {
        var name = 'SLAcer';
        if (loadedFile && loadedFile.name) {
            name = loadedFile.name;
        }
        saveAs(zipFile.generate({type: 'blob'}), name + '.zip');
    }
});

$sliceButton.on('click', function(e) {
    $sidebar.find('input, button').prop('disabled', true);
    $('.panel-heading button').prop('disabled', false);
    $openViewer2D.prop('disabled', false);
    $sliderInput.slider('disable');
    $abortButton.prop('disabled', false);
    $abortButton.removeClass('hidden');
    $sliceButton.addClass('hidden');
    startSlicing();
});

$abortButton.on('click', function(e) {
    currentSliceNumber = slicesNumber + 1;
    endSlicing();
});

$('#slicer-image-extension-' + (settings.get('slicer.png') ? 'png' : settings.get('slicer.svg') ? 'svg' : 'wow')).prop('checked', true);
$('#slicer-make-zip-' + (settings.get('slicer.zip') ? 'yes' : 'no')).prop('checked', true);

//new
$('#slicer-make-folder-' + (settings.get('slicer.folder') ? 'yes' : 'no')).prop('checked', true);

$('#slicer-speed-' + (settings.get('slicer.speed') ? 'yes' : 'no')).prop('checked', true);
$('#slicer input').on('input, change', updateSlicerSettings);
updateSlicerUI();

// Build volume panel
var $buildVolumeBody = initPanel('buildVolume');
var $buildVolumeX    = $buildVolumeBody.find('#build-volume-x');
var $buildVolumeY    = $buildVolumeBody.find('#build-volume-y');
var $buildVolumeZ    = $buildVolumeBody.find('#build-volume-z');

function updateBuildVolumeUI() {
    var buildVolume = settings.get('buildVolume');

    $buildVolumeX.val(buildVolume.size.x);
    $buildVolumeY.val(buildVolume.size.y);
    $buildVolumeZ.val(buildVolume.size.z);

    updateBuildVolumeSizeStep();
}

function updateBuildVolumeSizeStep() {
    var step = (settings.get('buildVolume.unit') == 'in') ? 0.01 : 1;

    $buildVolumeX.prop('step', step);
    $buildVolumeY.prop('step', step);
    $buildVolumeZ.prop('step', step);
}

function updateBuildVolumeSettings() {
    var unit = $('#build-volume input[type=radio]:checked').val();

    if (unit != settings.get('buildVolume.unit')) {
        var size = settings.get('buildVolume.size');

        $buildVolumeX.val(parseUnit(size.x, unit));
        $buildVolumeY.val(parseUnit(size.y, unit));
        $buildVolumeZ.val(parseUnit(size.z, unit));
    }

    settings.set('buildVolume', {
        size: {
            x: $buildVolumeX.val(),
            y: $buildVolumeY.val(),
            z: $buildVolumeZ.val()
        },
        unit: unit
    });

    viewer3d.setBuildVolume(settings.get('buildVolume'));
    slicer.mesh && viewer3d.dropObject(slicer.mesh);
    viewer3d.render();

    size && updateMeshInfoUI();

    updateBuildVolumeSizeStep();
    getSlice($sliderInput.slider('getValue'));
}

$('#build-volume-unit-' + settings.get('buildVolume.unit')).prop('checked', true);
$('#build-volume input[type=radio]').on('change', updateBuildVolumeSettings);
$('#build-volume input').on('input', updateBuildVolumeSettings);
updateBuildVolumeUI();

// Resin panel
var $resinBody    = initPanel('resin');
var $resinPrice   = $resinBody.find('#resin-price');
var $resinDensity = $resinBody.find('#resin-density');

function updateResinUI() {
    var resin = settings.get('resin');

    $resinDensity.val(resin.density);
    $resinPrice.val(resin.price);
}

function updateResinSettings() {
    settings.set('resin.price'  , $resinPrice.val());
    settings.set('resin.density', $resinDensity.val());
    updateMeshInfoUI();
}

$('#resin input').on('input', updateResinSettings);
updateResinUI();

// Screen
var $screenBody         = initPanel('screen');
var $screenWidth        = $screenBody.find('#screen-width');
var $screenHeight       = $screenBody.find('#screen-height');
var $screenDiagonalSize = $screenBody.find('#screen-diagonal-size');
var $screenDotPitch     = $screenBody.find('#screen-dot-pitch');

function updateScreenUI() {
    var screen = settings.get('screen');

    $screenWidth.val(screen.width);
    $screenHeight.val(screen.height);
    $screenDiagonalSize.val(screen.diagonal.size);
    $screenDotPitch.html(viewer2d.dotPitch.toFixed(2));

    viewer2d.setScreenResolution(screen);
}

function updateScreenSettings() {
    var unit = $('#screen input[type=radio]:checked').val();

    if (unit != settings.get('screen.diagonal.unit')) {
        $screenDiagonalSize.val(
            parseUnit(settings.get('screen.diagonal.size'), unit)
        );
    }

    settings.set('screen', {
        width   : $screenWidth.val(),
        height  : $screenHeight.val(),
        diagonal: {
            size: $screenDiagonalSize.val(),
            unit: unit
        }
    });

    viewer2d.setScreenResolution(settings.get('screen'));
    $screenDotPitch.html(viewer2d.dotPitch.toFixed(2));

    getSlice($sliderInput.slider('getValue'));
}

$('#screen-diagonal-unit-' + settings.get('screen.diagonal.unit')).prop('checked', true);
$('#screen input[type=radio]').on('change', updateScreenSettings);
$('#screen input').on('input', updateScreenSettings);
updateScreenUI();

// Colors
var $colorsBody = initPanel('colors');
var $meshColor  = $colorsBody.find('#mesh-color');
var $sliceColor = $colorsBody.find('#slice-color');

function updateColorsUI() {
    var colors = settings.get('colors');

    $meshColor.val(colors.mesh);
    $sliceColor.val(colors.slice);
}

updateColorsUI();
$meshColor.colorpicker({ format: 'hex' });
$sliceColor.colorpicker({ format: 'hex' });

$meshColor.colorpicker().on('changeColor.colorpicker', function(e) {
    if (slicer.mesh && slicer.mesh.material) {
        var hexString  = e.color.toHex();
        var hexInteger = hexToDec(hexString);
        settings.set('colors.mesh', hexString);
        slicer.mesh.material.color.setHex(hexInteger);
        viewer3d.render();
    }
});

$sliceColor.colorpicker().on('changeColor.colorpicker', function(e) {
    if (shapes && shapes.length) {
        var hexString  = e.color.toHex();
        var hexInteger = hexToDec(hexString);
        settings.set('colors.slice', hexString);
        for (var i = 0, il = shapes.length; i < il; i++) {
            shapes[i].material.color.setHex(hexInteger);
        }
        viewer3d.render();
    }
});

// Alert
var $alertPanel   = $('#alert');
var $alertMessage = $alertPanel.find('.message');

// Transform
var $transformBody    = initPanel('transform');
var $transformAction  = $transformBody.find('#transform-action');
var $transformUniform = $transformBody.find('#transform-uniform');
var $transformX       = $transformBody.find('#transform-x');
var $transformY       = $transformBody.find('#transform-y');
var $transformZ       = $transformBody.find('#transform-z');
var $transformButtons = $transformBody.find('button');

var $transformMirrorYes = $transformBody.find('#transform-mirror-yes');
var $transformMirrorNo  = $transformBody.find('#transform-mirror-no');

var transformAction, transformations;

function resetTransformValues() {
    transformAction = 'scale';
    transformations = {
        scale    : { x:1, y:1 , z:1 },
        rotate   : { x:0, y:0 , z:0 },
        translate: { x:0, y:0 , z:0 }
    };
    updateTransformAction();
}

function updateTransformAction() {
    transformAction = $transformAction.val();

    var axis = transformations[transformAction];

    var min, max, step;

    if (transformAction == 'scale') {
        min  = 0.01;
        max  = 999;
        step = 0.01;
    }
    else if (transformAction == 'rotate') {
        min  = 0;
        max  = 360;
        step = 1;
    }
    else {
        min  = -9999;
        max  = 9999;
        step = 1;
    }

    $transformUniform.toggleClass('hidden', transformAction != 'scale');
    $transformZ.parent().toggleClass('hidden', transformAction == 'translate');

    $transformX.prop('min', min);
    $transformY.prop('min', min);
    $transformZ.prop('min', min);
    $transformX.prop('max', max);
    $transformY.prop('max', max);
    $transformZ.prop('max', max);
    $transformX.prop('step', step);
    $transformY.prop('step', step);
    $transformZ.prop('step', step);
    $transformX.val(axis.x);
    $transformY.val(axis.y);
    $transformZ.val(axis.z);
}

function updateTransformValues() {
    var current = transformations[transformAction];
    var uniform = $('#transform-uniform input[type=radio]:checked').val() == 'yes';
    var input   = {
        x: parseFloat($transformX.val()),
        y: parseFloat($transformY.val()),
        z: parseFloat($transformZ.val())
    };

    input.x = isNaN(input.x) ? current.x : input.x;
    input.y = isNaN(input.y) ? current.y : input.y;
    input.z = isNaN(input.z) ? current.z : input.z;

    $transformX.val(input.x);
    $transformY.val(input.y);
    $transformZ.val(input.z);

    if (transformAction == 'scale') {
        if (uniform) {
            if (input.x != current.x) {
                var ratio = current.x / input.x;
                input.y = (current.y / ratio).toFixed(2);
                input.z = (current.z / ratio).toFixed(2);
                $transformY.val(input.y);
                $transformZ.val(input.z);
            }
            else if (input.y != current.y) {
                var ratio = current.y / input.y;
                input.x = (current.x / ratio).toFixed(2);
                input.z = (current.z / ratio).toFixed(2);
                $transformX.val(input.x);
                $transformZ.val(input.z);
            }
            else if (input.z != current.z) {
                var ratio = current.z / input.z;
                input.x = (current.x / ratio).toFixed(2);
                input.y = (current.y / ratio).toFixed(2);
                $transformX.val(input.x);
                $transformY.val(input.y);
            }
        }

        input.x <= 0 && (input.x = 1);
        input.y <= 0 && (input.y = 1);
        input.z <= 0 && (input.z = 1);

        slicer.mesh.geometry.scale(
            input.x / current.x,
            input.y / current.y,
            input.z / current.z
        );
    }
    else if (transformAction == 'rotate') {
        var deg     = Math.PI / 180;
        var offsets = {
            x: input.x - current.x,
            y: input.y - current.y,
            z: input.z - current.z
        };

        slicer.mesh.geometry.rotateX(offsets.x * deg);
        slicer.mesh.geometry.rotateY(offsets.y * deg);
        slicer.mesh.geometry.rotateZ(offsets.z * deg);
    }
    else {
        var offsets = {
            x: input.x - current.x,
            y: input.y - current.y
        };

        slicer.mesh.geometry.translate(offsets.x, offsets.y, 0);
    }

    current.x = input.x;
    current.y = input.y;
    current.z = input.z;

    if (transformAction != 'translate') {
        loadGeometry(slicer.mesh.geometry, false);
        // stay at current position
        var current = transformations['translate'];
        slicer.mesh.geometry.translate(current.x, current.y, current.z);
    }

    getSlice($sliderInput.slider('getValue'));
}

$transformButtons.on('click', function(e) {
    var $this   = $(this);
    var axis    = $this.data('axis');
    var action  = $this.data('action');
    var value   = transformations[transformAction][axis];
    var $target = $transformBody.find('#transform-' + axis);

    $target.val(value + (action == '+' ? 1 : -1));
    updateTransformValues();
});

function flipGeometry() {
    settings.set('transform.mirror', $transformMirrorYes[0].checked);
    loadGeometry(slicer.mesh.geometry, true);
    getSlice($sliderInput.slider('getValue'));
}

$transformMirrorYes.on('change', flipGeometry);
$transformMirrorNo.on('change', flipGeometry);

$('#transform-mirror-' + (settings.get('transform.mirror') ? 'yes' : 'no')).prop('checked', true);
$('#transform select').on('change', updateTransformAction);
$('#transform input').on('change', updateTransformValues);
resetTransformValues();

// UI resize
function resizeUI() {
    var width  = $main.width();
    var height = $main.height();
    $sliderElement.height(height - 80);
    viewer3d.setSize({ width : width, height: height });
    viewer3d.render();
}

$(window).resize(resizeUI);
resizeUI();

// -----------------------------------------------------------------------------
// STL loader
// -----------------------------------------------------------------------------
// Loader instance
var loader = new MeshesJS.STLLoader($main[0]); // drop target

// Load an geometry
function loadGeometry(geometry, mirror) {
    try {
        // remove old mesh and plane
        slicer.mesh && viewer3d.removeObject(slicer.mesh);

        // remove old shapes
        removeShapes();

        // flip geometry
        if (mirror) {
            geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
        }

        // load new mesh in slicer
        slicer.loadMesh(new SLAcer.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: hexToDec(settings.get('colors.mesh')), side: THREE.DoubleSide
        })));

        // add new mesh and render view
        viewer3d.addObject(slicer.mesh);
        viewer3d.render();

        // update mesh info
        updateMeshInfoUI();

        // get first slice
        //getSlice(1);
    }
    catch(e) {
        errorHandler(e);
    }
}

// Haaaaaaaaaaaaaaaaaa!!!!
function ultraMegaDirtyFix() {
    $transformBody.find('#transform-x').val(1.1);
    $transformBody.find('#transform-y').val(1.1);
    $transformBody.find('#transform-z').val(1.1);
    updateTransformValues();
    $transformBody.find('#transform-x').val(1);
    $transformBody.find('#transform-y').val(1);
    $transformBody.find('#transform-z').val(1);
    updateTransformValues();
}

// On Geometry loaded
loader.onGeometry = function(geometry) {
    resetTransformValues();
    loadGeometry(geometry, settings.get('transform.mirror'));
    ultraMegaDirtyFix();
};

// On loading error
loader.onError = errorHandler;

// -----------------------------------------------------------------------------
// load example
// -----------------------------------------------------------------------------
// example STL file
//var stl = 'stl/Octocat-v2.stl';
var stl = 'stl/StressTest.stl';
//var stl = 'stl/SLAcer.stl';
//var stl = 'stl/SparkMaker.stl';
//var stl = 'stl/SparkMaker_fixed.stl';


// File url
// var url = 'http://' + window.location.hostname + window.location.pathname + stl;
var url = window.location.href + stl;
// Create http request object
var xmlhttp = new XMLHttpRequest();

// Get the file contents
xmlhttp.open("GET", url);

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if(xmlhttp.status == 200){
            loader.loadString(xmlhttp.responseText);
        }else{
            errorHandler('xmlhttp: ' + xmlhttp.statusText);
        }
    }
}

xmlhttp.send();
