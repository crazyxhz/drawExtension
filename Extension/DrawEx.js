/**
 * Created by Hongzhi on 5/8/2014.
 */
define("dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/connect dojo/_base/Color dojo/_base/window dojo/has dojo/keys dojo/dom-construct dojo/dom-style esri/kernel esri/sniff esri/toolbars/_toolbar esri/symbols/SimpleMarkerSymbol esri/symbols/SimpleLineSymbol esri/symbols/SimpleFillSymbol esri/graphic esri/geometry/jsonUtils esri/geometry/webMercatorUtils esri/geometry/Polyline esri/geometry/Polygon esri/geometry/Multipoint esri/geometry/Rect dojo/i18n!esri/nls/jsapi".split(" "), function (_declare, _lang, Array, _connect, color, _window, _has, _keys, _domconstruct, _domstyle, esriKernel, esriSniff, Toolbar, SimpleMarker, SimpleLine, SimpleFill, graphic, jsonUtility, _webMercatorUtils, _Polyline, _Polygon, _Multipoint, _Rect, _dojoEsrijsapi)
{
	var DrawEx = _declare(Toolbar, {
		declaredClass: "esri.toolbars.DrawEx",
		_eventMap: { "draw-complete": !0, "draw-end": ["geometry"] },
		constructor: function (map, options)
		{
			this.markerSymbol = new SimpleMarker(SimpleMarker.STYLE_SOLID, 10, new SimpleLine(SimpleLine.STYLE_SOLID, new color([255, 0, 0]), 2), new color([0, 0, 0, 0.25]));
			this.lineSymbol = new SimpleLine(SimpleLine.STYLE_SOLID, new color([255, 0, 0]), 2);
			this.fillSymbol = new SimpleFill(SimpleFill.STYLE_SOLID, new SimpleLine(SimpleLine.STYLE_SOLID, new color([255, 0, 0]), 2), new color([0, 0, 0, 0.25]));
			this._points = [];
			this._defaultOptions = { showTooltips: !0, drawTime: 75, tolerance: 8, tooltipOffset: 15 };
			this._options = _lang.mixin(_lang.mixin({}, this._defaultOptions), options || {});
			this._mouse = !_has("esri-touch") && !_has("esri-pointer");
			this._mouse || (this._options.showTooltips = !1);
			this._onKeyDownHandler = _lang.hitch(this, this._onKeyDownHandler);
			this._onMouseDownHandler = _lang.hitch(this, this._onMouseDownHandler);
			this._onMouseUpHandler = _lang.hitch(this, this._onMouseUpHandler);
			this._onClickHandler = _lang.hitch(this, this._onClickHandler);
			this._onMouseMoveHandler = _lang.hitch(this, this._onMouseMoveHandler);
			this._onMouseDragHandler = _lang.hitch(this, this._onMouseDragHandler);
			this._onDblClickHandler = _lang.hitch(this, this._onDblClickHandler);
			this._updateTooltip = _lang.hitch(this, this._updateTooltip);
			this._hideTooltip = _lang.hitch(this, this._hideTooltip);
			this._redrawGraphic = _lang.hitch(this, this._redrawGraphic)
		},

		//current drawing geometry type , null if not drawing
		_geometryType: null,
		respectDrawingVertexOrder: !1,
		setRespectDrawingVertexOrder: function (b)
		{
			this.respectDrawingVertexOrder = b
		},
		setMarkerSymbol: function (b)
		{
			this.markerSymbol = b
		},
		setLineSymbol: function (b)
		{
			this.lineSymbol = b
		},
		setFillSymbol: function (b)
		{
			this.fillSymbol = b
		},
		activate: function (geometryType, options)
		{
			this._geometryType && this.deactivate();
			var mapHolder = this.map, connectionHandler = _connect.connect, Draw = DrawEx;
			this._options = _lang.mixin(_lang.mixin({}, this._options), options || {});
			///? meaning?
			mapHolder.navigationManager.setImmediateClick(false);
			switch (geometryType)
			{
				case Draw.ARROW:
				case Draw.LEFT_ARROW:
				case Draw.RIGHT_ARROW:
				case Draw.UP_ARROW:
				case Draw.DOWN_ARROW:
				case Draw.TRIANGLE:
				case Draw.CIRCLE:
				case Draw.ELLIPSE:
				case Draw.RECTANGLE:
					this._deactivateMapTools(!0, !1, !1, !0);
					//arrow triangle circle ellipse rectange listen event: click mousedown mousedrag mouseup
					this._onClickHandler_connect = connectionHandler(mapHolder, "onClick", this._onClickHandler);
					//this._onClickHandler_connect = mapHolder.on("click", this._onClickHandler);
					this._onMouseDownHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeStart" : "onMouseDown", this._onMouseDownHandler);
					this._onMouseDragHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeMove" : "onMouseDrag", this._onMouseDragHandler);
					this._onMouseUpHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeEnd" : "onMouseUp", this._onMouseUpHandler);

					//touch & !mouse
					_has("esri-touch") && !_has("esri-pointer") && (this._onMouseDownHandler2_connect = connectionHandler(mapHolder, "onMouseDown", this._onMouseDownHandler), this._onMouseDragHandler2_connect = connectionHandler(mapHolder, "onMouseDrag", this._onMouseDragHandler), this._onMouseUpHandler2_connect = connectionHandler(mapHolder, "onMouseUp", this._onMouseUpHandler));
					break;
				case Draw.POINT:
					//point click event
					this._onClickHandler_connect = connectionHandler(mapHolder, "onClick", this._onClickHandler);
					break;
				case Draw.LINE:
				case Draw.EXTENT:
				case Draw.FREEHAND_POLYLINE:
				case Draw.FREEHAND_POLYGON:
					//line extent freehand polyline & polygon mousedown mousedrag mouseup
					this._deactivateMapTools(!0, !1, !1, !0);
					this._onMouseDownHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeStart" : "onMouseDown", this._onMouseDownHandler);
					this._onMouseDragHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeMove" : "onMouseDrag", this._onMouseDragHandler);
					this._onMouseUpHandler_connect = connectionHandler(mapHolder, !this._mouse ? "onSwipeEnd" : "onMouseUp", this._onMouseUpHandler);
					_has("esri-touch") && !_has("esri-pointer") && (this._onMouseDownHandler2_connect = connectionHandler(mapHolder, "onMouseDown", this._onMouseDownHandler), this._onMouseDragHandler2_connect = connectionHandler(mapHolder, "onMouseDrag", this._onMouseDragHandler), this._onMouseUpHandler2_connect = connectionHandler(mapHolder, "onMouseUp", this._onMouseUpHandler));
					break;
				case Draw.POLYLINE:
				case Draw.POLYGON:
				case Draw.MULTI_POINT:
				case Draw.POLYLINEEX:
					//polyline polygon multi-point click doubleclick
					mapHolder.navigationManager.setImmediateClick(!0);
					this._onClickHandler_connect = connectionHandler(mapHolder, "onClick", this._onClickHandler);
					this._onDblClickHandler_connect = connectionHandler(mapHolder, "onDblClick", this._onDblClickHandler);
					this._dblClickZoom = mapHolder.isDoubleClickZoom;
					mapHolder.disableDoubleClickZoom();
					break;
				case Draw.CURVE:
				case Draw.BEZIER_CURVE:
				case Draw.BEZIER_POLYGON:
				case Draw.FREEHAND_ARROW:
					mapHolder.navigationManager.setImmediateClick(!0);
					this._deactivateMapTools(!0, !1, !1, !0);
					this._onClickHandler_connect = connectionHandler(mapHolder, "onClick", this._onClickHandler);
					//this._onClickHandler_connect = mapHolder.on("click", this._onClickHandler);
					this._onDblClickHandler_connect = connectionHandler(mapHolder, "onDblClick", this._onDblClickHandler);
					this._dblClickZoom = mapHolder.isDoubleClickZoom;
					mapHolder.disableDoubleClickZoom();
					break;
				default:
					console.error("Unsupported geometry type: " + geometryType);
					return
			}
			this._onKeyDown_connect = connectionHandler(mapHolder, "onKeyDown", this._onKeyDownHandler);
			this._redrawConnect = connectionHandler(mapHolder, "onExtentChange", this._redrawGraphic);
			this._geometryType = geometryType;
			this._toggleTooltip(!0);
			mapHolder.snappingManager && ("freehandpolyline" !== this._geometryType && "freehandpolygon" !== this._geometryType && this._mouse) && (mapHolder.snappingManager._startSelectionLayerQuery(), mapHolder.snappingManager._setUpSnapping());
			this.onActivate(this._geometryType)
		},
		//Deactivates the toolbar and reactivates map navigation.
		deactivate: function ()
		{
			var mapHolder = this.map;
			this._clear();
			var disconnect = _connect.disconnect;
			disconnect(this._onMouseMoveHandler_connect);
			disconnect(this._onMouseDownHandler_connect);
			disconnect(this._onMouseDragHandler_connect);
			disconnect(this._onMouseUpHandler_connect);
			disconnect(this._onMouseDownHandler2_connect);
			disconnect(this._onMouseDragHandler2_connect);
			disconnect(this._onMouseUpHandler2_connect);
			disconnect(this._onClickHandler_connect);
			//this._onClickHandler_connect.remove();
			disconnect(this._onDblClickHandler_connect);
			disconnect(this._onKeyDown_connect);
			disconnect(this._redrawConnect);
			this._onMouseDownHandler_connect = this._onMouseMoveHandler_connect = this._onMouseDragHandler_connect = this._onMouseUpHandler_connect = this._onMouseDownHandler2_connect = this._onMouseDragHandler2_connect = this._onMouseUpHandler2_connect = this._onClickHandler_connect = this._onDblClickHandler_connect = this._onKeyDown_connect = this._redrawConnect = null;
			mapHolder.snappingManager && (mapHolder.snappingManager._stopSelectionLayerQuery(), mapHolder.snappingManager._killOffSnapping());
			switch (this._geometryType)
			{
				case DrawEx.CIRCLE:
				case DrawEx.ELLIPSE:
				case DrawEx.TRIANGLE:
				case DrawEx.ARROW:
				case DrawEx.LEFT_ARROW:
				case DrawEx.RIGHT_ARROW:
				case DrawEx.UP_ARROW:
				case DrawEx.DOWN_ARROW:
				case DrawEx.RECTANGLE:
				case DrawEx.LINE:
				case DrawEx.EXTENT:
				case DrawEx.FREEHAND_POLYLINE:
				case DrawEx.FREEHAND_POLYGON:
					this._activateMapTools(!0, !1, !1, !0);
					break;
				case DrawEx.POLYLINE:
				case DrawEx.POLYLINEEX:
				case DrawEx.POLYGON:
				case DrawEx.MULTI_POINT:
					this._dblClickZoom && mapHolder.enableDoubleClickZoom();
					break;
				case DrawEx.CURVE:
				case DrawEx.BEZIER_CURVE:
				case DrawEx.BEZIER_POLYGON:
				case DrawEx.FREEHAND_ARROW:
					this._activateMapTools(!0, !1, !1, !0);
					this._dblClickZoom && mapHolder.enableDoubleClickZoom();
					break;
			}
			var lastGeometryType = this._geometryType;
			this._geometryType = null;
			mapHolder.navigationManager.setImmediateClick(!1);
			this._toggleTooltip(!1);
			this.onDeactivate(lastGeometryType)
		},
		_clear: function ()
		{
			this._graphic && this.map.graphics.remove(this._graphic, !0);
			this._tGraphic && this.map.graphics.remove(this._tGraphic, !0);
			this._graphic = this._tGraphic = null;
			this.map.snappingManager && this.map.snappingManager._setGraphic(null);
			this._points = [];
			this._curvePt1 = this._curvePt2 = null;
		},
		//Finishes drawing the geometry and fires the onDrawEnd event. Use this method to finish drawing a polyline, polygon or multipoint when working with the compact build on a touch supported device like the iPhone.
		finishDrawing: function ()
		{
			var returnGeometry, TempPoints = this._points, SpatialReference = this.map.spatialReference, Draw = DrawEx, PointCollection = TempPoints.slice(0, TempPoints.length);
			switch (this._geometryType)
			{
				case Draw.POLYLINE:
					if (!this._graphic || 2 > PointCollection.length) return;
					returnGeometry = new _Polyline(SpatialReference);
					returnGeometry.addPath([].concat(PointCollection));
					break;
				case Draw.POLYGON:
					if (!this._graphic || 3 > PointCollection.length) return;
					returnGeometry = new _Polygon(SpatialReference);
					PointCollection = [].concat(PointCollection, [PointCollection[0].offset(0, 0)]);
					!_Polygon.prototype.isClockwise(PointCollection) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), PointCollection.reverse());
					returnGeometry.addRing(PointCollection);
					break;
				case Draw.MULTI_POINT:
					returnGeometry = new _Multipoint(SpatialReference), Array.forEach(PointCollection, function (a)
					{
						returnGeometry.addPoint(a)
					})
			}
			_connect.disconnect(this._onMouseMoveHandler_connect);
			this._clear();
			this._setTooltipMessage(0);
			this._drawEnd(returnGeometry)
		},
		_drawEnd: function (drawGeometry)
		{
			if (drawGeometry)
			{
				var SpatialReference = this.map.spatialReference, geographicGeometry;
				this.onDrawEnd(drawGeometry);
				SpatialReference && (SpatialReference.isWebMercator() ? geographicGeometry = _webMercatorUtils.webMercatorToGeographic(drawGeometry, !0) : 4326 === SpatialReference.wkid && (geographicGeometry = jsonUtility.fromJson(drawGeometry.toJson())));
				this.onDrawComplete({ geometry: drawGeometry, geographicGeometry: geographicGeometry })
			}
		},
		_normalizeRect: function (point1, point2, spatialReference)
		{
			var pt1X = point1.x;
			var pt1Y = point1.y;
			var pt2X = point2.x;
			var pt2Y = point2.y;
			var width = Math.abs(pt1X - pt2X), height = Math.abs(pt1Y - pt2Y);
			return { x: Math.min(pt1X, pt2X), y: Math.max(pt1Y, pt2Y), width: width, height: height, spatialReference: spatialReference }
		},
		_onMouseDownHandler: function (clickPoint)
		{
			this._dragged = false;
			var snapPoint;
			this.map.snappingManager && (snapPoint = this.map.snappingManager._snappingPoint);
			var start = snapPoint || clickPoint.mapPoint, Draw = DrawEx;
			var map = this.map;
			var spatialReference = map.spatialReference;
			this._points.push(start.offset(0, 0));
			switch (this._geometryType)
			{
				case Draw.LINE:
					this._graphic = map.graphics.add(new graphic(new _Polyline({
						                                                           paths: [
							                                                           [
								                                                           [start.x, start.y],
								                                                           [start.x, start.y]
							                                                           ]
						                                                           ], spatialReference: spatialReference
					                                                           }), this.lineSymbol), !0);
					map.snappingManager && map.snappingManager._setGraphic(this._graphic);
					break;
				case Draw.FREEHAND_POLYLINE:
					this._oldPoint = clickPoint.screenPoint;
					start = new _Polyline(spatialReference);
					start.addPath(this._points);
					this._graphic = map.graphics.add(new graphic(start, this.lineSymbol), !0);
					map.snappingManager && map.snappingManager._setGraphic(this._graphic);
					break;
				case Draw.CIRCLE:
				case Draw.ELLIPSE:
				case Draw.TRIANGLE:
				case Draw.ARROW:
				case Draw.LEFT_ARROW:
				case Draw.RIGHT_ARROW:
				case Draw.UP_ARROW:
				case Draw.DOWN_ARROW:
				case Draw.RECTANGLE:
				case Draw.FREEHAND_POLYGON:
					//console.log("down!");
					this._oldPoint = clickPoint.screenPoint, start = new _Polygon(spatialReference), start.addRing(this._points), this._graphic = map.graphics.add(new graphic(start, this.fillSymbol), !0), map.snappingManager && map.snappingManager._setGraphic(this._graphic);
				//console.log(this._points.length);
			}
			_has("esri-touch") && clickPoint.preventDefault();
		},
		_onMouseMoveHandler: function (inputPoint)
		{
			var a;
			this.map.snappingManager && (a = this.map.snappingManager._snappingPoint);
			var lastPoint = this._points[this._points.length - 1];
			var candidatePoint = a || inputPoint.mapPoint;
			var tempGraphic = this._tGraphic;
			var geometry = tempGraphic.geometry;

			switch (this._geometryType)
			{
				case DrawEx.POLYLINE:
				case DrawEx.POLYGON:
					geometry.setPoint(0, 0, { x: lastPoint.x, y: lastPoint.y });
					geometry.setPoint(0, 1, { x: candidatePoint.x, y: candidatePoint.y });
					tempGraphic.setGeometry(geometry);
					break;
				case DrawEx.CURVE:
					if (this._curvePt1 && this._curvePt2)
					{
						var circle = this._circleDrawEx(this.map.toScreen(this._curvePt1), this.map.toScreen(this._curvePt2), this.map.toScreen(candidatePoint));
						if (circle.radius > 0)
						{

							tempGraphic.geometry = this.CreateCircleSegmentFromThreePoints(circle, this.map.toScreen(this._curvePt1), this.map.toScreen(this._curvePt2), this.map.toScreen(candidatePoint), 60, this.map);
							tempGraphic.setGeometry(tempGraphic.geometry);
							//tempGraphic.setSymbol(this.fillSymbol);
						}
					}
					else
					{

						geometry.setPoint(0, 0, { x: lastPoint.x, y: lastPoint.y });
						geometry.setPoint(0, 1, { x: candidatePoint.x, y: candidatePoint.y });
						tempGraphic.setGeometry(geometry);
					}
					break;
				case DrawEx.BEZIER_CURVE:
					if (this._points.length <= 1)
					{
						geometry.setPoint(0, 0, { x: lastPoint.x, y: lastPoint.y });
						geometry.setPoint(0, 1, { x: candidatePoint.x, y: candidatePoint.y });
						tempGraphic.setGeometry(geometry);
					}
					else
					{
						var tempArray = [];
						Array.forEach(this._points, function (e)
						{
							tempArray.push({ x: e.x, y: e.y });
						});
						//							       if(!(tempArray[tempArray.length-1].x === candidatePoint.x && tempArray[tempArray.length-1].y ===candidatePoint.y))
						//							       {
						tempArray.push({ x: candidatePoint.x, y: candidatePoint.y });
						//							       }

						tempGraphic.geometry = this.CreateBezierPath(tempArray, 100, this.map);
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					break;
				case DrawEx.BEZIER_POLYGON:
					if (this._points.length <= 1)
					{
						geometry.setPoint(0, 0, { x: lastPoint.x, y: lastPoint.y });
						geometry.setPoint(0, 1, { x: candidatePoint.x, y: candidatePoint.y });
						tempGraphic.setGeometry(geometry);
					}
					else
					{
						tempArray = [];
						Array.forEach(this._points, function (e)
						{
							tempArray.push({ x: e.x, y: e.y });
						});
						//							       if(!(tempArray[tempArray.length-1].x === candidatePoint.x && tempArray[tempArray.length-1].y ===candidatePoint.y))
						//							       {
						tempArray.push({ x: candidatePoint.x, y: candidatePoint.y });
						//							       }
						tempGraphic.geometry = this.CreateBezierPathPoly(tempArray, 130, this.map);
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					break;
				case DrawEx.FREEHAND_ARROW:
					if (this._points.length <= 1)
					{
						var len = this._2PtLen(this._points[0], candidatePoint);
						var k = Math.atan((this._points[0].y - candidatePoint.y) / (this._points[0].x - candidatePoint.x));
						switch (this.twoPtsRelationShip(this._points[0], candidatePoint))
						{
							case "ne":
								k += Math.PI / 2;
								break;
							case "nw":
								k += Math.PI * 3 / 2;
								break;
							case "sw":
								k += Math.PI * 3 / 2;
								break;
							case "se":
								k += Math.PI / 2;
								break;
						}
						//tail two points
						var pt1 = { x: this._tailFactor * len * Math.cos(k) + this._points[0].x, y: this._tailFactor * len * Math.sin(k) + this._points[0].y };
						var pt2 = { x: -1 * this._tailFactor * len * Math.cos(k) + this._points[0].x, y: -1 * this._tailFactor * len * Math.sin(k) + this._points[0].y };
						var partialLen = (1 - this._headPercentage) * len;
						var p1 = { x: this._tailFactor * partialLen * Math.cos(k) + this._points[0].x, y: this._tailFactor * partialLen * Math.sin(k) + this._points[0].y };
						var p2 = { x: -1 * this._tailFactor * partialLen * Math.cos(k) + this._points[0].x, y: -1 * this._tailFactor * partialLen * Math.sin(k) + this._points[0].y };


						var map = this.map, result = new _Polygon(map.spatialReference);
						var ring = [];
						ring.push(pt1);
						ring.push(p1);
						ring = ring.concat(this.CreateArrowHeadPathEx(p1, candidatePoint, p2, len, this._headPercentage, 15));
						//ring.push(candidatePoint);
						ring.push(p2);
						ring.push(pt2);

						ring.push(pt1);
						!_Polygon.prototype.isClockwise(ring) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), ring.reverse());
						result.addRing(ring);
						tempGraphic.geometry = result;
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					else
					{
						tempArray = [];var leftArray = [], rightArray = [];
						Array.forEach(this._points, function (e)
						{
							tempArray.push({ x: e.x, y: e.y });
						});
						tempArray.push({ x: candidatePoint.x, y: candidatePoint.y });
						angleArray = this._vertexAngle(tempArray);
						var totalL = this._ptCollectionLen(tempArray, 0);
						for (i = 0, len = tempArray.length - 1; i < len; i++)
						{
							partialLen = this._ptCollectionLen(tempArray, i);
							partialLen += totalL / 2.4;
							//console.log(partialLen);

							pt1 = { x: (this._tailFactor) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: (this._tailFactor) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };
							pt2 = { x: -1 * (this._tailFactor) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: -1 * (this._tailFactor) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };

							leftArray.push(pt1);
							rightArray.push(pt2);
						}
						leftArray.push({ x: candidatePoint.x, y: candidatePoint.y });
						rightArray.push({ x: candidatePoint.x, y: candidatePoint.y });

						leftArray = this.CreateBezierPathPCOnly(leftArray, 70);
						leftArray.splice(Math.floor((1 - this._headPercentage) * 70), Number.MAX_VALUE);

						rightArray = this.CreateBezierPathPCOnly(rightArray, 70);
						rightArray.splice(Math.floor((1 - this._headPercentage) * 70), Number.MAX_VALUE);

						var headPath = this.CreateArrowHeadPathEx(leftArray[leftArray.length - 1], candidatePoint, rightArray[rightArray.length - 1], this._ptCollectionLen(tempArray, 0), this._headPercentage, 15);
						ring = [];
						ring = ring.concat(leftArray);
						ring = ring.concat(headPath);
						ring = ring.concat(rightArray.reverse());
						ring.push(ring[0]);
						//var la1 = { x: leftArray[0].x, y: leftArray[0].y };
						//ring.push(la1);

						//leftArray[0] = { x: (leftArray[0].x + leftArray[1].x) / 2, y: (leftArray[0].y + leftArray[1].y) / 2 };
						//leftArray.push({ x: (leftArray[leftArray.length - 1].x + candidatePoint.x) / 2, y: (leftArray[leftArray.length - 1].y + candidatePoint.y) / 2 });
						//ring = ring.concat(_Polyline.CreateBezierPathPCOnly(leftArray, 5));
						//ring.push(candidatePoint);
						//ring = ring.concat(this.CreateArrowHeadPath(leftArray[leftArray.length - 1], candidatePoint, rightArray[rightArray.length - 1], tempArray[tempArray.length - 2], this._ptCollectionLen(tempArray, 0), this._headPercentage, 26));
						//var rA1 = { x: rightArray[0].x, y: rightArray[0].y };
						//rightArray[0] = { x: (rightArray[0].x + rightArray[1].x) / 2, y: (rightArray[0].y + rightArray[1].y) / 2 };
						//rightArray.push({ x: (rightArray[rightArray.length - 1].x + candidatePoint.x) / 2, y: (rightArray[rightArray.length - 1].y + candidatePoint.y) / 2 });
						//ring = ring.concat(_Polyline.CreateBezierPathPCOnly(rightArray.reverse(), 5));
						//ring.push(rA1);
						//ring.push(ring[0]);
						map = this.map, result = new _Polygon(map.spatialReference);
						//!_Polygon.prototype.isClockwise(ring) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), ring.reverse());
						result.addRing(ring);
						tempGraphic.geometry = result;
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					break;
				case DrawEx.POLYLINEEX:
					if (this._points.length <= 1)
					{
						len = this._2PtLen(this._points[0], candidatePoint);
						k = Math.atan((this._points[0].y - candidatePoint.y) / (this._points[0].x - candidatePoint.x));
						switch (this.twoPtsRelationShip(this._points[0], candidatePoint))
						{
							case "ne":
								k += Math.PI / 2;
								break;
							case "nw":
								k += Math.PI * 3 / 2;
								break;
							case "sw":
								k += Math.PI * 3 / 2;
								break;
							case "se":
								k += Math.PI / 2;
								break;
						}
						//tail two points
						pt1 = { x: this._tailFactor * len * Math.cos(k) + this._points[0].x, y: this._tailFactor * len * Math.sin(k) + this._points[0].y };
						pt2 = { x: -1 * this._tailFactor * len * Math.cos(k) + this._points[0].x, y: -1 * this._tailFactor * len * Math.sin(k) + this._points[0].y };


						map = this.map, result = new _Polygon(map.spatialReference);
						ring = [];
						ring.push(pt1);
						ring.push(candidatePoint);
						ring.push(pt2);

						ring.push(pt1);
						!_Polygon.prototype.isClockwise(ring) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), ring.reverse());
						result.addRing(ring);
						tempGraphic.geometry = result;
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					else
					{
						tempArray = [], leftArray = [], rightArray = [];
						Array.forEach(this._points, function (e)
						{
							tempArray.push({ x: e.x, y: e.y });
						});
						tempArray.push({ x: candidatePoint.x, y: candidatePoint.y });
						var angleArray = this._vertexAngle(tempArray);
						for (i = 0, len = tempArray.length - 1; i < len; i++)
						{
							partialLen = this._ptCollectionLen(tempArray, i);
							//console.log(partialLen);

							pt1 = { x: (this._tailFactor + i / 18 / len) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: (this._tailFactor + i / 18 / len) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };
							pt2 = { x: -1 * (this._tailFactor + i / 18 / len) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: -1 * (this._tailFactor + i / 18 / len) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };

							leftArray.push(pt1);
							rightArray.push(pt2);


						}
						ring = [];
						ring = ring.concat(leftArray);
						ring.push(candidatePoint);
						ring = ring.concat(rightArray.reverse());
						ring.push(ring[0]);
						map = this.map, result = new _Polygon(map.spatialReference);
						!_Polygon.prototype.isClockwise(ring) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), ring.reverse());
						result.addRing(ring);
						tempGraphic.geometry = result;
						tempGraphic.setGeometry(tempGraphic.geometry);
					}
					break;

			}
		},
		_tailFactor: 0.05,
		_headPercentage: 0.07,
		_controlPointsUpdates: function (type, graphic, controlPoints)
		{
			switch (type)
			{
				case DrawEx.BEZIER_POLYGON:
					var tempArray = [];
					Array.forEach(controlPoints, function (e)
					{
						tempArray.push({ x: e.x, y: e.y });
					});
					graphic.geometry = this.CreateBezierPathPoly(tempArray, 130, this.map);
					graphic.setGeometry(graphic.geometry);
					break;
				case DrawEx.BEZIER_CURVE:
					var tempArray = [];
					Array.forEach(controlPoints, function (e)
					{
						tempArray.push({ x: e.x, y: e.y });
					});
					graphic.geometry = this.CreateBezierPath(tempArray, 100, this.map);
					graphic.setGeometry(graphic.geometry);
					break;
				case DrawEx.CURVE:
					var circle = this._circleDrawEx(this.map.toScreen(controlPoints[0]), this.map.toScreen(controlPoints[1]), this.map.toScreen(controlPoints[2]));
					if (circle.radius > 0)
					{

						graphic.geometry = this.CreateCircleSegmentFromThreePoints(circle, this.map.toScreen(controlPoints[0]), this.map.toScreen(controlPoints[1]), this.map.toScreen(controlPoints[2]), 60, this.map);
						graphic.setGeometry(graphic.geometry);
						//tempGraphic.setSymbol(this.fillSymbol);
					}
					break;
				case DrawEx.FREEHAND_ARROW:
					var tempArray = [], leftArray = [], rightArray = [];
					Array.forEach(controlPoints, function (e)
					{
						tempArray.push({ x: e.x, y: e.y });
					});
					//var summit = tempArray.pop();

					var angleArray = this._vertexAngle(tempArray), partialLen, pt1, pt2;
					var totalL = this._ptCollectionLen(tempArray, 0);
					for (var i = 0, len = tempArray.length - 1; i < len; i++)
					{
						partialLen = this._ptCollectionLen(tempArray, i);
						partialLen += totalL / 2.4;
						//console.log(partialLen);

						pt1 = { x: (this._tailFactor) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: (this._tailFactor) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };
						pt2 = { x: -1 * (this._tailFactor) * partialLen * Math.cos(angleArray[i]) + tempArray[i].x, y: -1 * (this._tailFactor) * partialLen * Math.sin(angleArray[i]) + tempArray[i].y };

						leftArray.push(pt1);
						rightArray.push(pt2);
					}
					leftArray.push({ x: tempArray[tempArray.length - 1].x, y: tempArray[tempArray.length - 1].y });
					rightArray.push({ x: tempArray[tempArray.length - 1].x, y: tempArray[tempArray.length - 1].y });

					leftArray = this.CreateBezierPathPCOnly(leftArray, 70);
					leftArray.splice(Math.floor((1 - this._headPercentage) * 70), Number.MAX_VALUE);

					rightArray = this.CreateBezierPathPCOnly(rightArray, 70);
					rightArray.splice(Math.floor((1 - this._headPercentage) * 70), Number.MAX_VALUE);

					var headPath = this.CreateArrowHeadPathEx(leftArray[leftArray.length - 1], { x: tempArray[tempArray.length - 1].x, y: tempArray[tempArray.length - 1].y }, rightArray[rightArray.length - 1], this._ptCollectionLen(tempArray, 0), this._headPercentage, 15);
					ring = [];
					ring = ring.concat(leftArray);
					ring = ring.concat(headPath);
					ring = ring.concat(rightArray.reverse());
					ring.push(ring[0]);

					var map = this.map, result = new _Polygon(map.spatialReference);
					//!_Polygon.prototype.isClockwise(ring) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), ring.reverse());
					result.addRing(ring);
					graphic.geometry = result;
					graphic.setGeometry(graphic.geometry);
					break;
				default:
					break;
			}

		},

		_onMouseDragHandler: function (inputPt)
		{
			if (_has("esri-touch") && !this._points.length) inputPt.preventDefault();
			else
			{
				this._dragged = !0;
				var snappingPt;
				this.map.snappingManager && (snappingPt = this.map.snappingManager._snappingPoint);
				var firstPt = this._points[0];
				var candidate = snappingPt || inputPt.mapPoint;
				var map = this.map;
				var spatialReference = map.spatialReference;
				var tempGraphic = this._graphic;
				var Draw = DrawEx, firstPtScreen = map.toScreen(firstPt);
				var candidateScreen = map.toScreen(candidate);
				var widthScreen = candidateScreen.x - firstPtScreen.x;
				var heightScreen = candidateScreen.y - firstPtScreen.y;
				var sideScreen = Math.sqrt(widthScreen * widthScreen + heightScreen * heightScreen);
				switch (this._geometryType)
				{
					case Draw.CIRCLE:
						this._hideTooltip();
						tempGraphic.geometry = _Polygon.createCircle({ center: firstPtScreen, r: sideScreen, numberOfPoints: 60, map: map });
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.ELLIPSE:
						this._hideTooltip();
						tempGraphic.geometry = _Polygon.createEllipse({
							                                              center: firstPtScreen,
							                                              longAxis: widthScreen, shortAxis: heightScreen, numberOfPoints: 60, map: map
						                                              });
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.TRIANGLE:
						this._hideTooltip();
						widthScreen = [
							[0, -sideScreen],
							[0.8660254037844386 * sideScreen, 0.5 * sideScreen],
							[-0.8660254037844386 * sideScreen, 0.5 * sideScreen],
							[0, -sideScreen]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.ARROW:
						this._hideTooltip();
						//							       var heightRatio = heightScreen / sideScreen;
						//							       var widthRatio = widthScreen / sideScreen;
						//							       var sideScreenQuarter = 0.25 * widthRatio * sideScreen;
						//							       var sideQuarterMultiHWratio = 0.25 * sideScreen / (heightScreen / widthScreen);
						//							       sideScreen *= 0.25 * heightRatio;
						//							       widthScreen = [
						//								       [widthScreen, heightScreen],
						//								       [widthScreen - sideScreenQuarter * (1 + 24 / sideQuarterMultiHWratio), heightScreen + 24 * widthRatio - sideScreen],
						//								       [widthScreen - sideScreenQuarter * (1 + 12 / sideQuarterMultiHWratio), heightScreen + 12 * widthRatio - sideScreen],
						//								       [-12 * heightRatio, 12 * widthRatio],
						//								       [12 * heightRatio, -12 * widthRatio],
						//								       [widthScreen - sideScreenQuarter * (1 - 12 / sideQuarterMultiHWratio), heightScreen - 12 * widthRatio - sideScreen],
						//								       [widthScreen - sideScreenQuarter * (1 - 24 / sideQuarterMultiHWratio), heightScreen - 24 * widthRatio - sideScreen],
						//								       [widthScreen, heightScreen]
						//							       ];

						var heightRatio = heightScreen / sideScreen;
						var widthRatio = widthScreen / sideScreen;
						var sideScreenQuarter = 0.25 * widthRatio * sideScreen;
						var sideQuarterMultiHWratio = 0.25 * sideScreen / (heightScreen / widthScreen);
						sideScreen *= 0.25 * heightRatio;
						var sideQuarterMultiHWratio2 = sideScreen;
						widthScreen = [
							[widthScreen, heightScreen],
							[widthScreen - sideScreenQuarter * (1 + 24 / sideQuarterMultiHWratio), heightScreen + 24 * widthRatio - sideQuarterMultiHWratio2],
							[widthScreen - sideScreenQuarter * (1 + 12 / sideQuarterMultiHWratio), heightScreen + 12 * widthRatio - sideQuarterMultiHWratio2],
							[-12 * heightRatio, 12 * widthRatio],
							[12 * heightRatio, -12 * widthRatio],
							[widthScreen - sideScreenQuarter * (1 - 12 / sideQuarterMultiHWratio), heightScreen - 12 * widthRatio - sideQuarterMultiHWratio2],
							[widthScreen - sideScreenQuarter * (1 - 24 / sideQuarterMultiHWratio), heightScreen - 24 * widthRatio - sideQuarterMultiHWratio2],
							[widthScreen, heightScreen]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.LEFT_ARROW:
						this._hideTooltip();
						widthScreen = 0 >= widthScreen ? [
							[widthScreen, 0],
							[0.75 * widthScreen, heightScreen],
							[0.75 * widthScreen, 0.5 * heightScreen],
							[0, 0.5 * heightScreen],
							[0, -0.5 * heightScreen],
							[0.75 * widthScreen, -0.5 * heightScreen],
							[0.75 * widthScreen, -heightScreen],
							[widthScreen, 0]
						] : [
							[0, 0],
							[0.25 * widthScreen, heightScreen],
							[0.25 * widthScreen, 0.5 * heightScreen],
							[widthScreen, 0.5 * heightScreen],
							[widthScreen, -0.5 * heightScreen],
							[0.25 * widthScreen, -0.5 * heightScreen],
							[0.25 * widthScreen, -heightScreen],
							[0, 0]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.RIGHT_ARROW:
						this._hideTooltip();
						widthScreen = 0 <= widthScreen ? [
							[widthScreen, 0],
							[0.75 * widthScreen, heightScreen],
							[0.75 * widthScreen, 0.5 * heightScreen],
							[0, 0.5 * heightScreen],
							[0, -0.5 * heightScreen],
							[0.75 * widthScreen, -0.5 * heightScreen],
							[0.75 * widthScreen, -heightScreen],
							[widthScreen, 0]
						] : [
							[0, 0],
							[0.25 * widthScreen, heightScreen],
							[0.25 * widthScreen, 0.5 * heightScreen],
							[widthScreen, 0.5 * heightScreen],
							[widthScreen, -0.5 * heightScreen],
							[0.25 * widthScreen, -0.5 * heightScreen],
							[0.25 * widthScreen, -heightScreen],
							[0, 0]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.UP_ARROW:
						this._hideTooltip();
						widthScreen = 0 >= heightScreen ? [
							[0, heightScreen],
							[-widthScreen, 0.75 * heightScreen],
							[-0.5 * widthScreen, 0.75 * heightScreen],
							[-0.5 * widthScreen, 0],
							[0.5 * widthScreen, 0],
							[0.5 * widthScreen, 0.75 * heightScreen],
							[widthScreen, 0.75 * heightScreen],
							[0, heightScreen]
						] : [
							[0, 0],
							[-widthScreen, 0.25 * heightScreen],
							[-0.5 * widthScreen, 0.25 * heightScreen],
							[-0.5 * widthScreen, heightScreen],
							[0.5 * widthScreen, heightScreen],
							[0.5 * widthScreen, 0.25 * heightScreen],
							[widthScreen, 0.25 * heightScreen],
							[0, 0]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.DOWN_ARROW:
						this._hideTooltip();
						widthScreen = 0 <= heightScreen ? [
							[0, heightScreen],
							[-widthScreen, 0.75 * heightScreen],
							[-0.5 * widthScreen, 0.75 * heightScreen],
							[-0.5 * widthScreen, 0],
							[0.5 * widthScreen, 0],
							[0.5 * widthScreen, 0.75 * heightScreen],
							[widthScreen, 0.75 * heightScreen],
							[0, heightScreen]
						] : [
							[0, 0],
							[-widthScreen, 0.25 * heightScreen],
							[-0.5 * widthScreen, 0.25 * heightScreen],
							[-0.5 * widthScreen, heightScreen],
							[0.5 * widthScreen, heightScreen],
							[0.5 * widthScreen, 0.25 * heightScreen],
							[widthScreen, 0.25 * heightScreen],
							[0, 0]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.RECTANGLE:
						this._hideTooltip();
						widthScreen = [
							[0, 0],
							[widthScreen, 0],
							[widthScreen, heightScreen],
							[0, heightScreen],
							[0, 0]
						];
						tempGraphic.geometry = this._toPolygon(widthScreen, firstPtScreen.x, firstPtScreen.y);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.LINE:
						tempGraphic.setGeometry(_lang.mixin(tempGraphic.geometry, {
							paths: [
								[
									[firstPt.x, firstPt.y],
									[candidate.x, candidate.y]
								]
							]
						}));
						break;
					case Draw.EXTENT:
						tempGraphic && map.graphics.remove(tempGraphic, !0);
						tempGraphic = new _Rect(this._normalizeRect(firstPt, candidate, spatialReference));
						tempGraphic._originOnly = !0;
						this._graphic = map.graphics.add(new graphic(tempGraphic, this.fillSymbol), !0);
						map.snappingManager && map.snappingManager._setGraphic(this._graphic);
						break;
					case Draw.FREEHAND_POLYLINE:
						this._hideTooltip();
						if (!1 === this._canDrawFreehandPoint(inputPt))
						{
							_has("esri-touch") && inputPt.preventDefault();
							return
						}
						this._points.push(inputPt.mapPoint.offset(0, 0));
						tempGraphic.geometry._insertPoints([candidate.offset(0, 0)], 0);
						tempGraphic.setGeometry(tempGraphic.geometry);
						break;
					case Draw.FREEHAND_POLYGON:
						this._hideTooltip();
						if (!1 === this._canDrawFreehandPoint(inputPt))
						{
							_has("esri-touch") && inputPt.preventDefault();
							return
						}
						this._points.push(inputPt.mapPoint.offset(0, 0));
						tempGraphic.geometry._insertPoints([candidate.offset(0, 0)], 0);
						tempGraphic.setGeometry(tempGraphic.geometry)
				}
				_has("esri-touch") && inputPt.preventDefault()
			}
		},
		_canDrawFreehandPoint: function (b)
		{
			if (!this._oldPoint) return !1;
			var a = this._oldPoint.x - b.screenPoint.x, c = this._oldPoint.y - b.screenPoint.y, d = this._options.tolerance;
			if ((0 > a ? -1 * a : a) < d && (0 > c ? -1 * c : c) < d) return !1;
			a = new Date;
			if (a - this._startTime < this._options.drawTime) return !1;
			this._startTime = a;
			this._oldPoint = b.screenPoint;
			return !0
		},
		_onMouseUpHandler: function (b)
		{
			if (this._dragged)
			{
				0 === this._points.length && this._points.push(b.mapPoint.offset(0, 0));
				var a;
				this.map.snappingManager && (a = this.map.snappingManager._snappingPoint);
				var c = this._points[0];
				a = a || b.mapPoint;
				var d = this.map.spatialReference, g = DrawEx, k;
				switch (this._geometryType)
				{
					case g.CIRCLE:
					case g.ELLIPSE:
					case g.TRIANGLE:
					case g.ARROW:
					case g.LEFT_ARROW:
					case g.RIGHT_ARROW:
					case g.UP_ARROW:
					case g.DOWN_ARROW:
					case g.RECTANGLE:
						k = this._graphic.geometry;
						break;
					case g.LINE:
						k = new _Polyline({
							                  paths: [
								                  [
									                  [c.x, c.y],
									                  [a.x, a.y]
								                  ]
							                  ], spatialReference: d
						                  });
						break;
					case g.EXTENT:
						k = (new _Rect(this._normalizeRect(c, a, d))).getExtent();
						break;
					case g.FREEHAND_POLYLINE:
						k = new _Polyline(d);
						k.addPath([].concat(this._points, [a.offset(0, 0)]));
						break;
					case g.FREEHAND_POLYGON:
						k = new _Polygon(d), c = [].concat(this._points, [a.offset(0, 0), this._points[0].offset(0, 0)]), !_Polygon.prototype.isClockwise(c) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), c.reverse()), k.addRing(c)
				}
				_has("esri-touch") && b.preventDefault();
				this._clear();
				this._drawEnd(k)
			}
			else this._clear()
		},

		//point  multi-point
		_onClickHandler: function (clickPoint)
		{
			var snappingPoint;
			this.map.snappingManager && (snappingPoint = this.map.snappingManager._snappingPoint);
			clickPoint = snappingPoint || clickPoint.mapPoint;
			var map = this.map;
			var screenPt = map.toScreen(clickPoint), Draw = DrawEx;
			this._points.push(clickPoint.offset(0, 0));
			switch (this._geometryType)
			{
				case Draw.POINT:
					this._drawEnd(clickPoint.offset(0, 0));
					this._setTooltipMessage(0);
					break;
				case Draw.POLYLINE:
					if (1 === this._points.length)
					{
						screenPt = new _Polyline(map.spatialReference);
						screenPt.addPath(this._points);
						this._graphic = map.graphics.add(new graphic(screenPt, this.lineSymbol), !0);
						map.snappingManager && map.snappingManager._setGraphic(this._graphic);
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
						this._tGraphic = map.graphics.add(new graphic(new _Polyline({
							                                                            paths: [
								                                                            [
									                                                            [clickPoint.x, clickPoint.y],
									                                                            [clickPoint.x, clickPoint.y]
								                                                            ]
							                                                            ], spatialReference: map.spatialReference
						                                                            }), this.lineSymbol), !0);
					}
					else
					{
						this._graphic.geometry._insertPoints([clickPoint.offset(0, 0)], 0);
						this._graphic.setGeometry(this._graphic.geometry).setSymbol(this.lineSymbol);
						map = this._tGraphic, screenPt = map.geometry;
						screenPt.setPoint(0, 0, clickPoint.offset(0, 0));
						screenPt.setPoint(0, 1, clickPoint.offset(0, 0));
						map.setGeometry(screenPt);
					}
					break;
				case Draw.POLYLINEEX:
					if (this._points.length === 1)
					{


						this._tGraphic = map.graphics.add(new graphic(new _Polygon({
							                                                           rings: [
								                                                           [
									                                                           [clickPoint.x, clickPoint.y],
									                                                           [clickPoint.x, clickPoint.y]
								                                                           ]
							                                                           ], spatialReference: map.spatialReference
						                                                           }), this.fillSymbol), !0);
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
					}
					break;
				case Draw.POLYGON:
					if (1 === this._points.length)
					{
						Draw = new _Polygon(map.spatialReference);
						Draw.addRing(this._points);
						this._graphic = map.graphics.add(new graphic(Draw, this.fillSymbol), !0);
						map.snappingManager && map.snappingManager._setGraphic(this._graphic);
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
						this._tGraphic = map.graphics.add(new graphic(new _Polyline({
							                                                            paths: [
								                                                            [
									                                                            [clickPoint.x, clickPoint.y],
									                                                            [clickPoint.x, clickPoint.y]
								                                                            ]
							                                                            ], spatialReference: map.spatialReference
						                                                            }), this.fillSymbol), !0);
					}
					else
					{
						this._graphic.geometry._insertPoints([clickPoint.offset(0, 0)], 0);
						this._graphic.setGeometry(this._graphic.geometry).setSymbol(this.fillSymbol);
						map = this._tGraphic;
						screenPt = map.geometry;
						screenPt.setPoint(0, 0, clickPoint.offset(0, 0));
						screenPt.setPoint(0, 1, clickPoint.offset(0, 0));
						map.setGeometry(screenPt);
					}
					break;
				case Draw.MULTI_POINT:
					clickPoint = this._points;
					//1 === clickPoint.length ? () : ();
					if (clickPoint.length === 1)
					{
						var multiPoint = new _Multipoint(map.spatialReference);
						multiPoint.addPoint(clickPoint[clickPoint.length - 1]);
						this._graphic = map.graphics.add(new graphic(multiPoint, this.markerSymbol), !0);
						map.snappingManager && map.snappingManager._setGraphic(this._graphic);
					}
					else
					{
						this._graphic.geometry.addPoint(clickPoint[clickPoint.length - 1]);
						this._graphic.setGeometry(this._graphic.geometry).setSymbol(this.markerSymbol);
					}
					//if(!this._globalCnt) {this._globalCnt = 1; console.log(this._globalCnt);}
					//else {this._globalCnt++;console.log(this._globalCnt);}
					break;
				case Draw.ARROW:
					clickPoint = [
						[0, 0],
						[-24, 24],
						[-24, 12],
						[-96, 12],
						[-96, -12],
						[-24, -12],
						[-24, -24],
						[0, 0]
					];
					var screenX = screenPt.x;
					var screenY = screenPt.y;
					this._addShape(clickPoint, screenX, screenY);
					break;
				case Draw.LEFT_ARROW:
					clickPoint = [
						[0, 0],
						[24, 24],
						[24, 12],
						[96, 12],
						[96, -12],
						[24, -12],
						[24, -24],
						[0, 0]
					];
					map = screenPt.x;
					screenPt = screenPt.y;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.RIGHT_ARROW:
					clickPoint = [
						[0, 0],
						[-24, 24],
						[-24, 12],
						[-96, 12],
						[-96, -12],
						[-24, -12],
						[-24, -24],
						[0, 0]
					];
					map = screenPt.x;
					screenPt = screenPt.y;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.UP_ARROW:
					clickPoint = [
						[0, 0],
						[-24, 24],
						[-12, 24],
						[-12, 96],
						[12, 96],
						[12, 24],
						[24, 24],
						[0, 0]
					];
					map = screenPt.x;
					screenPt = screenPt.y;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.DOWN_ARROW:
					clickPoint = [
						[0, 0],
						[-24, -24],
						[-12, -24],
						[-12, -96],
						[12, -96],
						[12, -24],
						[24, -24],
						[0, 0]
					];
					map = screenPt.x;
					screenPt = screenPt.y;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.TRIANGLE:
					clickPoint = [
						[0, -48],
						[41.56921938165306, 24],
						[-41.56921938165306, 24],
						[0, -48]
					];
					map = screenPt.x;
					screenPt = screenPt.y;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.RECTANGLE:
					clickPoint = [
						[0, -96],
						[96, -96],
						[96, 0],
						[0, 0],
						[0, -96]
					];
					map = screenPt.x - 48;
					screenPt = screenPt.y + 48;
					this._addShape(clickPoint, map, screenPt);
					break;
				case Draw.CIRCLE:
					var geometry = new _Polygon(map.spatialReference);
					this._graphic = map.graphics.add(new graphic(geometry, this.fillSymbol), !0);
					this._graphic.geometry = _Polygon.createCircle({
						                                               center: screenPt, r: 48, numberOfPoints: 60,
						                                               map: map
					                                               });
					this._graphic.setGeometry(this._graphic.geometry);

					this._drawEnd(this._graphic.geometry);
					break;
				case Draw.ELLIPSE:
					Draw = new _Polygon(map.spatialReference), this._graphic = map.graphics.add(new graphic(Draw, this.fillSymbol), !0), this._graphic.geometry = _Polygon.createEllipse({ center: screenPt, longAxis: 48, shortAxis: 24, numberOfPoints: 60, map: map }), this._graphic.setGeometry(this._graphic.geometry), this._drawEnd(this._graphic.geometry);
					break;
				case Draw.CURVE:
					if (this._points.length === 1)
					{
						this._tGraphic = map.graphics.add(new graphic(new _Polyline({
							                                                            paths: [
								                                                            [
									                                                            [clickPoint.x, clickPoint.y],
									                                                            [clickPoint.x, clickPoint.y]
								                                                            ]
							                                                            ], spatialReference: map.spatialReference
						                                                            }), this.lineSymbol), !0);

						//this._drawEnd(this._graphic.geometry);
						//this._curveOnDraw = true;
						this._curvePt1 = this._points[this._points.length - 1];
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
					}
					else if (this._points.length === 2)
					{
						this._curvePt2 = this._points[this._points.length - 1];
					}
					//console.log("curve click event");

					break;
				case Draw.BEZIER_CURVE:
					if (this._points.length === 1)
					{

						this._tGraphic = map.graphics.add(new graphic(new _Polyline({
							                                                            paths: [
								                                                            [
									                                                            [clickPoint.x, clickPoint.y],
									                                                            [clickPoint.x, clickPoint.y]
								                                                            ]
							                                                            ], spatialReference: map.spatialReference
						                                                            }), this.lineSymbol), !0);

						//this._drawEnd(this._graphic.geometry);
						//this._curveOnDraw = true;
						//this._curvePt1 = this._points[this._points.length - 1];
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
					}
					//						       else
					//						       {
					//							       this._curvePt1 = this._points[this._points.length - 1];
					//						       }
					break;
				case Draw.BEZIER_POLYGON:
					if (this._points.length === 1)
					{


						this._tGraphic = map.graphics.add(new graphic(new _Polygon({
							                                                           rings: [
								                                                           [
									                                                           [clickPoint.x, clickPoint.y],
									                                                           [clickPoint.x, clickPoint.y]
								                                                           ]
							                                                           ], spatialReference: map.spatialReference
						                                                           }), this.fillSymbol), !0);
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
					}
					break;
				case Draw.FREEHAND_ARROW:
					if (this._points.length === 1)
					{
						this._tGraphic = map.graphics.add(new graphic(new _Polygon({
							                                                           rings: [
								                                                           [
									                                                           [clickPoint.x, clickPoint.y],
									                                                           [clickPoint.x, clickPoint.y]
								                                                           ]
							                                                           ], spatialReference: map.spatialReference
						                                                           }), this.fillSymbol), !0);
						this._onMouseMoveHandler_connect = _connect.connect(map, "onMouseMove", this._onMouseMoveHandler);
					}
					break;
			}
			this._setTooltipMessage(this._points.length)
		},
		_addShape: function (pointCollection, screenPtX, screenPtY)
		{
			var graphicTempAdd = this.map.graphics.add(new graphic(this._toPolygon(pointCollection, screenPtX, screenPtY), this.fillSymbol), !0);
			this._setTooltipMessage(0);
			var d;
			graphicTempAdd && (d = jsonUtility.fromJson(graphicTempAdd.geometry.toJson()), this.map.graphics.remove(graphicTempAdd, !0));
			this._drawEnd(d)
		},
		_toPolygon: function (pointCollection, screenPtX, screenPtY)
		{
			var map = this.map, result = new _Polygon(map.spatialReference);
			result.addRing(Array.map(pointCollection, function (b)
			{
				return map.toMap({ x: b[0] + screenPtX, y: b[1] + screenPtY })
			}));
			return result
		},
		_toPolygonPath: function (pointCollection, screenPtX, screenPtY)
		{
			return Array.map(pointCollection, function (b)
			{
				return this.map.toMap({ x: b[0] + screenPtX, y: b[1] + screenPtY });
			});

		},

		//multi-points curve
		_onDblClickHandler: function (clickPoint)
		{
			//console.log("i'm here!");
			var geometry, _points = this._points, spatialReference = this.map.spatialReference, Draw = DrawEx;
			_has("esri-touch") && _points.push(clickPoint.mapPoint);
			_points = _points.slice(0, _points.length);
			switch (this._geometryType)
			{
				case Draw.POLYLINE:
					if (!this._graphic || 2 > _points.length)
					{
						_connect.disconnect(this._onMouseMoveHandler_connect);
						this._clear();
						this._onClickHandler(clickPoint);
						return;
					}
					geometry = new _Polyline(spatialReference);
					geometry.addPath([].concat(_points));
					break;
				case Draw.POLYGON:
					if (!this._graphic || 2 > _points.length)
					{
						_connect.disconnect(this._onMouseMoveHandler_connect);
						this._clear();
						this._onClickHandler(clickPoint);
						return;
					}
					geometry = new _Polygon(spatialReference);
					clickPoint = [].concat(_points, [_points[0].offset(0, 0)]);
					!_Polygon.prototype.isClockwise(clickPoint) && !this.respectDrawingVertexOrder && (console.debug(this.declaredClass + " :  Polygons drawn in anti-clockwise direction will be reversed to be clockwise."), clickPoint.reverse());
					geometry.addRing(clickPoint);
					break;
				case Draw.MULTI_POINT:
					geometry = new _Multipoint(spatialReference);
					//console.log("double click");
					Array.forEach(_points, function (pt)
					{
						geometry.addPoint(pt)
					});
					//geometry.removePoint(_points.length - 1);
					break;
				case Draw.CURVE:
					if (_points.length > 2)
					{
						geometry = this._tGraphic.geometry;
						var controlPts = _lang.clone(this._points);
						geometry.controlPoints = controlPts;
						geometry.drawExtendType = "curve";
					}
					//console.log("curve double click");
					//_connect.disconnect(this._onClickHandler);
					//geometry.addPath([].concat(_points));
					break;
				case Draw.BEZIER_CURVE:

					if (_points.length > 2)
					{
						geometry = this._tGraphic.geometry;
						var controlPts = _lang.clone(this._points);
						geometry.controlPoints = controlPts;
						geometry.drawExtendType = "beziercurve";
					}

					//_connect.disconnect(this._onClickHandler);
					//geometry.addPath([].concat(_points));
					break;
				case Draw.BEZIER_POLYGON:
					if (_points.length > 2)
					{
						geometry = this._tGraphic.geometry;
						var controlPts = _lang.clone(this._points);
						geometry.controlPoints = controlPts;
						geometry.drawExtendType = "bezierpolygon";
					}
					break;
				case Draw.FREEHAND_ARROW:
					if (_points.length > 1)
					{
						geometry = this._tGraphic.geometry;
						var controlPts = _lang.clone(this._points);
						geometry.controlPoints = controlPts;
						geometry.drawExtendType = "freehandarrow";
					}
					break;
				case Draw.POLYLINEEX:
					if (_points.length > 1)
					{
						geometry = this._tGraphic.geometry;
					}
					break;
			}
			_connect.disconnect(this._onMouseMoveHandler_connect);
			this._clear();
			this._setTooltipMessage(0);
			this._drawEnd(geometry)
		},
		_onKeyDownHandler: function (b)
		{
			b.keyCode === _keys.ESCAPE && (_connect.disconnect(this._onMouseMoveHandler_connect), this._clear(), this._setTooltipMessage(0))
		},
		_toggleTooltip: function (b)
		{
			this._options.showTooltips && (b ? this._tooltip || (this._tooltip = _domconstruct.create("div", { "class": "tooltip" }, this.map.container), this._tooltip.style.display = "none", this._tooltip.style.position = "fixed", this._setTooltipMessage(0), this._onTooltipMouseEnterHandler_connect = _connect.connect(this.map, "onMouseOver", this._updateTooltip), this._onTooltipMouseLeaveHandler_connect = _connect.connect(this.map, "onMouseOut", this._hideTooltip), this._onTooltipMouseMoveHandler_connect = _connect.connect(this.map, "onMouseMove", this._updateTooltip)) : this._tooltip && (_connect.disconnect(this._onTooltipMouseEnterHandler_connect), _connect.disconnect(this._onTooltipMouseLeaveHandler_connect), _connect.disconnect(this._onTooltipMouseMoveHandler_connect), _domconstruct.destroy(this._tooltip), this._tooltip = null))
		},
		_hideTooltip: function ()
		{
			var b = this._tooltip;
			b && (b.style.display = "none")
		},
		_setTooltipMessage: function (numberOfPts)
		{
			var mapTooltip = this._tooltip;
			if (mapTooltip)
			{
				var text = "";
				switch (this._geometryType)
				{
					case DrawEx.POINT:
						text = _dojoEsrijsapi.toolbars.draw.addPoint;
						break;
					case DrawEx.ARROW:
					case DrawEx.LEFT_ARROW:
					case DrawEx.RIGHT_ARROW:
					case DrawEx.UP_ARROW:
					case DrawEx.DOWN_ARROW:
					case DrawEx.TRIANGLE:
					case DrawEx.RECTANGLE:
					case DrawEx.CIRCLE:
					case DrawEx.ELLIPSE:
						text = _dojoEsrijsapi.toolbars.draw.addShape;
						break;
					case DrawEx.LINE:
					case DrawEx.EXTENT:
					case DrawEx.FREEHAND_POLYLINE:
					case DrawEx.FREEHAND_POLYGON:
						text = _dojoEsrijsapi.toolbars.draw.freehand;
						break;
					case DrawEx.POLYLINE:
					case DrawEx.POLYGON:
						text = _dojoEsrijsapi.toolbars.draw.start;
						if (numberOfPts === 1)
							text = _dojoEsrijsapi.toolbars.draw.resume;
						else if (numberOfPts >= 2)
							text = _dojoEsrijsapi.toolbars.draw.complete;
						//1 === numberOfPts ? text = _dojoEsrijsapi.toolbars.draw.resume : 2 <= numberOfPts && (text = _dojoEsrijsapi.toolbars.draw.complete);
						break;
					case DrawEx.MULTI_POINT:
						text = _dojoEsrijsapi.toolbars.draw.addMultipoint;
						if (numberOfPts >= 1)
							text = _dojoEsrijsapi.toolbars.draw.finish;
						break;
					case DrawEx.CURVE:
						text = "单击开始绘制";
						if (numberOfPts === 1)
							text = "单击继续添加锚点";
						else if (numberOfPts > 1)
							text = "双击结束绘制";
						break;
					case DrawEx.BEZIER_CURVE:
						text = "单击开始绘制";
						if (numberOfPts > 1)
							text = "单击继续添加锚点，双击结束绘制";

						break;
					case DrawEx.BEZIER_POLYGON:
					case DrawEx.FREEHAND_ARROW:
						text = "单击开始绘制";
						if (numberOfPts > 1)
							text = "单击继续添加锚点，双击结束绘制";

						break;
				}
				mapTooltip.innerHTML = text
			}
		},
		_updateTooltip: function (b)
		{
			var a = this._tooltip;
			if (a)
			{
				var c;
				b.clientX || b.pageY ? (c = b.clientX, b = b.clientY) : (c = b.clientX + _window.body().scrollLeft - _window.body().clientLeft, b = b.clientY + _window.body().scrollTop - _window.body().clientTop);
				a.style.display = "none";
				_domstyle.set(a, {
					left: c + this._options.tooltipOffset + "px", top: b + "px"
				});
				a.style.display = ""
			}
		},
		_redrawGraphic: function (b, a, c, d)
		{
			if (c || this.map.wrapAround180) (b = this._graphic) && b.setGeometry(b.geometry), (b = this._tGraphic) && b.setGeometry(b.geometry)
		},
		onActivate: function ()
		{
		},
		onDeactivate: function ()
		{
		},
		onDrawComplete: function ()
		{
		},
		onDrawEnd: function ()
		{
		},
		//drawEx caculate radius for curve between two points
		_circleDrawEx: function (pt1, pt2, pt3)
		{
			var i;
			var r, m11, m12, m13, m14;
			var a = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];
			var P = [
				[pt1.x, pt1.y],
				[pt2.x, pt2.y],
				[pt3.x, pt3.y]
			];
			for (i = 0; i < 3; i++)                    // find minor 11
			{
				a[i][0] = P[i][0];
				a[i][1] = P[i][1];
				a[i][2] = 1;
			}
			m11 = this._determinantDrawEx(a, 3);

			for (i = 0; i < 3; i++)                    // find minor 12
			{
				a[i][0] = P[i][0] * P[i][0] + P[i][1] * P[i][1];
				a[i][1] = P[i][1];
				a[i][2] = 1;
			}
			m12 = this._determinantDrawEx(a, 3);

			for (i = 0; i < 3; i++)                    // find minor 13
			{
				a[i][0] = P[i][0] * P[i][0] + P[i][1] * P[i][1];
				a[i][1] = P[i][0];
				a[i][2] = 1;
			}
			m13 = this._determinantDrawEx(a, 3);

			for (i = 0; i < 3; i++)                    // find minor 14
			{
				a[i][0] = P[i][0] * P[i][0] + P[i][1] * P[i][1];
				a[i][1] = P[i][0];
				a[i][2] = P[i][1];
			}
			m14 = this._determinantDrawEx(a, 3);

			if (m11 == 0)
			{
				r = 0;                                 // not a circle
			}
			else
			{
				var Xo = 0.5 * m12 / m11;                 // center of circle
				var Yo = -0.5 * m13 / m11;
				r = Math.sqrt(Xo * Xo + Yo * Yo + m14 / m11);
			}

			return { radius: r, center: { x: Xo, y: Yo } };                                  // the radius
		},

		// Recursive definition of determinate using expansion by minors.
		_determinantDrawEx: function (a, n)
		{
			var i, j, j1, j2;
			var d = 0;
			var m = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];

			if (n == 2)                                // terminate recursion
			{
				d = a[0][0] * a[1][1] - a[1][0] * a[0][1];
			}
			else
			{
				d = 0;
				for (j1 = 0; j1 < n; j1++)            // do each column
				{
					for (i = 1; i < n; i++)            // create minor
					{
						j2 = 0;
						for (j = 0; j < n; j++)
						{
							if (j == j1) continue;
							m[i - 1][j2] = a[i][j];
							j2++;
						}
					}

					// sum (+/-)cofactor * minor
					d = d + Math.pow(-1.0, j1) * a[0][j1] * this._determinantDrawEx(m, n - 1);
				}
			}

			return d;
		},
		CreateCircleSegmentFromThreePoints: function (circle, pt1, pt2, pt3, numberOfPts, map)
		{
			//		var centerX = ellipseObject.center.x, centerY = ellipseObject.center.y, longAxis = ellipseObject.longAxis, shortAxis = ellipseObject.shortAxis, numberOfPoints = ellipseObject.numberOfPoints, map = ellipseObject.map, f, i, m;
			//		var ring = [];
			//		var angle = 2 * Math.PI / numberOfPoints;
			//		for (i = 0; i < numberOfPoints; i++)
			//		{
			//			f = Math.cos(i * angle), m = Math.sin(i * angle), f = map.toMap({x: longAxis * f + centerX, y: shortAxis * m + centerY}), ring.push(f);
			//		}
			//		ring.push(ring[0]);
			//		centerX = new l(map.spatialReference);
			//		centerX.addRing(ring);
			//		return centerX
			var center = circle.center, radius = circle.radius, path = [];
			pt1.x -= center.x;
			pt1.y -= center.y;
			pt2.x -= center.x;
			pt2.y -= center.y;
			pt3.x -= center.x;
			pt3.y -= center.y;
			var anglePt1 = Math.atan2(pt1.y, pt1.x), anglePt2 = Math.atan2(pt2.y, pt2.x), anglePt3 = Math.atan2(pt3.y, pt3.x);
			anglePt1 = anglePt1 < 0 ? 2 * Math.PI + anglePt1 : anglePt1;
			anglePt2 = anglePt2 < 0 ? 2 * Math.PI + anglePt2 : anglePt2;
			anglePt3 = anglePt3 < 0 ? 2 * Math.PI + anglePt3 : anglePt3;
			var startAngle = Math.min(anglePt1, anglePt2);
			var endAngle = Math.max(anglePt1, anglePt2);
			var swipeAngle = endAngle - startAngle;
			if (anglePt3 < startAngle || anglePt3 > endAngle)
			{
				swipeAngle -= (2 * Math.PI);
			}
			var angle = swipeAngle / numberOfPts, pt;
			for (var i = 0; i <= numberOfPts; i++)
			{
				pt = map.toMap({ x: radius * Math.cos(startAngle + i * angle) + center.x, y: radius * Math.sin(startAngle + i * angle) + center.y });
				path.push(pt);
			}
			//var firstPt = map.toMap({x: radius * Math.cos(startAngle) + center.x, y: radius * Math.sin(startAngle) + center.y});
			//var lastPt = map.toMap({x: radius * Math.cos(endAngle) + center.x, y: radius * Math.sin(endAngle) + center.y});
			//path.splice(0, 0, firstPt);
			//path.push(lastPt);
			var result = new _Polyline(map.spatialReference);
			result.addPath(path);
			return result;

		},
		CreateBezierPath: function (pointCollection, numberOfPts, map)
		{
			var position = { x: pointCollection[0].x, y: pointCollection[0].y };
			if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
			{
				pointCollection.pop();
			}
			if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
			{
				pointCollection.pop();
			}
			//pointCollection.push(pt);
			var tween = TweenMax.to(position, numberOfPts, { bezier: pointCollection, ease: Linear.easeNone });
			//ease:Power1.easeInOut  ease: Linear.easeNone
			var path = [];
			for (var i = 0; i <= numberOfPts; i++)
			{
				tween.time(i);
				path.push({ x: position.x, y: position.y });
			}
			var result = new _Polyline(map.spatialReference);
			result.addPath(path);
			return result;

		},
		CreateBezierPathPCOnly: function (pointCollection, numberOfPts)
		{
			var position = { x: pointCollection[0].x, y: pointCollection[0].y };
			if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
			{
				pointCollection.pop();
			}
			if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
			{
				pointCollection.pop();
			}
			//pointCollection.push(pt);
			var tween = TweenMax.to(position, numberOfPts, { bezier: pointCollection, ease: Linear.easeNone });
			//ease:Power1.easeInOut  ease: Linear.easeNone
			var path = [];
			for (var i = 0; i <= numberOfPts; i++)
			{
				tween.time(i);
				path.push({ x: position.x, y: position.y });
			}

			return path;

		},
		_2PtLen: function (pt1, pt2)
		{
			return Math.sqrt((pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y));
		},
		_ptCollectionLen: function (ptc, startIndex)
		{
			var len = 0;
			for (var i = startIndex, pathLen = ptc.length - 1; i < pathLen; i++)
			{
				len += this._2PtLen(ptc[i], ptc[i + 1]);
			}
			return len;
		},
		_3PtAngleAngle: function (pt1, pt2, pt3)
		{
			var a = this._2PtLen(pt1, pt2);
			var b = this._2PtLen(pt2, pt3);
			var c = this._2PtLen(pt1, pt3);
			return Math.acos((a * a + b * b - c * c) / (2 * a * b));
		},
		_3PtAngleObtuseAngle: function (pt1, pt2, pt3)
		{
			var a = this._2PtLen(pt1, pt2);
			var b = this._2PtLen(pt2, pt3);
			var c = this._2PtLen(pt1, pt3);
			return ((a * a + b * b - c * c) / (2 * a * b)) < 0;
		},
		twoPtsRelationShip: function (pt1, pt2)
		{
			if (pt2.x > pt1.x && pt2.y >= pt1.y) return "ne";
			else if (pt2.x <= pt1.x && pt2.y > pt1.y) return "nw";
			else if (pt2.x < pt1.x && pt2.y <= pt1.y) return "sw";
			else return "se";
		},
		twoPtsAngle: function (pt1, pt2)
		{
			var angle = Math.acos((pt2.x - pt1.x) / this._2PtLen(pt1, pt2));
			if (pt2.y < pt1.y)
			{
				angle = 2 * Math.PI - angle;
			}
			return angle;
		},
		_vertexAngle: function (ptc)
		{
			var segmentAngle = [], vertexAngle = [], left = [];
			for (var i = 0, len = ptc.length - 1; i < len; i++)
			{
				//0 -2pi
				var x = this.twoPtsAngle(ptc[i], ptc[i + 1]);

				segmentAngle.push(x);
			}

			//left and right
			//for (i = 1; i < len; i++)
			//{
			//	if (segmentAngle[i - 1] < segmentAngle[i])
			//	{
			//		if (polyline._3PtAngleObtuseAngle(ptc[i - 1], ptc[i], ptc[i + 1]))
			//		{
			//			left.push(true);
			//		}
			//		else
			//		{
			//			left.push(false);
			//		}
			//	}
			//	else
			//	{
			//		if (polyline._3PtAngleObtuseAngle(ptc[i - 1], ptc[i], ptc[i + 1]))
			//		{
			//			left.push(false);
			//		}
			//		else
			//		{
			//			left.push(true);
			//		}

			//	}
			//}
			x = this.twoPtsAngle(ptc[0], ptc[1]);
			//x = Math.atan((ptc[0].y - ptc[1].y) / (ptc[0].x - ptc[1].x));
			//switch (polyline.twoPtsRelationShip(ptc[0], ptc[1]))
			//{
			//	case "ne":
			//		x += Math.PI / 2;
			//		break;
			//	case "nw":
			//		x += Math.PI * 3 / 2;
			//		break;
			//	case "sw":
			//		x += Math.PI * 3 / 2;
			//		break;
			//	case "se":
			//		x += Math.PI / 2;
			//		break;
			//}
			vertexAngle.push(x += Math.PI / 2);
			for (i = 1; i < len; i++)
			{
				//var x = segmentAngle[i - 1] < segmentAngle[i] ? segmentAngle[i - 1] : segmentAngle[i] + polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]);
				x = (segmentAngle[i - 1] + segmentAngle[i]) / 2;
				if (segmentAngle[i - 1] < Math.PI && segmentAngle[i] - Math.PI > segmentAngle[i - 1])
				{
					x += Math.PI;
				}
				else if (segmentAngle[i - 1] > Math.PI && segmentAngle[i] < segmentAngle[i - 1] - Math.PI)
				{
					x += Math.PI;
				}


				x += Math.PI / 2;
				//if (!polyline.isLeft(ptc[i - 1], ptc[i], ptc[i + 1]))
				//{
				//	x += Math.PI / 2;
				//}
				//if (segmentAngle[i - 1] < segmentAngle[i])
				//{
				//	if (segmentAngle[i - 1] + Math.PI / 2 > segmentAngle[i])
				//	{
				//		if (polyline._3PtAngleObtuseAngle(ptc[i - 1], ptc[i], ptc[i + 1]))
				//		{
				//			x = Math.PI - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]) + segmentAngle[i - 1];
				//		}
				//		else
				//		{
				//			x = segmentAngle[i] - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]);
				//		}
				//	}
				//	else
				//	{
				//		if (polyline._3PtAngleObtuseAngle(ptc[i - 1], ptc[i], ptc[i + 1]))
				//		{
				//			x = segmentAngle[i] - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]);

				//		}
				//		else
				//		{
				//			x = Math.PI - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]) + segmentAngle[i - 1];
				//		}
				//	}
				//}
				//else
				//{
				//	if (polyline._3PtAngleObtuseAngle(ptc[i - 1], ptc[i], ptc[i + 1]))
				//	{
				//		x = Math.PI - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]) + segmentAngle[i];
				//	}
				//	else
				//	{
				//		x = segmentAngle[i - 1] - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]);
				//	}

				//}
				//var x = segmentAngle[i - 1] - polyline._3PtAngleAngleHalf(ptc[i - 1], ptc[i], ptc[i + 1]);
				//var x = (Math.tan(Math.atan(segmentAngle[i-1]) / 2) + Math.tan(Math.atan(segmentAngle[i ]) / 2)) / (1 - Math.tan(Math.atan(segmentAngle[i-1]) / 2) * Math.tan(Math.atan(segmentAngle[i]) / 2));
				//			x = Math.atan((1 - Math.cos(segmentAngle[i - 1] + segmentAngle[i])) / Math.sin(segmentAngle[i - 1] + segmentAngle[i]));
				//			//if (x < 0) x += Math.PI;
				//			if (segmentAngle[i - 1] < segmentAngle[i] && left[i - 1]) x -= Math.PI / 2;
				//			else if (segmentAngle[i - 1] >= segmentAngle[i] && !left[i - 1]) x -= Math.PI / 2;
				//			var t = Math.PI;
				//			if(segmentAngle[i-1]<= t && segmentAngle[i]>t) vertexAngle.push(x);
				//			else if(segmentAngle[i-1]<= t && segmentAngle[i]<=t) vertexAngle.push(x);
				//			else if(segmentAngle[i-1]<= t && segmentAngle[i]<=t) vertexAngle.push(x);
				//x+= Math.PI/2;
				vertexAngle.push(x);
			}
			return vertexAngle;
		},
		isLeft: function (pt1, pt2, pt3)
		{
			var middle = { x: (pt1.x + pt3.x) / 2, y: (pt1.y + pt3.y) / 2 };
			return ((pt2.x - pt1.x) * (middle.y - pt1.y) - (middle.x - pt1.x) * (pt2.y - pt1.y)) > 0;
		},
		CreateArrowHeadPath: function (pt1, headPt, pt2, controlPt, totalLength, headPercentage, headAngle)
		{
			var desireHeadLength = totalLength * headPercentage;
			var actualLength = this._2PtLen(controlPt, headPt);
			var verticalAngle = this.twoPtsAngle(headPt, controlPt);
			var headSizeBaseRatio = 1.7;
			var headSideLength, path = [], leftAngle, rightAngle, leftLen, rightLen, leftAcute, rightAcute, leftResult, rightResult;
			if (actualLength < desireHeadLength)
			{
				headSideLength = actualLength * headSizeBaseRatio;
				//path.push(pt1);
				path.push({ x: headPt.x + headSideLength * Math.cos(verticalAngle - headAngle / 180 * Math.PI), y: headPt.y + headSideLength * Math.sin(verticalAngle - headAngle / 180 * Math.PI) });
				path.push(headPt);
				path.push({ x: headPt.x + headSideLength * Math.cos(verticalAngle + headAngle / 180 * Math.PI), y: headPt.y + headSideLength * Math.sin(verticalAngle + headAngle / 180 * Math.PI) });
				//path.push(pt2);
			}
			else
			{
				path = [];
				headSideLength = desireHeadLength * headSizeBaseRatio;
				leftLen = rightLen = Math.sqrt(desireHeadLength * desireHeadLength + headSideLength * headSideLength - 2 * desireHeadLength * headSideLength * Math.cos(headAngle / 180 * Math.PI));
				leftAngle = rightAngle = Math.asin(headSideLength * Math.sin(headAngle / 180 * Math.PI) / leftLen) + Math.PI / 2;
				leftAcute = this._3PtAngleAngle(pt1, headPt, controlPt);
				//leftAcute += 0.05;
				rightAcute = this._3PtAngleAngle(pt2, headPt, controlPt);
				//rightAcute += 0.05;
				leftResult = Math.sin(leftAngle) / Math.sin(Math.PI - leftAngle - leftAcute) * desireHeadLength;
				rightResult = Math.sin(rightAngle) / Math.sin(Math.PI - rightAngle - rightAcute) * desireHeadLength;

				path.push({ x: headPt.x + leftResult * Math.cos(verticalAngle - leftAcute), y: headPt.y + leftResult * Math.sin(verticalAngle - leftAcute) });
				path.push({ x: headPt.x + headSideLength * Math.cos(verticalAngle - headAngle / 180 * Math.PI), y: headPt.y + headSideLength * Math.sin(verticalAngle - headAngle / 180 * Math.PI) });
				path.push(headPt);
				path.push({ x: headPt.x + headSideLength * Math.cos(verticalAngle + headAngle / 180 * Math.PI), y: headPt.y + headSideLength * Math.sin(verticalAngle + headAngle / 180 * Math.PI) });
				path.push({ x: headPt.x + rightResult * Math.cos(verticalAngle + rightAcute), y: headPt.y + rightResult * Math.sin(verticalAngle + rightAcute) });
			}
			return path;


		},
		CreateArrowHeadPathEx: function (pt1, candidatePt, pt2, totalLen, headPercentage, headAngle)
		{
			var headSizeBaseRatio = 1.7;
			var headBaseLen = totalLen * headPercentage;
			var headSideLen = headBaseLen * headSizeBaseRatio;
			var angle1 = this.twoPtsAngle(candidatePt, pt1);
			var angle2 = this.twoPtsAngle(candidatePt, pt2);
			var midAngle = (Math.abs(angle1 - angle2)) / 2;
			if (Math.abs(angle1 - angle2) > Math.PI * 1.88) midAngle += Math.PI;
			var len = Math.sqrt(headBaseLen * headBaseLen + headSideLen * headSideLen - 2 * headSideLen * headBaseLen * Math.cos(midAngle + headAngle / 180 * Math.PI));
			var upAngle = Math.asin(headBaseLen * Math.sin(midAngle + headAngle / 180 * Math.PI) / len);
			var centAngle = upAngle + headAngle / 180 * Math.PI;
			var result = headBaseLen * Math.sin(Math.PI - centAngle - midAngle) / Math.sin(centAngle);
			var path = [];

			path.push({ x: candidatePt.x + result * Math.cos(angle1), y: candidatePt.y + result * Math.sin(angle1) });
			path.push({ x: candidatePt.x + headSideLen * Math.cos(angle1 - headAngle / 180 * Math.PI), y: candidatePt.y + headSideLen * Math.sin(angle1 - headAngle / 180 * Math.PI) });
			path.push(candidatePt);
			path.push({ x: candidatePt.x + headSideLen * Math.cos(angle2 + headAngle / 180 * Math.PI), y: candidatePt.y + headSideLen * Math.sin(angle2 + headAngle / 180 * Math.PI) });
			path.push({ x: candidatePt.x + result * Math.cos(angle2), y: candidatePt.y + result * Math.sin(angle2) });
			return path;
		},
CreateBezierPathPoly : function (pointCollection, numberOfPts, map)
{
	var position = {x: pointCollection[0].x, y: pointCollection[0].y};
	if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
	{
		pointCollection.pop();
	}
	if (pointCollection[pointCollection.length - 1].x === pointCollection[pointCollection.length - 2].x && pointCollection[pointCollection.length - 1].y === pointCollection[pointCollection.length - 2].y)
	{
		pointCollection.pop();
	}
	pointCollection.push(pointCollection[0]);
	//pointCollection.push(pt);
	var tween = TweenMax.to(position, numberOfPts, {bezier: pointCollection, ease: Linear.easeNone});
	//ease:Power1.easeInOut  ease: Linear.easeNone
	var path = [];
	for (var i = 0; i <= numberOfPts; i++)
	{
		tween.time(i);
		path.push({x: position.x, y: position.y});
	}
	var result = new _Polygon(map.spatialReference);
	result.addRing(path);
	return result;

}

	});
	_lang.mixin(DrawEx, {
		POINT: "point", MULTI_POINT: "multipoint", LINE: "line", EXTENT: "extent", POLYLINE: "polyline", POLYGON: "polygon", FREEHAND_POLYLINE: "freehandpolyline", FREEHAND_POLYGON: "freehandpolygon",
		ARROW: "arrow", LEFT_ARROW: "leftarrow", RIGHT_ARROW: "rightarrow", UP_ARROW: "uparrow", DOWN_ARROW: "downarrow", TRIANGLE: "triangle", CIRCLE: "circle", ELLIPSE: "ellipse", RECTANGLE: "rectangle", CURVE: "curve", BEZIER_CURVE: "beziercurve", BEZIER_POLYGON: "bezierpolygon", FREEHAND_ARROW: "freehandarrow", POLYLINEEX: "polylineex"
	});
	_has("extend-esri") && _lang.setObject("toolbars.Draw", DrawEx, esriKernel);
	return DrawEx
});
////@ sourceURL=http://localhost/js/3.7/js/esri/toolbars/draw.js