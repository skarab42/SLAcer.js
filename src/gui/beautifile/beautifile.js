/*
 * bootstrap/filebutton.js - v1.0.0
 * Copyright (c) 2016 Sébastien Mischler (skarab)
 * Licensed under the MIT license.
 */
 +function ($) {
    'use strict';

    // FILEBUTTON CLASS DEFINITION
    // ===========================

    var BeautiFile = function (element, options) {

        var self     = this;
        var $element = $(element); // input or button
        var tagName  = $element.prop('tagName');
        var type     = options.type.trim();
        var icon     = options.icon.trim();
        var label    = options.label.trim();
        var input    = options.input.trim();
        var text     = options.text.trim();
        var multiple = options.multiple;

        this.options = options;

        this.$icon  = $('<i>').addClass('fa fa-fw');
        this.$label = $('<span>');

        if (tagName === 'INPUT') {
            this.$button = $('<button type="button">');
            this.$input  = $element.clone(true);
        }
        else {
            label = $element.html().trim();
            this.$button = $element.clone(true);
            this.$input  = $('<input type="file">');
        }

        this.$button.css({
            position: 'relative',
            overflow: 'hidden'
        })
        .click(function(e) {
            self.$input.click();
            return false;
        });

        if (! this.$button.hasClass('beautifile')) {
            this.type(type);
        }

        this.selected = {};

        this.$input.removeClass().css({
            position  : 'absolute',
            top       : '0',
            right     : '0',
            minWidth  : '100%',
            minHeight : '100%',
            fontSize  : '100px',
            textAlign : 'right',
            filter    : 'alpha(opacity=0)',
            opacity   : '0',
            outline   : 'none',
            background: 'transparent',
            cursor    : 'inherit',
            display   : 'block'
        })
        .change(function() {
            var $target   = tagName === 'INPUT' ? self.$input : self.$button;
            var $input    = self.$input;
            var input     = $input.get(0);
            var files     = [];
            self.selected = {};
            for(var i = 0; i < input.files.length; i++) {
                var file = input.files[i];
                self.selected[file.name] = file;
                files.push(file.name);
            }
            self.text(files.join(' | '));
            $target.trigger('fileselect', [self.selected]);
        });

        this.$fakeInput = null;

        this.icon(icon);
        this.label(label);
        this.input(input);
        this.text(text);
        this.multiple(multiple);

        this.$button.html(this.$icon);
        this.$button.append(this.$label);
        //this.$button.append(this.$input);

        $element.replaceWith(this.$button);
    };

    BeautiFile.VERSION  = '1.0.0';

    BeautiFile.DEFAULTS = {
        type : 'default',
        icon : 'folder-open',
        label: 'Browse...',
        input: '',
        text : 'No file selected...',
        multiple: false
    };

    BeautiFile.prototype.files = function(callback) {
        for(var name in this.selected) {
            callback.call(this, name, this.selected[name]);
        }
    };

    BeautiFile.prototype.reset = function(text) {
        this.text(text || this.options.text);
    };

    BeautiFile.prototype.type = function(type) {
        this.$button.attr('class', function(i, name) {
            if (! name) return 'beautifile btn btn-' + type;
            name = name.replace(/(^|\s)btn-\S+/g, '');
            return name + ' btn-' + type;
        });
        return this;
    };

    BeautiFile.prototype.icon = function(icon) {
        if (! icon || icon === '') {
            this.$button.addClass('no-icon');
            this.$icon.hide();
            return this;
        }
        this.$button.removeClass('no-icon');
        if (typeof icon === 'string') {
            this.$icon.attr('class', function(i, name) {
                name.replace(/(^|\s)fa-\S+/g, '');
                return name + ' fa-' + icon;
            });
        }
        this.$icon.show();
        return this;
    };

    BeautiFile.prototype.label = function(label) {
        if (label === undefined) {
            return this.$label.html().trim();
        }
        if (! label || label === '') {
            this.$button.addClass('no-label');
            this.$label.hide();
            return this;
        }
        this.$button.removeClass('no-label');
        if (typeof label === 'string') {
            this.$label.html(label);
        }
        this.$label.show();
        return this;
    };

    BeautiFile.prototype.text = function(text) {
        if (typeof text === 'string') {
            if (this.$fakeInput) {
                this.$fakeInput.val(text);
            }
            this.$button.attr('title', text);
        }
        return this;
    };

    BeautiFile.prototype.input = function(input, text) {
        if (typeof input === 'string') {
            if (input === '') {
                this.$fakeInput = null;
                return this;
            }
            this.$fakeInput = $('input[for="' + input + '"]').first();
            if (this.$fakeInput.length === 0) {
                console.error('Input for "' + input + '" not found.');
                return this;
            }
            var $input = this.$input;
            this.$fakeInput.attr('title', this.label())
            .prop('readonly', true)
            .click(function(e) {
                $input.click();
                return false;
            });
            this.text(text);
        }
        else {
            this.$fakeInput.toggle(input);
        }
        return this;
    };

    BeautiFile.prototype.multiple = function(multiple) {
        this.$input.prop('multiple', multiple)
    };

    // FILEBUTTON PLUGIN DEFINITION
    // ============================

    function Plugin(option, args) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data();
            var plugin  = $this.data('beautiFile');
            var action  = typeof option == 'string' && option;
            var options = typeof option == 'object' && option;
                options = $.extend({}, BeautiFile.DEFAULTS, data, options);
            if (! plugin) {
                plugin = new BeautiFile(this, options);
                plugin.$button.data('beautiFile', plugin);
            }
            if (action) {
                plugin[action].apply(plugin, args);
            }
        })
    }

    var old = $.fn.beautiFile;

    $.fn.beautiFile             = Plugin;
    $.fn.beautiFile.Constructor = BeautiFile;

    // FILEBUTTON NO CONFLICT
    // ======================

    $.fn.beautiFile.noConflict = function () {
        $.fn.beautiFile = old;
        return this;
    }

    // FILEBUTTON DATA-API
    // ===================

    $(window).on('load', function () {
        $('input.beautifile, button.beautifile').beautiFile();
    });

}(jQuery);
