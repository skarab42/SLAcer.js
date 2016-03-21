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
            height: 100 // μm
        },
        light: {
            on : 1000,
            off: 500
        },
        zip: true,
        speed: false,
        speedDelay: 10, // ms
        panel: {
            collapsed: false,
            position : 1
        }
    },
    mesh: {
        color: 0x333333,
        panel: {
            collapsed: false,
            position : 2
        }
    },
    transform: {
        panel: {
            collapsed: false,
            position : 3
        }
    },
    buildVolume: {
        size     : { x: 100,  y: 100,  z: 100 }, // mm
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
        price    : 50,   // $
        panel    : {
            collapsed: false,
            position : 5
        }
    },
    screen: {
        width    : window.screen.width,
        height   : window.screen.height,
        diagonal : { size: 22, unit: 'in' },
        panel    : {
            collapsed: false,
            position : 6
        }
    },
    colors: {
        mesh : '#555555',
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

    viewer2dWin && (viewer2dWin.document.body.style.backgroundImage = 'none');
}

function hexToDec(hex) {
    return parseInt(hex.toString().replace('#', ''), 16);
}

function getSlice(layerNumber) {
    // remove old shapes
    removeSlices();
    removeShapes();

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

    // get faces
    var layerHeight = settings.get('slicer.layers.height') / 1000;
    var zPosition   = layerNumber * layerHeight;
    var faces       = slicer.getFaces(zPosition);

    //console.log('layer number:', layerNumber);
    //console.log('z position  :', zPosition);

    // get new shapes list
    shapes = faces.shapes;
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
    if (zipFolder || viewer2dWin) {
        viewer2d.screenshot(function(dataURL) {
            if (viewer2dWin) {
                viewer2dWin.document.body.style.backgroundImage = 'url(' + dataURL + ')';
            }
            if (zipFolder) {
                var fileName = layerNumber + '.png';
                var imgData  = dataURL.substr(dataURL.indexOf(',') + 1);
                zipFolder.file(fileName, imgData, { base64: true });
            }
        });
    }
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
    if (! viewer2dWin) {
        var screen  = settings.get('screen');
        var size    = 'width=' + screen.width + ', height=' + screen.height;
        var opts    = 'menubar=0, toolbar=0, location=0, directories=0, personalbar=0, status=0, resizable=1, dependent=0'
        viewer2dWin = window.open('viewer2d.html', 'SLAcer.viewer2d', size + ', ' + opts);

        $(viewer2dWin).on('beforeunload', function(e) {
            viewer2dWin = null;
        })
        .load(function(e) {
            getSlice($sliderInput.slider('getValue'));
        });
    }

    viewer2dWin.focus();
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

    $sliderInput.slider('setAttribute', 'max', layersNumber);
    $sliderMaxValue.html(layersNumber);
    $slicerLayersValue.html(layersNumber);
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

$fileInput.on('change', function(e) {
    loader.loadFile(e.target.files[0]);
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
    $meshVolume.html(volume);
    $meshWeight.html(weight);
    $meshCost.html(cost);
}

// Slicer panel
var $slicerBody        = initPanel('slicer');
var $slicerLayerHeight = $slicerBody.find('#slicer-layers-height');
var $slicerLayersValue = $slicerBody.find('#slicer-layers-value');
var $slicerLayerValue  = $slicerBody.find('#slicer-layer-value');
var $slicerLightOff    = $slicerBody.find('#slicer-light-off');
var $slicerLightOn     = $slicerBody.find('#slicer-light-on');
var $slicerSpeedYes    = $slicerBody.find('#slicer-speed-yes');
var $slicerSpeedNo     = $slicerBody.find('#slicer-speed-no');
var $slicerSpeedDelay  = $slicerBody.find('#slicer-speed-delay');
var $slicerMakeZipYes  = $slicerBody.find('#slicer-make-zip-yes');
var $slicerMakeZipNo   = $slicerBody.find('#slicer-make-zip-no');
var $sliceButton       = $sidebar.find('#slice-button');
var $abortButton       = $sidebar.find('#abort-button');
var $zipButton         = $sidebar.find('#zip-button');

function updateSlicerUI() {
    var slicer = settings.get('slicer');
    $slicerSpeedDelay.val(slicer.speedDelay);
    $slicerLayerHeight.val(slicer.layers.height);
    $slicerLightOff.val(slicer.light.off);
    $slicerLightOn.val(slicer.light.on);
}

function updateSlicerSettings() {
    settings.set('slicer.layers.height', $slicerLayerHeight.val());
    settings.set('slicer.light.off', $slicerLightOff.val());
    settings.set('slicer.light.on', $slicerLightOn.val());

    settings.set('slicer.zip', $slicerMakeZipYes[0].checked);
    settings.set('slicer.speed', $slicerSpeedYes[0].checked);
    settings.set('slicer.speedDelay', $slicerSpeedDelay.val());

    updateSliderUI();
}

var sliceInterval;
var expectedSliceInterval;
var currentSliceNumber;
var slicesNumber;
var zipFile;
var zipFolder;

function slice() {
    currentSliceNumber++;

    if (currentSliceNumber > slicesNumber) {
        return endSlicing();
    }

    getSlice(currentSliceNumber);
    $sliderInput.slider('setValue', currentSliceNumber);

    var time = Date.now();
    var diff = time - expectedSliceInterval;

    !settings.get('slicer.speed') && viewer2dWin && setTimeout(function() {
        viewer2dWin && (viewer2dWin.document.body.style.backgroundImage = 'none');
    }, settings.get('slicer.light.on'));

    expectedSliceInterval += sliceInterval;
    setTimeout(slice, Math.max(0, sliceInterval - diff));
}

function endSlicing() {
    viewer2dWin && (viewer2dWin.document.body.style.backgroundImage = 'none');
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

    if (settings.get('slicer.zip')) {
        zipFile   = new JSZip();
        zipFolder = zipFile.folder('slices');
        zipFile.file("README.txt", 'Generated by SLAcer.js\r\nhttp://lautr3k.github.io/SLAcer.js/\r\n');
    }

    slicesNumber && slice();
}

$zipButton.on('click', function(e) {
    if (zipFile) {
        saveAs(zipFile.generate({type: 'blob'}), 'SLAcer.zip');
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

$('#slicer-make-zip-' + (settings.get('slicer.zip') ? 'yes' : 'no')).prop('checked', true);
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
    viewer3d.dropObject(slicer.mesh);
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
var $transformX       = $transformBody.find('#transform-x');
var $transformY       = $transformBody.find('#transform-y');
var $transformZ       = $transformBody.find('#transform-z');
var $transformButtons = $transformBody.find('button');

var transformAction = 'scale';
var transformations = {
    scale : { x:1, y:1 , z:1 },
    rotate: { x:0, y:0 , z:0 }
};

function updateTransformAction() {
    transformAction = $transformAction.val();

    var axis = transformations[transformAction];
    var min, max, step;

    if (transformAction == 'scale') {
        min  = 0.01;
        max  = 999;
        step = 0.01;
    }
    else {
        min  = 0;
        max  = 360;
        step = 1;
    }

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
    var input = {
        x: parseFloat($transformX.val()),
        y: parseFloat($transformY.val()),
        z: parseFloat($transformZ.val())
    };

    var current = transformations[transformAction];

    if (transformAction == 'scale') {
        input.x <= 0 && (input.x = 1);
        input.y <= 0 && (input.y = 1);
        input.z <= 0 && (input.z = 1);

        slicer.mesh.geometry.scale(
            input.x / current.x,
            input.y / current.y,
            input.z / current.z
        );
    }
    else {
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

    current.x = input.x;
    current.y = input.y;
    current.z = input.z;

    //var currentLayer = settings.get('');
    loadGeometry(slicer.mesh.geometry);
    getSlice($sliderInput.slider('getValue'));
    //viewer3d.render();
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

$('#transform select').on('change', updateTransformAction);
$('#transform input').on('input', updateTransformValues);
updateTransformAction();

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
function loadGeometry(geometry) {
    try {
        // remove old mesh and plane
        slicer.mesh && viewer3d.removeObject(slicer.mesh);

        // remove old shapes
        removeShapes();

        // load new mesh in slicer
        slicer.loadMesh(new SLAcer.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: hexToDec(settings.get('colors.mesh'))
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

// On Geometry loaded
loader.onGeometry = loadGeometry;

// On loading error
loader.onError = errorHandler;

// -----------------------------------------------------------------------------
// load example
// -----------------------------------------------------------------------------
// example STL file
//var stl = 'stl/Octocat-v2.stl';
var stl = 'stl/StressTest.stl';

// File url
var url = 'http://' + window.location.hostname + window.location.pathname + stl;

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
