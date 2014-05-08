/*
 COPYRIGHT 2009 ESRI

 TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 Unpublished material - all rights reserved under the
 Copyright Laws of the United States and applicable international
 laws, treaties, and conventions.

 For additional information, contact:
 Environmental Systems Research Institute, Inc.
 Attn: Contracts and Legal Services Department
 380 New York Street
 Redlands, California, 92373
 USA

 email: contracts@esri.com
 */
//>>built
define( "dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/connect dojo/has dojo/dom-style dojox/gfx/Moveable dojox/gfx/matrix esri/kernel esri/lang esri/geometry/Point esri/geometry/Polyline esri/geometry/webMercatorUtils esri/geometry/jsonUtils esri/graphic".split(" "),
       function (declare, lang, Array, connect, has, domStyle, Moveable, matrix, esriKernel, esriLang, Point, Polyline, webMercatorUtils, jsonUtils, Graphic)
       {
	       var Box = declare(null, {declaredClass: "esri.toolbars._BoxEx",
		       constructor: function (graphic, map, toolbar, enabledScale, enabledRotate, uniformScale)
		       {
			       this._graphic = graphic;
			       if (graphic.geometry.controlPoints) this._controlPoints = graphic.geometry.controlPoints;
			       if (graphic.geometry.drawExtendType) this._drawExtendType = graphic.geometry.drawExtendType;
			       this._map = map;
			       this._toolbar = toolbar;
			       this._scale = enabledScale;
			       this._rotate = enabledRotate;
			       this._defaultEventArgs = {};
			       this._scaleEvent = "Scale";
			       this._rotateEvent = "Rotate";
			       this._uniformScaling = uniformScale;
			       var toolbarOptions = toolbar._options;
			       this._markerSymbol = toolbarOptions.boxHandleSymbol;
			       this._controlSymbol = toolbarOptions.controlPointSymbol;
			       this._lineSymbol = toolbarOptions.boxLineSymbol;
			       this._moveStartHandler = lang.hitch(this, this._moveStartHandler);
			       this._firstMoveHandler = lang.hitch(this, this._firstMoveHandler);
			       this._moveStopHandler = lang.hitch(this, this._moveStopHandler);
			       this._moveHandler = lang.hitch(this, this._moveHandler);
			       this._init();
		       },
		       destroy: function ()
		       {
			       this._cleanUp();
			       this._graphic = this._map = this._toolbar = this._markerSymbol = this._lineSymbol = null;
		       },
		       refresh: function ()
		       {
			       this._draw();
		       },
		       suspend: function ()
		       {
			       Array.forEach(this._getAllGraphics(), function (b)
			       {
				       b.hide();
			       })
		       },
		       resume: function ()
		       {
			       Array.forEach(this._getAllGraphics(), function (b)
			       {
				       b.show();
			       });
			       this._draw();
		       },
		       _init: function ()
		       {
			       this._draw();
		       },
		       _cleanUp: function ()
		       {
			       this._connects && Array.forEach(this._connects, connect.disconnect);
			       var scratchGraphicLayer = this._toolbar._scratchGL;
			       this._anchors && Array.forEach(this._anchors, function (e)
			       {
				       scratchGraphicLayer.remove(e.graphic);
				       (e = e.moveable) && e.destroy()
			       });
			       this._cpAnchors && Array.forEach(this._cpAnchors, function (e)
			       {
				       scratchGraphicLayer.remove(e.graphic);
				       (e = e.moveable) && e.destroy()
			       });
			       this._box && scratchGraphicLayer.remove(this._box);
			       this._box = this._anchors = this._connects = this._cpAnchors = null;
		       },
		       _draw: function ()
		       {
			       if (this._graphic.getDojoShape())
			       {
				       //console.log("draw called");
				       var map = this._map, scratchGL = this._toolbar._scratchGL, boxCoords = this._getBoxCoords(), polyLine = new Polyline(map.spatialReference),
					       filteredBoxCoords = lang.clone(Array.filter(boxCoords,
					                                                   function (item, index)
					                                                   {
						                                                   return 8 !== index && 0 === index % 2;
					                                                   }));
				       filteredBoxCoords[0] && filteredBoxCoords.push([filteredBoxCoords[0][0], filteredBoxCoords[0][1]]);
				       polyLine.addPath(filteredBoxCoords);
				       this._rotate && polyLine.addPath([boxCoords[1], boxCoords[8]]);
//				       if (this._controlPoints)
//				       {
//
//					       Array.forEach(this._graphic.geometry.controlPoints, function (item, index)
//					       {
//						       item = new Point(item, map.spatialReference);
//						       var d = new Graphic(item, this._controlSymbol);
//						       scratchGL.add(d);
//					       }, this);
//					       //console.log(this._graphic.geometry.controlPoints.length);
//				       }
				       this._box ? this._box.setGeometry(polyLine) : (this._box = new Graphic(polyLine, this._lineSymbol), scratchGL.add(this._box));
				       this._anchors ?
					       Array.forEach(this._anchors, function (item, index)
					       {
						       this._scale || (index = 8);
						       var pt = new Point(boxCoords[index], map.spatialReference);
						       // item.graphic.controlPoints = !0;
						       item.graphic.setGeometry(pt);
						       var itemMoveable = item.moveable, itemDojoShape = item.graphic.getDojoShape();
						       //itemDojoShape && (itemMoveable ? itemDojoShape !== itemMoveable.shape && (itemMoveable.destroy(), item.moveable = this._getMoveable(item.graphic, index)) : item.moveable = this._getMoveable(item.graphic, index));
						       if (itemDojoShape)
						       {
							       if (itemMoveable)
							       {
								       if (itemDojoShape !== itemMoveable.shape)
								       {
									       itemMoveable.destroy();
									       item.moveable = this._getMoveable(item.graphic, index);
								       }
							       }
							       else
							       {
								       item.moveable = this._getMoveable(item.graphic, index)
							       }
						       }
					       }, this) :
					       (this._anchors = [], this._connects = [], Array.forEach(boxCoords, function (item, index)
					       {
						       if (this._scale || !(8 > index))
						       {
							       item = new Point(item, map.spatialReference);
							       var d = new Graphic(item, this._markerSymbol);
							       // d.controlPoints = !0;
							       scratchGL.add(d);
							       this._anchors.push({graphic: d, moveable: this._getMoveable(d, index)})
						       }
					       }, this));
				       if (this._controlPoints)
				       {
					       if (this._cpAnchors)
					       {
						       //console.log("_box cpAnchors redraw");
						       Array.forEach(this._cpAnchors, function (item, index)
						       {

							       var pt = new Point(this._cpAnchors[index].graphic.geometry, map.spatialReference);
							       item.graphic.controlPoints = !0;
							       item.graphic.setGeometry(pt);
							       var itemMoveable = item.moveable, itemDojoShape = item.graphic.getDojoShape();
							       if (itemDojoShape)
							       {
								       if (itemMoveable)
								       {
									       if (itemDojoShape !== itemMoveable.shape)
									       {
										       itemMoveable.destroy();
										       item.moveable = this._getMoveable(item.graphic, index, !0, index);
									       }
								       }
								       else
								       {
									       item.moveable = this._getMoveable(item.graphic, index, !0, index)
								       }
							       }
						       }, this);
					       }
					       else
					       {
						       this._cpAnchors = [], this._connects = [], Array.forEach(this._controlPoints, function (item, index)
						       {
							       item = new Point(item, map.spatialReference);
							       var d = new Graphic(item, this._controlSymbol);
							       d.controlPoints = !0;
							       scratchGL.add(d);
							       this._cpAnchors.push({graphic: d, moveable: this._getMoveable(d, index, !0, index)})
						       }, this);
					       }
				       }


			       }
			       else this._cleanUp();
		       },
		       //bbox in map coordinates with four middle points
		       _getBoxCoords: function (useScreen)
		       {
			       var map = this._map, screenBoundingBox = this._getTransformedBoundingBox(this._graphic),
				       a = [], currentItem, nextItem, middle;
			       Array.forEach(screenBoundingBox, function (item, index, arr)
			       {
				       currentItem = item;
				       (nextItem = arr[index + 1]) || (nextItem = arr[0]);
				       middle = {x: (currentItem.x + nextItem.x) / 2, y: (currentItem.y + nextItem.y) / 2};
				       useScreen || (currentItem = map.toMap(currentItem), middle = map.toMap(middle));
				       a.push([currentItem.x, currentItem.y]);
				       a.push([middle.x, middle.y])
			       });
			       //add rotate handle graphic
			       this._rotate && (screenBoundingBox = lang.clone(a[1]), screenBoundingBox = useScreen ? {x: screenBoundingBox[0], y: screenBoundingBox[1]} : map.toScreen({x: screenBoundingBox[0], y: screenBoundingBox[1], spatialReference: map.spatialReference}), screenBoundingBox.y -= this._toolbar._options.rotateHandleOffset, useScreen || (screenBoundingBox = map.toMap(screenBoundingBox)), a.push([screenBoundingBox.x, screenBoundingBox.y]));
			       return a;
		       },

		       //get screen coordinate bbox
		       _getTransformedBoundingBox: function (graphic)
		       {
			       var map = this._map, extent = graphic.geometry.getExtent(), spatialReference = graphic.geometry.spatialReference;
			       var upLeftPt = new Point(extent.xmin, extent.ymax,
			                                spatialReference);
			       var downRightPt = new Point(extent.xmax, extent.ymin, spatialReference);
			       upLeftPt = map.toScreen(upLeftPt);
			       downRightPt = map.toScreen(downRightPt);
			       return[
				       {x: upLeftPt.x, y: upLeftPt.y},
				       {x: downRightPt.x, y: upLeftPt.y},
				       {x: downRightPt.x, y: downRightPt.y},
				       {x: upLeftPt.x, y: downRightPt.y}
			       ]
		       },
		       _getAllGraphics: function ()
		       {
			       var b = [];
			       this._cpAnchors && Array.forEach(this._cpAnchors, function (e)
			       {
				       b.push(e.graphic)
			       });
			       this._anchors && Array.forEach(this._anchors, function (e)
			       {
				       b.push(e.graphic)
			       });
			       b.push(this._box);
			       return b = Array.filter(b, esriLang.isDefined)
		       },
		       _getMoveable: function (graphic, index, controlMovable, controlPointIndex)
		       {
			       var dojoShape = graphic.getDojoShape();
			       if (dojoShape)
			       {
				       var moveAble = new Moveable(dojoShape);
				       moveAble._index = index;
				       moveAble.controlPointIndex = controlPointIndex;
				       moveAble._control = controlMovable;
				       this._connects.push(connect.connect(moveAble, "onMoveStart", this._moveStartHandler));
				       this._connects.push(connect.connect(moveAble, "onFirstMove", this._firstMoveHandler));
				       this._connects.push(connect.connect(moveAble, "onMoveStop", this._moveStopHandler));
				       moveAble.onMove = this._moveHandler;
				       !controlMovable && (dojoShape = dojoShape.getEventSource()) && domStyle.set(dojoShape, "cursor", this._toolbar._cursors["box" + index]);
				       controlMovable && (dojoShape = dojoShape.getEventSource()) && domStyle.set(dojoShape, "cursor", this._toolbar._cursors["move"]);
				       return moveAble;
			       }
		       },
		       _moveStartHandler: function (b)
		       {
			       !this._controlPoints && this._toolbar["on" + (8 === b.host._index ? this._rotateEvent : this._scaleEvent) + "Start"](this._graphic);
		       },
		       _firstMoveHandler: function (b)
		       {
			       var index = b.host._index, offset = this._wrapOffset = b.host.shape._wrapOffsets[0] || 0, transform = this._graphic.getLayer()._div.getTransform(), middeScreen;
			       var screenBbox = Array.map(this._getBoxCoords(!0), function (a)
			       {
				       return{x: a[0] + offset, y: a[1]}
			       });
			       middeScreen = {x: screenBbox[1].x, y: screenBbox[3].y};
			       this._centerCoord = matrix.multiplyPoint(matrix.invert(transform), middeScreen);
			       if (8 === index)middeScreen = matrix.multiplyPoint(matrix.invert(transform), screenBbox[1]), this._startLine = [this._centerCoord, middeScreen], this._moveLine = lang.clone(this._startLine); else if (middeScreen = matrix.multiplyPoint(matrix.invert(transform), screenBbox[index]), transform = matrix.multiplyPoint(matrix.invert(transform), screenBbox[(index + 4) % 8]), this._firstMoverToCenter = Math.sqrt((middeScreen.x - this._centerCoord.x) * (middeScreen.x - this._centerCoord.x) + (middeScreen.y - this._centerCoord.y) * (middeScreen.y - this._centerCoord.y)), this._startBox = transform, this._startBox.width = screenBbox[4].x - screenBbox[0].x, this._startBox.height = screenBbox[4].y - screenBbox[0].y, this._moveBox =
				       lang.clone(this._startBox), this._xfactor = middeScreen.x > transform.x ? 1 : -1, this._yfactor = middeScreen.y > transform.y ? 1 : -1, 1 === index || 5 === index)this._xfactor = 0; else if (3 === index || 7 === index)this._yfactor = 0;
			       this._toolbar._beginOperation("BOX");
			       !this._controlPoints && this._toolbar["on" + (8 === index ? this._rotateEvent : this._scaleEvent) + "FirstMove"](this._graphic);
			       if (this._controlPoints)
			       {
				       this._cpScreen = [];
				       Array.forEach(this._controlPoints, function (item, index)
				       {
					       this._cpScreen.push(this._map.toScreen(item));
				       }, this);
			       }
		       },
		       _moveHandler: function (b, inputPt)
		       {
			       var index = b.host._index, eventArgs = this._defaultEventArgs, d, g, f, h, m = 0, k = 0;
			       eventArgs.angle = 0;
			       eventArgs.scaleX = 1;
			       eventArgs.scaleY = 1;
			       if (8 === index && !b.host._control)
			       {
				       var startLine = this._startLine;
				       var moveLine = this._moveLine;
				       var moveLine2Pt = moveLine[1];
				       moveLine2Pt.x += inputPt.dx;
				       moveLine2Pt.y += inputPt.dy;
				       var movedAngle = this._getAngle(startLine, moveLine);
				       var startLinePt1AfterRotate = matrix.rotategAt(movedAngle, startLine[0]);
				       this._graphic.getDojoShape().setTransform(startLinePt1AfterRotate);
				       eventArgs.transform = startLinePt1AfterRotate;
				       eventArgs.angle = movedAngle;
				       eventArgs.around = startLine[0];
			       }
			       else if (!b.host._control)
			       {
				       d = this._startBox;
				       g = this._moveBox;
				       g.width += inputPt.dx * this._xfactor;
				       g.height += inputPt.dy * this._yfactor;
				       this._uniformScaling ? (f = g.x + this._xfactor * g.width, g = g.y + this._yfactor * g.height, g = Math.sqrt((f - this._centerCoord.x) * (f - this._centerCoord.x) + (g - this._centerCoord.y) * (g - this._centerCoord.y)), f = h = g / this._firstMoverToCenter, m = this._xfactor * d.width / 2, k = this._yfactor * d.height / 2) : (f = g.width / d.width, h = g.height / d.height);
				       if (isNaN(f) ||
					       Infinity === f || -Infinity === f)f = 1;
				       if (isNaN(h) || Infinity === h || -Infinity === h)h = 1;
				       g = matrix.scaleAt(f, h, d.x + m, d.y + k);
				       this._graphic.getDojoShape().setTransform(g);
				       eventArgs.transform = g;
				       eventArgs.scaleX = f;
				       eventArgs.scaleY = h;
				       eventArgs.around = {x: d.x + m, y: d.y + k}
			       }
			       else
			       {
				       var cpindex = b.host.controlPointIndex;
				       //console.log(cpindex);
				       this._cpScreen[cpindex].x += inputPt.dx;
				       this._cpScreen[cpindex].y += inputPt.dy;
				       this._controlPoints[cpindex] = this._map.toMap(this._cpScreen[cpindex]);
				       this._toolbar._draw._controlPointsUpdates(this._drawExtendType, this._graphic, this._controlPoints);
				       //this._draw();
				       Array.forEach(this._cpAnchors, function (item, index)
				       {
					       if (index === cpindex)
					       {
						       var pt = new Point(this._controlPoints[cpindex], this._map.spatialReference);
						       item.graphic.controlPoints = !0;
						       item.graphic.setGeometry(pt);
						       item.graphic.getDojoShape().moveToFront();
					       }
					       else
						       item.graphic.getDojoShape().moveToFront();

				       }, this);
				       this._graphic.geometry.controlPoints = this._controlPoints;
			       }
			       !this._controlPoints && this._toolbar["on" + (8 === index ? this._rotateEvent : this._scaleEvent)](this._graphic, eventArgs);
		       },
		       _moveStopHandler: function (b)
		       {
			       if (!b.host._control)
			       {
				       //console.log("move stop");
				       var graphic = this._graphic;
				       var editToolbar = this._toolbar;
				       var geometry = editToolbar._geo ? webMercatorUtils.geographicToWebMercator(graphic.geometry) : graphic.geometry;
				       var spatialReference = geometry.spatialReference;
				       var graphicDojoShape = graphic.getDojoShape();
				       var graphicTransform = graphicDojoShape.getTransform();
				       var layerTransform = graphic.getLayer()._div.getTransform();

				       var geometryJson = geometry.toJson();
				       this._controlPoints && Array.forEach(this._cpAnchors, function (b, i)
				       {
					       this._updateControlPoints(b, i);
				       }, this);
				       this._updateSegments(geometryJson.paths || geometryJson.rings, graphicTransform, layerTransform, spatialReference);
				       graphicDojoShape.setTransform(null);
				       var transformGeometry = jsonUtils.fromJson(geometryJson);
				       graphic.setGeometry(editToolbar._geo ? webMercatorUtils.webMercatorToGeographic(transformGeometry, !0) : transformGeometry);
				       graphic.geometry.controlPoints = this._controlPoints;
				       graphic.geometry.drawExtendType = this._drawExtendType;

				       this._startLine = this._moveLine = this._startBox = this._moveBox = this._xfactor = this._yfactor = null;
				       editToolbar._endOperation("BOX");
				       this._draw();
				       Array.forEach(this._anchors, function (item)
				       {
					       item.graphic.getDojoShape().moveToFront();
				       });
				       Array.forEach(this._cpAnchors, function (item)
				       {
					       item.graphic.getDojoShape().moveToFront();
				       });
				       if (this._graphic.geometry.type === "polyline")
					       this._toolbar._enableMove(this._graphic);
				       //this._box.getDojoShape().moveToBack();
				       this._defaultEventArgs.transform = graphicTransform;
				       editToolbar["on" + (8 === b.host._index ? this._rotateEvent : this._scaleEvent) + "Stop"](this._graphic, this._defaultEventArgs);
			       }
			       else
			       {

				       this._graphic.geometry.controlPoints = this._controlPoints;
				       this._graphic.geometry.drawExtendType = this._drawExtendType;
				       this._draw();
				       Array.forEach(this._anchors, function (item)
				       {
					       item.graphic.getDojoShape().moveToFront();
				       });
				       Array.forEach(this._cpAnchors, function (item)
				       {
					       item.graphic.getDojoShape().moveToFront();
				       });
				       if (this._graphic.geometry.type === "polyline")
					       this._toolbar._enableMove(this._graphic);
				       //this._box.getDojoShape().moveToBack();
			       }
		       },
		       _updateSegments: function (rings, graphicTransform, layerTransform, spatialReference)
		       {
			       //console.log(rings[0][15][0]);
			       var map = this._map, wrapOffset = this._wrapOffset || 0;
			       Array.forEach(rings,
			                     function (b)
			                     {
				                     Array.forEach(b, function (b)
				                     {
					                     var f = map.toScreen({x: b[0], y: b[1], spatialReference: spatialReference}, !0);
					                     f.x += wrapOffset;
					                     f = matrix.multiplyPoint([layerTransform, graphicTransform, matrix.invert(layerTransform)], f);
					                     f.x -= wrapOffset;
					                     f = map.toMap(f);
					                     b[0] = f.x;
					                     b[1] = f.y
				                     })
			                     });
			       //console.log(rings[0][15][0]);
		       },
		       _updateControlPoints: function (item, index)
		       {
			       //console.log(item.graphic.geometry.x);
			       var graphic = this._graphic;
			       var editToolbar = this._toolbar;
			       var geometry = editToolbar._geo ? webMercatorUtils.geographicToWebMercator(item.graphic.geometry) : item.graphic.geometry;
			       var spatialReference = geometry.spatialReference;
			       var graphicDojoShape = graphic.getDojoShape();
			       var graphicTransform = graphicDojoShape.getTransform();
			       var layerTransform = graphic.getLayer()._div.getTransform();
			       //console.log(ptc[1].x);
			       var map = this._map, wrapOffset = this._wrapOffset || 0;


			       var f = map.toScreen({x: geometry.x, y: geometry.y, spatialReference: spatialReference}, !0);
			       f.x += wrapOffset;
			       f = matrix.multiplyPoint([layerTransform, graphicTransform, matrix.invert(layerTransform)], f);
			       f.x -= wrapOffset;
			       f = map.toMap(f);
			       item.graphic.geometry.x = f.x;
			       item.graphic.geometry.y = f.y;
			       this._controlPoints[index].x = f.x;
			       this._controlPoints[index].y = f.y;

			       //console.log(f.x);
		       },
		       _getAngle: function (b, e)
		       {
			       var c = 180 * Math.atan2(b[0].y - b[1].y, b[0].x - b[1].x) / Math.PI;
			       return 180 * Math.atan2(e[0].y - e[1].y, e[0].x - e[1].x) / Math.PI - c
		       }
	       });
	       has("extend-esri") && lang.setObject("toolbars._BoxEx", Box, esriKernel);
	       return Box
       })
;