(function (window) {
    /**
     * @author mrdoob / http://mrdoob.com/
     * @author skarab / 2015-02-14
     */
    THREE.GridHelper = function(w, h, s1, s2, m1, m2, c1, c2)
    {
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        });

        this.color1 = new THREE.Color(c1 || 0x444444 );
        this.color2 = new THREE.Color(c2 || 0x888888 );

        for (var i = 0; i <= w; i += s1) {
            geometry.vertices.push(
                new THREE.Vector3(i, 0, 0),
                new THREE.Vector3(i, h, 0)
            );
            var color = i%m1 == 0 ? this.color1 : this.color2;
            geometry.colors.push(color, color);
        }

        for (var i = 0; i <= h; i += s2) {
            geometry.vertices.push(
                new THREE.Vector3(0, i, 0),
                new THREE.Vector3(w, i, 0)
            );
            var color = i%m2 == 0 ? this.color1 : this.color2;
            geometry.colors.push(color, color);
        }

        THREE.LineSegments.call(this, geometry, material, THREE.LineSegments);
    };

    THREE.GridHelper.prototype = Object.create(THREE.LineSegments.prototype);
    THREE.GridHelper.prototype.constructor = THREE.GridHelper;

})(this);
