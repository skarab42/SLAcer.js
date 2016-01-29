<?php
/**
 * Straw.js
 *
 * Files compressor methods.
 *
 * @license   GPL
 * @version   1.0.0
 * @copyright 2016 Onl'Fait (http://www.onlfait.ch)
 * @author    Sébastien Mischler (skarab) <sebastien@onlfait.ch>
 * @link      https://github.com/lautr3k/Straw
 */
return array
(
    /**
     * Compressor initialization.
     *
     * Called once at compressor loading.
     *
     * @param  Module $module
     * @return void
     */
    'initialize' => function($module)
    {
        // Images base path
        $this->images = str_replace('/', '_', $module->namespace);
        $this->images = 'assets/' . $this->images . '_images_';
    },

    /**
     * Styles file compressor callback.
     *
     * @param  File $file
     * @return mixed
     */
    'styles' => function($file)
    {
        // Path replacement
        $images_url = './' . $this->images;
        $file->data = str_replace('images/', $images_url, $file->data);

        // Continue with minification
        return null;
    },

    /**
     * Assets file compressor callback.
     *
     * @param  File $file
     * @return mixed
     */
    'assets' => function($file)
    {
        // Create new target path
        $file_path          = $this->images . $file->name;
        $file->release_path = $file->module->builder->get_path('release', $file_path);

        // Continue with file copy
        return null;
    }
);
