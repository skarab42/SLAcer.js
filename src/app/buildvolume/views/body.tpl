<div id="appbuildvolume-size" class="row">

    <div class="col-lg-4">
        <div class="input-group">
            <span class="input-group-addon">X</span>
            <input data-bind="value: size.x, event: { change: sizeChange }" type="number" class="form-control" />
        </div>
    </div>

    <div class="col-lg-4">
        <div class="input-group">
            <span class="input-group-addon">Y</span>
            <input data-bind="value: size.y, event: { change: sizeChange }" type="number" class="form-control" />
        </div>
    </div>

    <div class="col-lg-4">
        <div class="input-group">
            <span class="input-group-addon">Z</span>
            <input data-bind="value: size.z, event: { change: sizeChange }" type="number" class="form-control" />
        </div>
    </div>
</div>

<div class="row">

    <div class="col-lg-12">
        <div class="input-group">
            <span class="input-group-addon">
                <i class="fa fa-eye"></i>
            </span>
            <div class="input-group-btn">
                <button data-bind="html: texts.floor, event: { click: toggleElement }" class="btn btn-default" type="submit" value="floor">floor</button>
                <button data-bind="html: texts.grid, event: { click: toggleElement }" class="btn btn-default" type="submit" value="grid">grid</button>
                <button data-bind="html: texts.axis, event: { click: toggleElement }" class="btn btn-default" type="submit" value="axis">axis</button>
                <button data-bind="html: texts.box, event: { click: toggleElement }" class="btn btn-default" type="submit" value="box">box</button>
            </div>
        </div>
    </div>

</div>
