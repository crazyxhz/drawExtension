
define("dojo/_base/declare dojo/_base/lang dojo/_base/connect dojo/_base/json dojo/has dojo/dom-style dojox/gfx/Moveable dojox/gfx/Mover dojox/gfx/matrix esri/kernel esri/geometry/webMercatorUtils esri/geometry/ScreenPoint".split(" "), function (declare, lang, connect, json, has, domStyle, Moveable, Mover, matrix, esriKernel, webMercatorUtils, ScreenPoint)
{
	var GraphicMover = declare(null,
	                           {declaredClass: "esri.toolbars._GraphicMoverEx",
		                           constructor: function (graphic, map, edit)
		                           {
			                           this.graphic = graphic;
			                           if (graphic.geometry.controlPoints) this._controlPoints = graphic.geometry.controlPoints;
			                           this.map = map;
			                           this.toolbar = edit;
			                           this._enableGraphicMover();
			                           this._moved = !1;
		                           },
		                           refresh: function (a)
		                           {
			                           var graphicDojoShape = this.graphic.getDojoShape();
			                           if (graphicDojoShape && (a || !graphicDojoShape._hostGraphic))this._disableGraphicMover(), this._enableGraphicMover()
		                           },
		                           destroy: function ()
		                           {
			                           this._disableGraphicMover();
		                           },
		                           hasMoved: function ()
		                           {
			                           return this._moved;
		                           },
		                           _enableGraphicMover: function ()
		                           {
			                           var graphic = this.graphic, dojoShape = graphic.getDojoShape();
			                           dojoShape && (dojoShape._hostGraphic = graphic, this._moveable = new Moveable(dojoShape, {mover: GraphicMover.Mover}), this._moveStartHandle = connect.connect(this._moveable, "onMoveStart", this, this._moveStartHandler), this._firstMoveHandle = connect.connect(this._moveable, "onFirstMove", this, this._firstMoveHandler), this._movingHandle = connect.connect(this._moveable, "onMoving", this, this._movingHandler), this._moveStopHandle = connect.connect(this._moveable, "onMoveStop", this, this._moveStopHandler), (graphic = dojoShape.getEventSource()) && domStyle.set(graphic, "cursor", this.toolbar._cursors.move));

		                           },
		                           _disableGraphicMover: function ()
		                           {
			                           var moveAble = this._moveable;
			                           if (moveAble)
			                           {
				                           connect.disconnect(this._moveStartHandle);
				                           connect.disconnect(this._firstMoveHandle);
				                           connect.disconnect(this._movingHandle);
				                           connect.disconnect(this._moveStopHandle);
				                           var b = moveAble.shape;
				                           b && (b._hostGraphic = null, (b = b.getEventSource()) && domStyle.set(b, "cursor", null));
				                           moveAble.destroy()
			                           }
			                           this._moveable = null;
		                           },
		                           _moveStartHandler: function ()
		                           {
			                           var a = this.graphic, b = this.map;
			                           this._startTx = a.getDojoShape().getTransform();
			                           "point" === this.graphic.geometry.type && b.snappingManager && b.snappingManager._setUpSnapping();
			                           this.toolbar.onGraphicMoveStart(a);
		                           },
		                           _firstMoveHandler: function ()
		                           {
			                           this.toolbar._beginOperation("MOVE");
			                           this.toolbar.onGraphicFirstMove(this.graphic);
		                           },
		                           _movingHandler: function (moveAble)
		                           {
			                           this.toolbar.onGraphicMove(this.graphic, moveAble.shape.getTransform());
		                           },
		                           _moveStopHandler: function (moveAble)
		                           {
			                           var graphic = this.graphic;
			                           var editToolbar = this.toolbar;
			                           var map = this.map;
			                           var geometry = editToolbar._geo ? webMercatorUtils.geographicToWebMercator(graphic.geometry) : graphic.geometry;
			                           var geometryType = geometry.type;
			                           var graphicDojoShape = graphic.getDojoShape();
			                           var graphicTransform = graphicDojoShape.getTransform();
			                           if (json.toJson(graphicTransform) !== json.toJson(this._startTx))
			                           {
				                           this._moved = !0;
				                           switch (geometryType)
				                           {
					                           case "point":
						                           var transFormArray = [graphicTransform, matrix.invert(this._startTx)], snapPoint;
						                           map.snappingManager && (snapPoint = map.snappingManager._snappingPoint);
						                           geometry = snapPoint || map.toMap(matrix.multiplyPoint(transFormArray, map.toScreen(geometry, !0)));
						                           map.snappingManager && map.snappingManager._killOffSnapping();
						                           break;
					                           case "polyline":
						                           this.cpCount = 0;
						                           this.toolbar._scratchGL.graphics.forEach(function (item, index)
						                                                                    {
							                                                                    if (item.controlPoints)
							                                                                    {
								                                                                    var a = this._updateControlPt(geometry, item.geometry, graphicTransform);
								                                                                    item.setGeometry(editToolbar._geo ? webMercatorUtils.webMercatorToGeographic(a, !0) : a);
								                                                                    this._controlPoints[this.cpCount++] = item.geometry;
							                                                                    }
						                                                                    }, this);
						                           geometry = this._updatePolyGeometry(geometry, geometry.paths, graphicTransform);
						                           break;
					                           case "polygon":
						                           this.cpCount = 0;
						                           this.toolbar._scratchGL.graphics.forEach(function (item, index)
						                                                                    {
							                                                                    if (item.controlPoints)
							                                                                    {
								                                                                    var a = this._updateControlPt(geometry, item.geometry, graphicTransform);
								                                                                    item.setGeometry(editToolbar._geo ? webMercatorUtils.webMercatorToGeographic(a, !0) : a);
								                                                                    this._controlPoints[this.cpCount++] = item.geometry;
							                                                                    }
						                                                                    }, this);
						                           //console.log("graphicMover update");
						                           geometry = this._updatePolyGeometry(geometry, geometry.rings, graphicTransform);
				                           }
				                           graphicDojoShape.setTransform(null);
				                           graphic.setGeometry(editToolbar._geo ? webMercatorUtils.webMercatorToGeographic(geometry, !0) : geometry);
			                           }
			                           else this._moved = !1;
			                           editToolbar._endOperation("MOVE");
			                           if (this.graphic.geometry.type === "polyline")
				                           this._enableGraphicMover();
			                           this.toolbar._boxEditor._anchors.forEach(function (item)
			                                                                    {
				                                                                    item.graphic.getDojoShape().moveToFront();
			                                                                    });
			                           this.toolbar._scratchGL.graphics.forEach(function (item, index)
			                                                                    {
				                                                                    if (item.controlPoints)
				                                                                    {
					                                                                    item.getDojoShape().moveToFront();
					                                                                    //console.log("cp moved!")
				                                                                    }
			                                                                    });
			                           editToolbar.onGraphicMoveStop(graphic, graphicTransform);
			                           this._moved || (moveAble = moveAble.__e, map = this.map.position, moveAble = new ScreenPoint(moveAble.pageX - map.x, moveAble.pageY - map.y), editToolbar.onGraphicClick(graphic, {screenPoint: moveAble, mapPoint: this.map.toMap(moveAble)}));
//			                           if (this.graphic.geometry.type === "polyline")
//				                           this.toolbar._enableMove(this._graphic);
		                           },
		                           _updatePolyGeometry: function (geometry, rings, graphicTransform)
		                           {
			                           var map = this.map;
			                           var firstPoint = geometry.getPoint(0, 0);
			                           var mapfirstPoint = map.toMap(map.toScreen(firstPoint).offset(graphicTransform.dx, graphicTransform.dy));
			                           graphicTransform = mapfirstPoint.x - firstPoint.x;
			                           for (var e = mapfirstPoint.y - firstPoint.y, k, ring, h, i = 0; i < rings.length; i++)
			                           {
				                           ring = rings[i];
				                           for (k = 0; k < ring.length; k++)h = geometry.getPoint(i, k), geometry.setPoint(i, k, h.offset(graphicTransform, e));
			                           }
			                           return geometry;
		                           },
		                           _updateControlPt: function (geometry, point, graphicTransform)
		                           {
			                           var map = this.map;
			                           var firstPoint = geometry.getPoint(0, 0);
			                           // ;
			                           //console.log(firstPoint.x);
			                           var mapfirstPoint = map.toMap(map.toScreen(firstPoint).offset(graphicTransform.dx, graphicTransform.dy));
			                           graphicTransform = mapfirstPoint.x - firstPoint.x;
			                           var e = mapfirstPoint.y - firstPoint.y;
			                           point = point.offset(graphicTransform, e);
			                           // console.log(point.x);

			                           return point;
		                           }
	                           });
	GraphicMover.Mover = declare(Mover, {declaredClass: "esri.toolbars._MoverEx", constructor: function (a, b, d)
	{
		this.__e = b
	}});
	has("extend-esri") && (lang.setObject("toolbars._GraphicMover", GraphicMover, esriKernel), lang.setObject("toolbars._Mover", GraphicMover.Mover, esriKernel));
	return GraphicMover
});