/**
* @class   Viewer3d
* @extends JSClass
*/
var Viewer3d = JSClass(
{
    // defaults settings.
    defaults: {
        view: 'default',
        size: {
            width : 800,
            height: 600
        },
        buildVolume: {
            size: {
                x: 200,
                y: 200,
                z: 200
            },
            enabled: true,
            color  : 0xffa500,
            alpha  : 0.1
        },
        camera: {
            fov   : 75,
            aspect: 'auto',
            near  : 1,
            far   : 10000
        },
        renderer: {
            antialias: true,
            color    : 0x111111
        },
        shadowMap: {
            enabled: true,
            type   : THREE.BasicShadowMap
        },
        lights: {
            ambient: {
                enabled: true,
                color  : 0x404040
            },
            directional1: {
                enabled : true,
                color   : 0xffffff,
                alpha   : 0.6,
                position: 'auto' // front/top/left
            },
            directional2: {
                enabled : true,
                color   : 0xffffff,
                alpha   : 0.1,
                position: 'auto' // front/top/right
            }
        },
        floor: {
            enabled: true,
            color  : 0x222222,
            margin : 10
        },
        grid: {
            enabled: true,
            size1  : 10,
            size2  : 100,
            color1 : 0x444444,
            color2 : 0x333333
        },
        axes: {
            enabled: true
        },
        materials: {
            default: {
                material: THREE.MeshLambertMaterial,
                settings: {
                    color: 0x0000ff
                }
            }
        },
        colors: {
            selected: 0xff0000
        }
    },

    // current settings
    settings: {},

    // 3D elements
    elements: {},

    // Built in elements
    builtInElements: [
        'center',
        'ambientLight',
        'directionalLight1',
        'directionalLight2',
        'floor',
        'grid',
        'axes',
        'buildVolume'
    ],

    /**
    * Class constructor.
    *
    * @constructor
    */
    create: function(settings) {
        // merge user and defaults settings
        var settings  = _.defaultsDeep(settings || {}, this.defaults);
        this.settings = settings;

        // auto set aspect
        if (settings.camera.aspect == 'auto') {
            settings.camera.aspect = settings.size.width / settings.size.height;
        }

        // create scene
        this.scene = new THREE.Scene();

        // create camera
        this.camera = new THREE.PerspectiveCamera(
            settings.camera.fov,
            settings.camera.aspect,
            settings.camera.near,
            settings.camera.far
        );

        // set camera orbit around Z axis
        this.camera.up = new THREE.Vector3(0, 0, 1);

        // create renderer
        this.renderer = new THREE.WebGLRenderer(settings.renderer);

        // set renderer size and background color
        this.renderer.setSize(settings.size.width, settings.size.height);
        this.renderer.setClearColor(settings.renderer.color);

        // enable/disable/configure shadow map
        this.renderer.shadowMap = _.assign(
            this.renderer.shadowMap, settings.shadowMap
        );

        // render dom element alias
        this.canvas = this.renderer.domElement;
        this.canvas.addEventListener('contextmenu', function(e) {
            e.stopPropagation();
        });

        // set renderer controls
        var self = this;
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.addEventListener('change', function() {
            self.render();
        });

        // dom events
        this.events = new THREEx.DomEvents(this.camera, this.canvas);

        // set center point
        this.setCenter();

        // add the light's
        settings.lights.ambient.enabled      && this.setAmbientLight();
        settings.lights.directional1.enabled && this.setDirectionalLight(1);
        settings.lights.directional2.enabled && this.setDirectionalLight(2);

        // set others built in elements
        settings.floor.enabled       && this.setFloor();
        settings.grid.enabled        && this.setGrid();
        settings.axes.enabled        && this.setAxes();
        settings.buildVolume.enabled && this.setBuildVolume();

        // set default view
        this.setView(settings.view);

        // set starting z-index (renderOrder for meshs)
        this.zIndex = 10;

        // (re)render
        this.render();
    },

    // -------------------------------------------------------------------------

    /**
    * Get an element from the scene.
    *
    * @method getElement
    * @param  {String} name
    */
    getElement: function(name) {
        return this.elements[name] || null;
    },

    /**
    * Remove an element from the scene.
    *
    * @method removeElement
    * @param  {String} name
    */
    removeElement: function(name) {
        // get element if exist
        var element = this.getElement(name);

        // if set, remove it
        if (element) {
            this.scene.remove(element);
            element.geometry.dispose();
            element.material.dispose();
            element = null;
        }
    },

    /**
    * Add an element to the scene.
    *
    * @method setElement
    * @param  {String}         name
    * @param  {THREE.Object3D} element
    * @param  {Object}         options
    */
    setElement: function(name, element, options) {
        // merge user and defaults options
        var options = _.defaults(options || {}, {
            replace : false,
            position: {},
            rotation: {}
        });

        // if already defined
        if (this.getElement(name)) {
            if (! options.replace) {
                return self.warning('duplicateElementName', [name]);
            }
            this.removeElement(name);
        }

        // set element position and rotation
        element.position = _.assign(element.position, options.position);
        element.rotation = _.assign(element.rotation, options.rotation);

        // set element up to Z
        element.up = THREE.Vector3(0, 0, 1);

        // if not an built in element, enable live edition
        if (this.builtInElements.indexOf(name) === -1) {
            // to do...
        }

        // register and add element to scene
        this.elements[name] = element;
        this.scene.add(element);
    },

    /**
    * Toggle an element visibility.
    *
    * @method toggleElement
    * @param  {String}  name
    * @param  {Boolean} visible
    */
    toggleElement: function(name, visible) {
        // get the element
        var element = this.getElement(name);

        // is an built in element ?
        if (this.builtInElements.indexOf(name) !== -1) {
            var camelName = name.charAt(0).toUpperCase() + name.slice(1);
        }

        // if not found but built in element
        if (! element && camelName && visible !== false) {
            // create the built in element
            this['set' + camelName]();
        }
        else if (element) {
            // toggle visibility on undefined value
            if (visible === undefined) {
                visible = ! element.visible
            }

            // set element visibility
            element.visible = visible;
        }
    },

    // -------------------------------------------------------------------------
    // Built in elements
    // -------------------------------------------------------------------------

    /**
    * Set/update center element.
    *
    * @method setCenter
    * @param  {Integer} x
    * @param  {Integer} y
    * @param  {Integer} z
    */
    setCenter: function(x, y, z) {
        // get center element if exist
        var center = this.getElement('center');

        // if not set
        if (! center) {
            center = new THREE.Object3D();
            this.setElement('center', center);
        }

        // update position
        center.position.set(
            (x !== undefined) ? x : (this.settings.buildVolume.size.x / 2),
            (y !== undefined) ? y : (this.settings.buildVolume.size.y / 2),
            (z !== undefined) ? z : (this.settings.buildVolume.size.z / 2)
        );
    },

    /**
    * Set ambient light.
    *
    * @method setAmbientLight
    */
    setAmbientLight: function() {
        var color = this.settings.lights.ambient.color;
        var light = new THREE.AmbientLight(color);
        this.setElement('ambientLight', light);
    },

    /**
    * Set directional light.
    *
    * @method setAmbientLight
    * @param  {Integer} id
    */
    setDirectionalLight: function(id) {
        // build volume alias
        var bv       = this.settings.buildVolume;
        var settings = this.settings.lights['directional' + id];

        // create the directional light
        var light = new THREE.DirectionalLight(settings.color, settings.alpha);

        // set position
        if (settings.position === 'auto') {
            light.position.set(id ? bv.size.x : 0, 0, bv.size.z / 1.5);
        } else {
            light.position = _.assign(light.position, settings.position)
        }

        // look at center
        light.target = this.getElement('center');

        // enable shadow map
        if (this.settings.shadowMap.enabled) {
            light.castShadow      = true;
            light.shadowMapWidth  = 1024;
            light.shadowMapHeight = 1024;
        }

        // add ligth to elements list/scene
        this.setElement('directionalLight' + id, light);
    },

    /**
    * Set directional light n°1.
    *
    * @method setAmbientLight1
    */
    setDirectionalLight1: function(id) {
        this.setDirectionalLight(1);
    },

    /**
    * Set directional light n°2.
    *
    * @method setAmbientLight2
    */
    setDirectionalLight2: function() {
        this.setDirectionalLight(2);
    },

    /**
    * Set/update the floor.
    *
    * @method setFloor
    */
    setFloor: function() {
        // create element
        var floor = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(
                this.settings.buildVolume.size.x + this.settings.floor.margin,
                this.settings.buildVolume.size.y + this.settings.floor.margin
            ),
            new THREE.MeshLambertMaterial({ color: this.settings.floor.color })
        );

        // set position
        floor.position.x = this.settings.buildVolume.size.x / 2;
        floor.position.y = this.settings.buildVolume.size.y / 2;
        floor.position.z = 0;

        // enable shadow map
        floor.receiveShadow = this.settings.shadowMap.enabled;

        // render order
        floor.renderOrder = 1;

        // add element to scene
        this.setElement('floor', floor);
    },

    /**
    * Set/update the floor.
    *
    * @method setGrid
    */
    setGrid: function() {
        // create element
        var grid = new THREE.GridHelper(
            this.settings.buildVolume.size.x, this.settings.buildVolume.size.y,
            this.settings.grid.size1        , this.settings.grid.size1,
            this.settings.grid.size2        , this.settings.grid.size2,
            this.settings.grid.color1       , this.settings.grid.color2
        );

        // render order
        grid.renderOrder = 2;

        // add element to scene
        this.setElement('grid', grid);
    },

    /**
    * Set/update axes.
    *
    * @method setAxes
    */
    setAxes: function() {
        // create and add element to scene
        var axes = new THREE.AxesHelper(
            this.settings.buildVolume.size.x,
            this.settings.buildVolume.size.y,
            this.settings.buildVolume.size.z
        );

        // render order
        axes.renderOrder = 3;

        // add element to scene
        this.setElement('axes', axes);
    },

    /**
    * Set/update the build volume.
    *
    * @method setBuildVolume
    */
    setBuildVolume: function() {
        // create element
        var buildVolume = new THREE.Mesh(
            new THREE.BoxGeometry(
                this.settings.buildVolume.size.x,
                this.settings.buildVolume.size.y,
                this.settings.buildVolume.size.z
            ),
            new THREE.MeshLambertMaterial({
                transparent: true,
                color      : this.settings.buildVolume.color,
                opacity    : this.settings.buildVolume.alpha
            })
        );

        // set position
        buildVolume.position.x = this.settings.buildVolume.size.x / 2;
        buildVolume.position.y = this.settings.buildVolume.size.y / 2;
        buildVolume.position.z = this.settings.buildVolume.size.z / 2;

        // render order
        buildVolume.renderOrder = 4;

        // add element to scene
        this.setElement('buildVolume', buildVolume);
    },

    // -------------------------------------------------------------------------

    /**
    * Get the minimal distance to show an plan.
    *
    * @method getVisibleDistance
    * @param  {Integer} width
    * @param  {Integer} height
    * @return {Integer}
    */
    getVisibleDistance: function(width, height) {
        var margin = this.settings.floor.margin * 2;
        var size   = height + margin;
        var aspect = width / height;

        // landscape or portrait orientation
        if (this.camera.aspect < aspect) {
            size = (width + margin) / this.camera.aspect;
        }

        return size / 2 / Math.tan(Math.PI * this.camera.fov / 360);
    },

    /**
    * Set the camera look at center of build volume.
    *
    * @method lookAtCenter
    * @param  {Boolean} update
    */
    lookAtCenter: function(update) {
        // set camera target to center of build volume
        this.controls.target  = this.getElement('center').position;
        this.controls.target0 = this.controls.target.clone();

        // update controls if requested
        update && this.controls.update();
    },

    /**
    * Set the view.
    *
    * @method setView
    * @param  {String} view
    */
    setView: function(view) {
        // reset camera position
        this.controls.reset();

        // set new position
        var x = 0;
        var y = 0;
        var z = 0;
        var w, h;

        var size = this.settings.buildVolume.size;

        view = view || 'default';

        if (view == 'default' || view == 'front') {
            x = size.x / 2;
            z = size.z / 2;
            w = size.x;
            h = size.z;
        }
        else if (view == 'right') {
            x = size.x;
            y = size.y / 2;
            z = size.z / 2;
            w = size.y;
            h = size.z;
        }
        else if (view == 'back') {
            x = size.x / 2;
            y = size.y;
            z = size.z / 2;
            w = size.x;
            h = size.z;
        }
        else if (view == 'left') {
            y = size.y / 2;
            z = size.z / 2;
            w = size.y;
            h = size.z;
        }
        else if (view == 'top') {
            x = size.x / 2;
            y = size.y / 2;
            z = size.z;
            w = size.x;
            h = size.y;
        }
        else if (view == 'bottom') {
            x = size.x / 2;
            y = size.y / 2;
            w = size.x;
            h = size.y;
        }

        // ensure the build volume is visible
        var distance = this.getVisibleDistance(w, h);

        if (view == 'default' || view == 'front') {
            y = y - distance;
        }
        else if (view == 'right') {
            x = x + distance;
        }
        else if (view == 'back') {
            y = y + distance;
        }
        else if (view == 'left') {
            x = x - distance;
        }
        else if (view == 'top') {
            z = z + distance;
        }
        else if (view == 'bottom') {
            z = z - distance;
        }

        // set default view
        if (view == 'default') {
            z = z * 2.5;
            x = x * 2.5;
        }

        // set new camera position
        this.camera.position.set(x, y, z);

        // set the camera look at center of build volume
        this.lookAtCenter(true);
    },

    // -------------------------------------------------------------------------

    /**
    * Resize the scene.
    *
    * @method setView
    * @param  {String} view
    */
    resize: function(width, height) {
        // update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // resize the renderer
        this.renderer.setSize(width, height);
    },

    // -------------------------------------------------------------------------

    /**
    * Render the scene.
    *
    * @method render
    */
    render: function() {
        this.renderer.render(this.scene, this.camera);
    },

    // -------------------------------------------------------------------------

    /**
    * Create and return an THREE.BufferGeometry object from faces collection.
    *
    * @method createBufferGeometry
    * @param  {Array} faces
    */
    createBufferGeometry: function(faces) {
        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array(faces.length * 3 * 3);
        var normals  = new Float32Array(faces.length * 3 * 3);
        var triangle = null;
        var vertex   = null;
        var offset   = 0;
        var x, y, z;

        for (var i = 0; i < faces.length; i++) {
            triangle = faces[i];

            x = triangle.normals[0];
            y = triangle.normals[1];
            z = triangle.normals[2];

            for (var j = 0; j  < triangle.vertices.length; j++) {
                vertex = triangle.vertices[j];

                normals[offset]     = x;
                normals[offset + 1] = y;
                normals[offset + 2] = z;

                vertices[offset]     = vertex[0];
                vertices[offset + 1] = vertex[1];
                vertices[offset + 2] = vertex[2];

                offset += 3;
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('normal'  , new THREE.BufferAttribute(normals , 3));

        return geometry;
    },

    /**
    * Return an instance from an registred material.
    *
    * @method getMaterial
    * @param  {String} name
    */
    getMaterial: function(name) {
        var m = this.settings.materials[name || 'default'];
        return new m.material(m.settings);
    },

    /**
    * Create a mesh from an array of faces.
    *
    * @method addMesh
    * @param  {Array} faces
    */
    createMesh: function(faces, material) {
        // create geometry from faces collection
        var geometry = this.createBufferGeometry(faces);

        // compute geometry
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        geometry.center();

        // set bottom of object at Z = 0
        geometry.translate(0, 0, geometry.boundingBox.max.z);

        // create and return the mesh object
        return new THREE.Mesh(geometry, this.getMaterial(material));
    },

    /**
    * Create and add a mesh from an array of faces.
    *
    * @method addMesh
    * @param  {Array} faces
    */
    addMesh: function(faces, material) {
        // self alias
        var self = this;

        // create the mesh object
        var mesh  = self.createMesh(faces, material);
        var color = mesh.material.color.getHex();

        // increment z-index
        mesh.renderOrder = self.zIndex++;

        // add some properties
        mesh.selected = false;

        // events listeners
        self.events.addEventListener(mesh, 'dblclick', function(event) {
            console.log('you clicked on the mesh: ', mesh.uuid);
            mesh.selected = ! mesh.selected; // toggle selection
            mesh.material.color.setHex(
                mesh.selected ? self.settings.colors.selected : color
            );
            mesh.renderOrder = self.zIndex++;
            self.render();
        }, false)

        // set element to center of build plate
        self.setElement(mesh.uuid, mesh, { position: {
            x: self.settings.buildVolume.size.x / 2,
            y: self.settings.buildVolume.size.y / 2
        }});
    }
});
