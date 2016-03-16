// -----------------------------------------------------------------------------
// Variables
// -----------------------------------------------------------------------------
var meshMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000
});

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------
var $main     = $('#main');
var $viewer3d = $('#viewer3d');

// -----------------------------------------------------------------------------
// Error handler
// -----------------------------------------------------------------------------
function errorHandler(error) {
    console.error(error);
}

// -----------------------------------------------------------------------------
// 3D viewer
// -----------------------------------------------------------------------------
// 3D viewer instance
var viewer3d = new SLAcer.Viewer3D({ target: $viewer3d[0] });

// Full screen
$(window).resize(function(e) {
    viewer3d.setSize({
        width : $main.width(),
        height: $main.height()
    });
    viewer3d.render();
});
$(window).resize();

// -----------------------------------------------------------------------------
// Slicer
// -----------------------------------------------------------------------------
var slicer = new SLAcer.Slicer();

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

        // load new mesh in slicer
        slicer.loadMesh(new SLAcer.Mesh(geometry, meshMaterial));

        // add new mesh and render view
        viewer3d.addObject(slicer.mesh);
        viewer3d.render();

        // update mesh info
        //updateMeshInfo(mesh1);

        // get first slice
        //slice(0);
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
var xmlhttp = new XMLHttpRequest();
var stl = '/stl/Octocat-v2.stl';
//var stl = '/stl/StressTest.stl';
xmlhttp.open("GET", window.location + stl);
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
