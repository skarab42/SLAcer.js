// namespace
var SLAcer = SLAcer || {};

;(function() {

    function Point(p) {
        this.x = p.x;
        this.y = p.y;
        this.s = p.x + ':' + p.y;
    }

    function Line(p1, p2) {
        this.p1 = new Point(p1);
        this.p2 = new Point(p2);
    }

    function linesToPolygons(lines) {
        var polygons = [];
        var polygon  = [];

        var firstLine, lastPoint, i, line;

        function getNextPoint() {
            var found = false;
            for (i = 0; i < lines.length; i++) {
                line = lines[i];
                if (lastPoint.s == line.p1.s) {
                    lines.splice(i, 1);
                    if (firstLine.p1.s == line.p2.s) {
                        //console.log('closed loop');
                        break;
                    }
                    polygon.push(line.p2);
                    lastPoint = line.p2;
                    found = true;
                }
                else if (lastPoint.s == line.p2.s) {
                    lines.splice(i, 1);
                    if (firstLine.p1.s == line.p1.s) {
                        //console.log('closed loop');
                        break;
                    }
                    polygon.push(line.p1);
                    lastPoint = line.p1;
                    found = true;
                }
            }
            return found;
        }

        while (lines.length) {
            firstLine = lines.shift();
            lastPoint = firstLine.p2;

            polygon.push(firstLine.p1);
            polygon.push(firstLine.p2);

            while (getNextPoint()) {}

            polygons.push(polygon);
            polygon = [];
        }

        return polygons;
    }

    // -------------------------------------------------------------------------

    // Constructor
    function Slicer() {
        // faces collection
        this.faces = [];

        // position
        this.zHeight = 0;
        this.zOffset = 0;

        // plane
        this.mesh  = null;
        this.plane = null;
        this.slice = null;
    }

    // -------------------------------------------------------------------------

    Slicer.prototype.loadMesh = function(mesh) {
        // mesh
        this.mesh = mesh;

        // slice
        this.slice = mesh.clone();

        // bounding box
        var box = mesh.geometry.boundingBox.clone();

        // mesh size
        var size = box.size();

        // z height
        this.zHeight = size.z;
        this.zOffset = box.min.z;

        // min/max faces (z)
        this.facesMinMax = [];
        var i, length, face, v1, v2, v3;
        var geometry = this.slice.geometry;
        for (i = 0, length = geometry.faces.length; i < length; i++) {
            face = geometry.faces[i];
            v1 = geometry.vertices[face.a];
            v2 = geometry.vertices[face.b];
            v3 = geometry.vertices[face.c];
            this.facesMinMax.push({
                min: Math.min(v1.z, v2.z, v3.z),
                max: Math.max(v1.z, v2.z, v3.z)
            });
        }

        // plane
        this.plane = new SLAcer.Mesh(
            new THREE.PlaneGeometry(size.x, size.y, 1),
            new THREE.MeshBasicMaterial({
                color: 0xffff00, side: THREE.DoubleSide
            })
        );
    };

    Slicer.prototype.getFaces = function(zPosition) {
        var time = Date.now();

        zPosition += this.zOffset;

        var source = this.slice.geometry;
        var target = new THREE.Geometry();
        var plane  = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zPosition);

        var i, length, minMax, face, vertices, v1, v2, v3, index, normal;

        var lines = [];
        var line, top, bot;

        function addLine(p1, p2) {
            lines.push(new Line(p1, p2));
        }

        for (i = 0, length = source.faces.length; i < length; i++) {
            minMax = this.facesMinMax[i];

            if (minMax.min <= zPosition && minMax.max >= zPosition) {
                face     = source.faces[i];
                vertices = source.vertices;

                v1 = vertices[face.a].clone();
                v2 = vertices[face.b].clone();
                v3 = vertices[face.c].clone();

                target.vertices.push(v1, v2, v3);

                index  = target.vertices.length;
                normal = face.normal.clone();

                target.faces.push(new THREE.Face3(
                    index-3, index-2, index-1, normal
                ));

                // slice...

                t1 = v1.z == zPosition;
                t2 = v2.z == zPosition;
                t3 = v3.z == zPosition;

                touch = 0;

                t1 && touch++;
                t2 && touch++;
                t3 && touch++;

                // all points on plane
                if (touch == 3) {
                    // skip since is shared with two points case
                    continue;
                }

                // two points on plane
                if (touch == 2) {
                    if (t1 && t2 && !t3) addLine(v1, v2);
                    else if (!t1 && t2 && t3) addLine(v2, v3);
                    else addLine(v3, v1);
                    continue;
                }

                // one point on plane
                if (touch == 1) {
                    // skip since is shared with two points case
                    continue;
                }

                // no points on plane (need intersection)
                if (touch == 0) {
                    top = [];
                    bot = [];

                    v1.z > zPosition && top.push(v1) || bot.push(v1);
                    v2.z > zPosition && top.push(v2) || bot.push(v2);
                    v3.z > zPosition && top.push(v3) || bot.push(v3);

                    if (top.length == 1) {
                        addLine(
                            plane.intersectLine(new THREE.Line3(top[0], bot[0])),
                            plane.intersectLine(new THREE.Line3(top[0], bot[1]))
                        );
                    }
                    else {
                        addLine(
                            plane.intersectLine(new THREE.Line3(top[0], bot[0])),
                            plane.intersectLine(new THREE.Line3(top[1], bot[0]))
                        );
                    }
                }
            }
        }

        return {
            geometry: target,
            polygons: linesToPolygons(lines),
            time    : Date.now() - time
        };
    };

    // -------------------------------------------------------------------------

    // export module
    SLAcer.Slicer = Slicer;

})();
