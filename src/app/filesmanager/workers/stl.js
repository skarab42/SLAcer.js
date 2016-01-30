// https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/STLLoader.js

function ensureBinary(data) {
    if (typeof data !== 'string') {
        return data;
    }
    var arrayBuffer = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i ++) {
        arrayBuffer[i] = data.charCodeAt(i) & 0xff;
    }
    return arrayBuffer.buffer || arrayBuffer;
}

function isBinarySTL(reader) {
    for (var i = reader.byteLength - 1; i > 0; i--) {
        if (reader.getUint8(i, false) > 127) {
            return true;
        }
    }
    return false;
}

function parseBinary(reader) {
    var progression = {
        total  : reader.getUint32(80, true),
        loaded : 0,
        percent: 0
    };

    var percent = 0;

    postMessage({ action: 'progress', data: progression });

    var dataOffset = 84;
	var faceLength = 12 * 4 + 2;
    var face, start, vertexstart, i, j;

    var faces = [];

    for (i = 0; i < progression.total; i ++) {
        // update progression
        progression.loaded  = i + 1;
        progression.percent = Math.round(progression.loaded / progression.total * 100);

        if (percent !== progression.percent) {
            progression.percent = Math.round(progression.percent);
            postMessage({ action: 'progress', data: progression });
        }

        percent = progression.percent;

        // extract face
        start = dataOffset + i * faceLength;

        face = {
            normals : [
                reader.getFloat32(start, true),
                reader.getFloat32(start + 4, true),
                reader.getFloat32(start + 8, true)
            ],
            vertices: []
        };

        for (j = 1; j <= 3; j ++ ) {
            vertexstart = start + j * 12;
            face.vertices.push([
                reader.getFloat32(vertexstart, true),
                reader.getFloat32(vertexstart + 4, true),
                reader.getFloat32(vertexstart + 8, true)
            ]);
        }

        faces.push(face);
    }

    return faces;
}

function parseASCII(reader) {
    var progression = {
        total  : reader.byteLength,
        loaded : 0,
        percent: 0
    };

    var percent = 0;

    postMessage({ action: 'progress', data: progression });

    var cordPattern = /(normal|vertex)[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/;

    var code  = null;
    var line  = '';
    var args  = [];
    var cords = [];
    var lines = 0;
    var start = 0;

    var face = {
        normals : [],
        vertices: []
    };

    var faceIndex = 0;

    var faces = [];

    for (var i = 0; i < progression.total; i++) {
        // update progression
        progression.loaded  = i + 1;
        progression.percent = Math.round(progression.loaded / progression.total * 100);

        if (percent !== progression.percent) {
            progression.percent = Math.round(progression.percent);
            postMessage({ action: 'progress', data: progression });
        }

        percent = progression.percent;

        // concact chars until new line
        code = reader.getUint8(i);
        if (code !== 10) {
            line += String.fromCharCode(code);
            continue;
        }

        // increment line number
        lines++;

        // trim witespaces
        line = line.trim();

        // skip line shorter than 12 chars (vertex 0 0 0)
        // less expensive than regexp, speed up parsing...
        if (line.length < 12) {
            line = '';
            continue;
        }

        // extract cords
        args = line.match(cordPattern);
        if (args) {
            cords = [parseFloat(args[2]), parseFloat(args[4]), parseFloat(args[6])];
            if (args[1] == 'normal') {
                if (faceIndex) {
                    if (faceIndex < 3) {
                        postMessage({ action: 'error', message: 'notEnoughVertices', data: { line: start } });
                        return false;
                    }
                    if (faceIndex > 3) {
                        postMessage({ action: 'error', message: 'tooMuchVertices', data: { line: start } });
                        return false;
                    }
                }
                face = { normals: cords, vertices: [] };
                faceIndex = 0;
                start = lines;
            } else {
                faceIndex++;
                face.vertices.push(cords);
                if (faceIndex === 3) {
                    faces.push(face);
                }
            }
        }

        // reset line
        line = '';
    }

    return faces;
}

onmessage = function(e) {
    var buffer = ensureBinary(e.data);
    var reader = new DataView(buffer);
    var binary = isBinarySTL(reader);

    postMessage({ action: 'start', data: { binary: binary } });

    try {
        var faces = binary ? parseBinary(reader) : parseASCII(reader);
        if (! faces || ! faces.length) {
            postMessage({ action: 'error', message: 'noFacesFound' });
            faces = null;
        }
    } catch (e) {
        postMessage({ action: 'error', message: 'undefinedError', data: { error: e.message } });
        faces = null;
    }

    postMessage({ action: 'end' });

    if (faces) {
        var progression = {
            total  : faces.length,
            loaded : 0,
            percent: 0
        };

        var percent = 0;

        postMessage({ action: 'loadStart', data: { total: progression.total } });

        // stream all faces
        for (var i = 0; i < progression.total; i++) {

            // update progression
            progression.loaded  = i + 1;
            progression.percent = Math.round(progression.loaded / progression.total * 100);

            if (percent !== progression.percent) {
                progression.percent = Math.round(progression.percent);
                postMessage({ action: 'progress', data: progression });
            }

            percent = progression.percent;

            postMessage({ action: 'load', data: { face: faces[i] } });
        }

        postMessage({ action: 'loadEnd', data: { total: progression.total } });
    }

    close();
};
