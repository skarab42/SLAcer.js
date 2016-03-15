// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
var layerHeight = 0.1;

var dropTarget = document.getElementById('viewers');

var buildVolume = {
    x: 100, // mm
    y: 100, // mm
    z: 100  // mm
};

var viewerSize = {
    width : 400, // px
    height: 400  // px
};

var settings = {
    viewer1: {
        target: document.getElementById('viewer1'),
        buildVolume: { size: buildVolume },
        size: viewerSize,
        //view: 'front'
    },
    viewer2: {
        target: document.getElementById('viewer2'),
        buildVolume: { size: buildVolume },
        size: viewerSize
    },
    viewer3: {
        target: document.getElementById('viewer3'),
        screen: {
            width   : 600, // px
            height  : 400, // px
            diagonal: 7.99 // in
        },
        buildPlate: { size: buildVolume }
    }
};

var logInfo  = true;
var logError = true;

// -----------------------------------------------------------------------------
// Debug
// -----------------------------------------------------------------------------
function log(type, args) {
    console[type].apply(console, args);
}

function info() {
    logInfo && log('info', Array.prototype.slice.call(arguments));
}

function error() {
    logError && log('error', Array.prototype.slice.call(arguments));
}

// -----------------------------------------------------------------------------
// 3D viewer
// -----------------------------------------------------------------------------
var viewer1 = new SLAcer.Viewer3D(settings.viewer1);
var viewer2 = new SLAcer.Viewer3D(settings.viewer2);
var viewer3 = new SLAcer.Viewer2D(settings.viewer3);

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------
var $meshFacesValue   = document.getElementById('mesh-faces-value');
var $meshVolumeValue  = document.getElementById('mesh-volume-value');
var $zPositionValue   = document.getElementById('z-position-value');
var $zPositionInput   = document.getElementById('z-position-input');
var $layerHeightValue = document.getElementById('layer-height-value');
var $layersValue      = document.getElementById('layers-value');
var $layerValue       = document.getElementById('layer-value');

function updateMeshInfo(mesh) {
    var faces  = mesh.geometry.faces.length;
    var volume = parseInt(mesh.getVolume());

    info('faces:', faces);
    info('volume:', volume);

    $meshFacesValue.innerHTML  = faces;
    $meshVolumeValue.innerHTML = volume;
}

function updateZPosition(position) {
    $zPositionValue.innerHTML = parseFloat(position);
    $layerValue.innerHTML     = Math.round(position / layerHeight) + 1;
}

function resetZPosition(max) {
    updateZPosition(0);
    $zPositionInput.setAttribute('max', max);
    $zPositionInput.setAttribute('step', layerHeight);
    $zPositionInput.value       = '0';
    $layerHeightValue.innerHTML = layerHeight;
    $layersValue.innerHTML      = Math.ceil(slicer.zHeight / layerHeight);
}

function updateScreenInfo() {
    var screen   = viewer3.screen;
    var dotPitch = parseFloat(viewer3.dotPitch).toFixed(3);

    info('screen:', screen);
    info('dotPitch:', dotPitch, 'mm');
}

updateScreenInfo();

// -----------------------------------------------------------------------------
// Polygons functions
// -----------------------------------------------------------------------------
function pointInPolygon(point, polygon) {
    // ray-casting algorithm based on
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var inside = false;

    var il, j, pi, pj, intersect;

    for (i = 0, il = polygon.length, j = il - 1; i < il; j = i++) {
        pi = polygon[i];
        pj = polygon[j];

        (((pi.y > point.y) != (pj.y > point.y))
        && (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x))
        && (inside = !inside);
    }

    return inside;
};

function clipPolygons(polygons) {
    // do not check if
    var clippedPolygons = [];

    var i, il, point, y, yl, polygon;

    for (i = 0, il = polygons.length; i < il; i++) {
        point = polygons[i][0];
        for (y = 0, yl = il; y < yl; y++) {
            if (i == y) continue;
            polygon = polygons[y];
            if (pointInPolygon(point, polygon)) {
                console.log('pointInPolygon:', i, 'in', y);
            }
        }
    }

    return clippedPolygons.length ? clippedPolygons : polygons;
}

function polygonsToShapes(polygons) {
    // clip polygons (make holes)
    if (polygons.length > 1) {
        polygons = clipPolygons(polygons);
    }

    // shapes collection
    var shapes = [];

    // for each polygon, create the shape
    var i, il, points, point, shape, y, yl;

    for (i = 0, il = polygons.length; i < il; i++) {
        points = polygons[i];
        point  = points.shift();
        shape  = new THREE.Shape();

        // move to the first point
        shape.moveTo(point.x, point.y);

        // for each others trace line
        for (y = 0, yl = points.length; y < yl; y++) {
            point = points[y];
            shape.lineTo(point.x, point.y);
        }

        // make and push the mesh
        shapes.push(new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            new THREE.MeshBasicMaterial({
                color: 0xffff00, side: THREE.DoubleSide
            })
        ));
    }

    // return shapes collection
    return shapes;
}

// -----------------------------------------------------------------------------
// Slicer
// -----------------------------------------------------------------------------
var slicer = new SLAcer.Slicer();

var mesh1, mesh2, shapes, plane1, plane2;

function slice(zPosition) {
    // z position
    zPosition = parseFloat(zPosition || 0);
    info('zPosition:', zPosition);
    updateZPosition(zPosition);

    // world position
    var worldPosition  = slicer.zOffset + zPosition;
    plane1.position.z = worldPosition;
    plane2.position.z = worldPosition;

    // get slice
    var slice = slicer.getFaces(zPosition);

    // log info
    info('polygons:', slice.polygons.length);
    info('time:', slice.time, 'ms');

    // remove/add shapes
    if (shapes && shapes.length) {
        for (var i = 0, il = shapes.length; i < il; i++) {
            viewer3.removeObject(shapes[i]);
        }
    }
    shapes = polygonsToShapes(slice.polygons);
    for (var i = 0, il = shapes.length; i < il; i++) {
        viewer3.scene.add(shapes[i]);
    }

    // compute bounding box
    var geometry = slice.geometry;
    geometry.computeBoundingBox();

    // remove/add mesh
    mesh2 && viewer2.removeObject(mesh2);
    mesh2 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({
        wireframe: true
    }));
    viewer2.addObject(mesh2);

    // render
    viewer1.render();
    viewer2.render();
    viewer3.render();
}

$zPositionInput.addEventListener('input', function(e) {
    slice(e.target.value);
}, false);

// -----------------------------------------------------------------------------
// STL loader
// -----------------------------------------------------------------------------
// Loader instance
var loader = new MeshesJS.STLLoader(dropTarget);

// On Geometry loaded
loader.onGeometry = function(geometry) {
    try {
        // remove old mesh and plane
        plane1 && viewer1.removeObject(plane1);
        plane2 && viewer2.removeObject(plane2);
        mesh1  && viewer1.removeObject(mesh1);
        mesh2  && viewer2.removeObject(mesh2);

        // load new mesh in slicer
        slicer.loadMesh(new SLAcer.Mesh(geometry, new THREE.MeshNormalMaterial({
            wireframe: true
        })));

        // shortcuts
        mesh1  = slicer.mesh;
        mesh2  = slicer.slice;
        plane1 = slicer.plane;
        plane2 = plane1.clone();

        // add new mesh and render view
        viewer1.addObject(plane1);
        viewer1.addObject(mesh1);
        viewer1.render();

        // add new slice and render view
        viewer2.addObject(plane2);
        viewer2.addObject(mesh2);
        viewer2.render();

        // init z position
        resetZPosition(slicer.zHeight);

        // update mesh info
        info('mesh:', mesh1);
        updateMeshInfo(mesh1);

        // get first slice
        slice(0);
    }
    catch(e) {
        error(e);
    }
};

// On loading error
loader.onError = error;

// -----------------------------------------------------------------------------
// load example
// -----------------------------------------------------------------------------
var xmlhttp = new XMLHttpRequest();
//var stl = '/stl/Octocat-v2.stl';
var stl = '/stl/StressTest.stl';
xmlhttp.open("GET", window.location + stl);
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if(xmlhttp.status == 200){
            loader.loadString(xmlhttp.responseText);
        }else{
            error('xmlhttp: ' + xmlhttp.statusText);
        }
    }
}
xmlhttp.send();
