// namespace
var SLAcer = SLAcer || {};

;(function() {

    // global settings
    var globalSettings = {
        view: 'default',
        buildVolume: {
            size: {
                x: 100, // mm
                y: 100, // mm
                z: 100  // mm
            },
            color: 0xff0000,
            opacity: 0.1
        }
    };

    // -------------------------------------------------------------------------

    // Constructor
    function Viewer3D(settings) {
        // self alias
        var self = this;

        SLAcer.Viewer.call(self, settings);
        _.defaultsDeep(self.settings, Viewer3D.globalSettings);

        self.controls = new THREE.OrbitControls(self.camera, self.canvas);
        self.controls.addEventListener('change', function() {
            self.render();
        });
        self.controls.noKeys = true;

        self.light = new THREE.AmbientLight(0x000000);
        self.scene.add(self.light);

        self.setBuildVolume(self.settings.buildVolume);

        self.view = new SLAcer.ViewControls({
            target  : self.buildVolumeObject,
            controls: self.controls,
            camera  : self.camera,
            margin  : 10
        });

        var lights = [];
        lights[0]  = new THREE.PointLight(0xffffff, 1, 0);
        lights[1]  = new THREE.PointLight(0xffffff, 1, 0);
        lights[2]  = new THREE.PointLight(0xffffff, 1, 0);

        lights[0].position.set(0, 2000, 0);
        lights[1].position.set(1000, 2000, 1000);
        lights[2].position.set(-1000, -2000, -1000);

        self.scene.add( lights[0] );
        self.scene.add( lights[1] );
        self.scene.add( lights[2] );

        self.setView(this.settings.view);
        self.render();
    }

    // extends
    Viewer3D.prototype = Object.create(SLAcer.Viewer.prototype);
    Viewer3D.prototype.constructor = Viewer3D;

    // -------------------------------------------------------------------------

    Viewer3D.prototype.addObject = function(object) {
        var size   = object.geometry.boundingBox.size();
        var volume = this.buildVolume.size;

        // is in build volume
        if (size.x > volume.x || size.y > volume.y || size.z > volume.z) {
            throw new RangeError('Object size exceeds the build volume.');
        }

        // drop object on build plate
        object.position.z = -((volume.z - size.z) / 2);

        // call parent method
        SLAcer.Viewer.prototype.addObject.call(this, object);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.setBuildVolume = function(settings) {
        this.buildVolume = _.defaultsDeep(settings, this.buildVolume);

        var size    = this.buildVolume.size;
        var color   = this.buildVolume.color;
        var opacity = this.buildVolume.opacity;

        var geometry = new THREE.CubeGeometry(size.x, size.y, size.z);
        var material = new THREE.MeshBasicMaterial({
            color: color,
            opacity: opacity,
            transparent: true
        });

        var buildVolumeObject = new SLAcer.Mesh(geometry, material);

        this.buildVolumeObject && this.removeObject(this.buildVolumeObject);
        this.buildVolumeObject = buildVolumeObject;
        this.scene.add(this.buildVolumeObject);

        if (! this.buildVolumeBox) {
            this.buildVolumeBox = new THREE.BoxHelper();
            this.buildVolumeBox.material.color.setHex(color);
            this.scene.add(this.buildVolumeBox);
        }

        this.buildVolumeBox.update(this.buildVolumeObject);
    };

    Viewer3D.prototype.setView = function(view) {
        this.view.set(view !== undefined ? view : this.settings.view);
    };

    // -------------------------------------------------------------------------

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    SLAcer.Viewer3D = Viewer3D;

})();
