(function (window) {
    /**
     * @author sroucheray / http://sroucheray.org/
     * @author mrdoob / http://mrdoob.com/
     * @author skarab / 2015-02-14
     */
    THREE.AxesHelper = function(x, y, z)
    {
        x = x || 1;
        y = y || 1;
        z = z || 1;

        var vertices = new Float32Array([
            0, 0, 0,  x, 0, 0,
            0, 0, 0,  0, y, 0,
            0, 0, 0,  0, 0, z
        ] );

        var colors = new Float32Array([
            1, 0, 0,  1, 0.6, 0,
            0, 1, 0,  0.6, 1, 0,
            0, 0, 1,  0, 0.6, 1
        ] );

        var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

        THREE.LineSegments.call(this, geometry, material, THREE.LineSegments);
    };

    THREE.AxesHelper.prototype = Object.create(THREE.LineSegments.prototype);
    THREE.AxesHelper.prototype.constructor = THREE.AxesHelper;

})(this);
