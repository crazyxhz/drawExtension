
define("dojo/_base/declare dojo/_base/lang dojo/_base/connect dojo/has dojo/sniff dojo/dom-style dojox/gfx/Moveable esri/kernel esri/geometry/Point esri/graphic esri/geometry/webMercatorUtils".split(" "), function (declare, lang, connect, has, sniff, domStyle, Moveable, esriKernel, Point, graphic, webMercatorUtils)
{
	var VertexMover = declare(null, {declaredClass: "esri.toolbars.VertexMoverEx", constructor: function (point, symbol, graphic, segIndex, ptIndex, segLength, toolbar, isPlaceHolder)
	{
		this.point = point;
		this.symbol = symbol;
		this.relatedGraphic = graphic;
		this.segIndex = segIndex;
		this.ptIndex = ptIndex;
		this.segLength = segLength;
		this.editor = toolbar;
		this.map = toolbar.map;
		this._scratchGL = toolbar.toolbar._scratchGL;
		this._placeholder = isPlaceHolder || !1;
		this._type = graphic.geometry.type;
		this._init();
		this._enable()
	},
		refresh: function (a)
		{
			if (a || this._needRefresh())this._disable(), this._enable()
		},
		destroy: function ()
		{
			this._disable();
			this.graphic && this._scratchGL.remove(this.graphic);
			this.point = this.symbol = this.graphic = this.relatedGraphic = this.segIndex = this.ptIndex = this.segLength = this.editor = this.map = this._scratchGL = null
		},
		_init: function ()
		{
			var a = new Point(this.point.toJson()), a = new graphic(a, this.symbol);
			switch (this._type)
			{
				case "multipoint":
					a._shape =
						this.relatedGraphic.getDojoShape().children[this.ptIndex];
					break;
				case "polyline":
				case "polygon":
					this._scratchGL.add(a)
			}
			this.graphic = a
		},
		_enable: function ()
		{
			var a = this.graphic.getDojoShape();
			a && (a._hasMover = !0, this._moveable = this._getMoveable(a), (a = a.getEventSource()) && domStyle.set(a, "cursor", this.editor.toolbar._cursors[this._placeholder ? "move-gv" : "move-v"]))
		},
		_disable: function ()
		{
			var a = this._moveable;
			if (a)
			{
				connect.disconnect(this._startHandle);
				connect.disconnect(this._firstHandle);
				connect.disconnect(this._movingHandle);
				connect.disconnect(this._stopHandle);
				var b = a.shape;
				b && (b = b.getEventSource()) && domStyle.set(b, "cursor", null);
				a.destroy();
				this._moveable = null
			}
		},
		_needRefresh: function ()
		{
			var a = this.graphic.getDojoShape(), b = !1;
			if (a)switch (this._type)
			{
				case "multipoint":
					var d = this.relatedGraphic.getDojoShape();
					d && (d = d.children[this.ptIndex], a !== d && (this.graphic._shape = d, b = !0));
					break;
				case "polyline":
				case "polygon":
					b = !a._hasMover
			}
			return b
		},
		_getMoveable: function (a)
		{
			a = new Moveable(a, sniff("mac") && sniff("ff") && !has("esri-touch") && {leftButtonOnly: !0});
			this._startHandle = connect.connect(a, "onMoveStart",
			                                    this, this._moveStartHandler);
			this._firstHandle = connect.connect(a, "onFirstMove", this, this._firstMoveHandler);
			this._movingHandle = connect.connect(a, "onMoving", this, this._movingHandler);
			this._stopHandle = connect.connect(a, "onMoveStop", this, this._moveStopHandler);
			return a
		},
		_getPtIndex: function ()
		{
			return this.ptIndex + (this._placeholder ? 1 : 0)
		},
		_getInfo: function ()
		{
			return{graphic: this.graphic, isGhost: this._placeholder, segmentIndex: this.segIndex, pointIndex: this._getPtIndex()}
		},
		_moveStartHandler: function (a)
		{
			var b = this.map;
			b.snappingManager &&
			b.snappingManager._setUpSnapping();
			a.shape.moveToFront();
			this.constructor.onMoveStart(this);
			this.editor.toolbar.onVertexMoveStart(this.relatedGraphic, this._getInfo())
		},
		_firstMoveHandler: function (a)
		{
			var b = a.shape, d = this._getControlEdges(), e = this._scratchGL._div, k, h = [], f = a.host.shape._wrapOffsets[0] || 0;
			for (k = 0; k < d.length; k++)
			{
				var c = d[k];
				c.x1 += f;
				c.x2 += f;
				h.push([e.createLine({x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2}).setStroke(this.editor._lineStroke), c.x1, c.y1, c.x2, c.y2])
			}
			b._lines = h;
			a.shape.moveToFront();
			this.constructor.onFirstMove(this);
			this.editor.toolbar.onVertexFirstMove(this.relatedGraphic, this._getInfo())
		},
		_movingHandler: function (inputPt)
		{
			//var b = inputPt.shape;
			var inputTransform = inputPt.shape.getTransform();
			for (var d = inputPt.shape._lines, b = 0; b < d.length; b++)
			{
				var e = d[b];
				e[0].setShape({x1: e[1] + inputTransform.dx, y1: e[2] + inputTransform.dy, x2: e[3], y2: e[4]})
			}
			this.editor.toolbar.onVertexMove(this.relatedGraphic, this._getInfo(), inputTransform)
		},
		_moveStopHandler: function (inputPt)
		{
			var inputShape = inputPt.shape;
			var toolbar = this.editor.toolbar;
			var transform = inputShape.getTransform();
			var map = this.map;
			var graphic = this.graphic;
			var geometry = toolbar._geo ? webMercatorUtils.geographicToWebMercator(graphic.geometry) : graphic.geometry, i;
			var lines = inputShape._lines;
			if (lines)
			{
				for (i = 0; i < lines.length; i++)
					lines[i][0].removeShape();
				inputShape._lines = null;
			}
			i = !1;
			var c = !0, l = this._getInfo();
			transform && (transform.dx || transform.dy) ? this._placeholder && (this._placeholder = !1, i = !0) : c = !1;
			var g;
			map.snappingManager && (g = map.snappingManager._snappingPoint);
			g = g || map.toMap(map.toScreen(geometry).offset(transform.dx, transform.dy));
			map.snappingManager && map.snappingManager._killOffSnapping();
			inputShape.setTransform(null);
			graphic.setGeometry(toolbar._geo ? webMercatorUtils.webMercatorToGeographic(g, !0) : g);

			this.constructor.onMoveStop(this, transform);
			toolbar.onVertexMoveStop(this.relatedGraphic, l, transform);
			if (!c)
				toolbar.onVertexClick(this.relatedGraphic, l);
			if (i)
				toolbar.onVertexAdd(this.relatedGraphic, this._getInfo());
			this.relatedGraphic.getDojoShape().moveToBack();
		},
		_getControlEdges: function ()
		{
			var a = this.map, b = this.relatedGraphic.geometry, d = this.segIndex, e = this.ptIndex, k = this.segLength, h = this._scratchGL._div.getTransform(), f = h.dx, h = h.dy, c = a.toScreen(this.graphic.geometry), a = c.x - f, c = c.y - h, g = [], b = this.editor._getControlPoints(this, b, d, e, k);
			b[0] && g.push({x1: a, y1: c, x2: b[0].x - f, y2: b[0].y - h});
			b[1] && g.push({x1: a, y1: c, x2: b[1].x - f, y2: b[1].y - h});
			return g
		}});
	has("extend-esri") && lang.setObject("toolbars.VertexMover",
	                                     VertexMover, esriKernel);
	lang.mixin(VertexMover, {onMoveStart: function ()
	{
	}, onFirstMove: function ()
	{
	}, onMoveStop: function ()
	{
	}});
	return VertexMover;
});