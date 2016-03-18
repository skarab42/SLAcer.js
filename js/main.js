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
    mesh: {
        color: 0x333333,
        panel: {
            collapsed: false,
            position : 1
        }
    },
    slicer: {
        layers: {
            height: 100 // μm
        },
        panel: {
            collapsed: false,
            position : 2
        }
    },
    buildVolume: {
        size     : { x: 100,  y: 100,  z: 100 }, // mm
        unit     : 'mm',                         // mm or in
        color    : 0xcccccc,
        opacity  : 0.1,
        panel    : {
            collapsed: false,
            position : 3
        }
    },
    resin: {
        density  : 1.1, // g/cm3
        price    : 50,   // $
        panel    : {
            collapsed: false,
            position : 4
        }
    },
    screen: {
        width    : 1680,
        height   : 1050,
        diagonal : { size: 22, unit: 'in' },
        panel    : {
            collapsed: false,
            position : 5
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
var shapes;

function removeShapes() {
    if (shapes && shapes.length) {
        for (var i = 0, il = shapes.length; i < il; i++) {
            viewer3d.removeObject(shapes[i]);
        }
    }
}

function slice(layerNumber) {
    // remove old shapes
    removeShapes();

    if (layerNumber < 1) {
        viewer3d.render();
        return;
    }

    // get slice
    var layerHeight = settings.get('slicer.layers.height') / 1000;
    var zPosition   = layerNumber * layerHeight;
    var slice       = slicer.getFaces(zPosition);

    //console.log('layer number:', layerNumber);
    //console.log('z position  :', zPosition);

    // get new shapes list
    shapes = slice.shapes;
    zPosition -= viewer3d.buildVolume.size.z / 2;

    // add new shapes
    for (var i = 0, il = shapes.length; i < il; i++) {
        shapes[i].position.z = zPosition;
        shapes[i].material.depthTest = false;
        viewer3d.scene.add(shapes[i]);
    }

    // render
    viewer3d.render();
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

// Slider
var $sliderInput = $('#slider input');

$sliderInput.slider({ reversed : true }).on('change', function(e) {
    slice(e.value.newValue);
});

var $sliderElement = $('#slider .slider');
var $sliderMinValue = $('#slider .min');
var $sliderMaxValue = $('#slider .max');


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
var $fileBody = initPanel('file');

// Mesh panel
var $meshBody     = initPanel('mesh');
var $meshFaces    = $meshBody.find('#mesh-faces');
var $meshVolume   = $meshBody.find('#mesh-volume');
var $meshWeight   = $meshBody.find('#mesh-weight');
var $meshSizeX    = $meshBody.find('#mesh-size-x');
var $meshSizeY    = $meshBody.find('#mesh-size-y');
var $meshSizeZ    = $meshBody.find('#mesh-size-z');
var $meshSizeUnit = $meshBody.find('.mesh-size-unit');

function updateMeshInfoUI(mesh) {
    var size         = mesh.getSize();
    var unit         = settings.get('buildVolume.unit');
    var layersHeight = settings.get('slicer.layers.height') / 1000;
    var layersNumber = Math.ceil(size.z / layersHeight);

    $sliderInput.slider('setAttribute', 'max', layersNumber);
    $sliderMaxValue.html(layersNumber);

    $meshSizeUnit.html(unit);

    if (unit == 'in') {
        size.x = parseUnit(size.x, 'in');
        size.y = parseUnit(size.y, 'in');
        size.z = parseUnit(size.z, 'in');
    }

    $meshSizeX.html(size.x.toFixed(2));
    $meshSizeY.html(size.y.toFixed(2));
    $meshSizeZ.html(size.z.toFixed(2));

    $meshFaces.html(mesh.geometry.faces.length);
    $meshVolume.html(parseInt(mesh.getVolume() / 1000)); // cm3/ml
    $meshWeight.html(0);
}

// Slicer panel
var $slicerBody = initPanel('slicer');

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

    removeShapes();

    viewer3d.setBuildVolume(settings.get('buildVolume'));
    viewer3d.dropObject(slicer.mesh);
    viewer3d.render();

    if (size) {
        updateMeshInfoUI(slicer.mesh);
    }
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
}

$('#resin input').on('input', updateResinSettings);
updateResinUI();

// Screen
var $screenBody         = initPanel('screen');
var $screenWidth        = $screenBody.find('#screen-width');
var $screenHeight       = $screenBody.find('#screen-height');
var $screenDiagonalSize = $screenBody.find('#screen-diagonal-size');

function updateScreenUI() {
    var screen = settings.get('screen');

    $screenWidth.val(screen.width);
    $screenHeight.val(screen.height);
    $screenDiagonalSize.val(screen.diagonal.size);
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
}

$('#screen-diagonal-unit-' + settings.get('screen.diagonal.unit')).prop('checked', true);
$('#screen input[type=radio]').on('change', updateScreenSettings);
$('#screen input').on('input', updateScreenSettings);
updateScreenUI();

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

// On Geometry loaded
loader.onGeometry = function(geometry) {
    try {
        // remove old mesh and plane
        slicer.mesh && viewer3d.removeObject(slicer.mesh);

        // remove old shapes
        removeShapes();

        // load new mesh in slicer
        slicer.loadMesh(new SLAcer.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: settings.get('mesh.color')
        })));

        // add new mesh and render view
        viewer3d.addObject(slicer.mesh);
        viewer3d.render();

        // update mesh info
        updateMeshInfoUI(slicer.mesh);

        // get first slice
        //slice(1);
    }
    catch(e) {
        errorHandler(e);
    }
};

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
