/**
 * Created by Hongzhi on 5/8/2014.
 */

define("dojo/_base/declare dojo/_base/lang dojo/_base/connect dojo/_base/array dojo/_base/Color dojo/has esri/kernel esri/lang esri/sniff esri/toolbars/_toolbar Extension/_BoxEx Extension/_GraphicMoverEx Extension/_VertexEditorEx esri/symbols/SimpleMarkerSymbol esri/symbols/SimpleLineSymbol".split(" "), function (declare, lang, connect, Array, Color, has, esriKernel, esriLang, esriSniff, _toolbar, _Box, _GraphicMover, _VertexEditor, SimpleMarkerSymbol, SimpleLineSymbol)
{
	var EditEx = declare(_toolbar, {declaredClass: "esri.toolbars.EditEx",
		                     constructor: function (map, options, draw)
		                     {
			                     this._map = map;
			                     this._tool = 0;
			                     this._draw = draw;
			                     if (this._map.loaded)
				                     this._scratchGL = map.graphics;
			                     else
				                     var loadConnector = connect.connect(this._map, "onLoad", this, function ()
				                     {
					                     connect.disconnect(loadConnector);
					                     loadConnector = null;
					                     this._scratchGL = this._map.graphics
				                     });
			                     var inputType = has("esri-touch") || has("esri-pointer");
			                     this._defaultOptions = lang.mixin({vertexSymbol: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, inputType ? 20 : 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1), new Color([128, 128, 128])), ghostVertexSymbol: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, inputType ? 18 : 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1), new Color([255, 255, 255, 0.75])), ghostLineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, new Color([128, 128, 128]), 2), allowDeleteVertices: !0, allowAddVertices: !0, rotateHandleOffset: inputType ? 24 : 30, boxLineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([64, 64, 64]), 1), boxHandleSymbol: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, inputType ? 16 : 13, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1), new Color([255, 255, 255, 0.75])), controlPointSymbol: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 16, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1), new Color([255, 0, 0, 1]))}, options || {});
		                     },
		                     activate: function (tool, graphic, options)
		                     {
			                     this.deactivate();
			                     this._graphic = graphic;
			                     this._options = lang.mixin(lang.mixin({}, this._defaultOptions), options || {});
			                     var editOpMove = EditEx.MOVE;
			                     var editOpVertices = EditEx.EDIT_VERTICES;
			                     var editOpScale = EditEx.SCALE, editOpRotate = EditEx.ROTATE, enabledMove = !1, enabledVertexEdit = !1, enabledBoxEdit = !1, map = this._map, spatialReference = map.spatialReference, graphicSpatialReference = graphic.geometry.spatialReference;
			                     this._geo = !(!spatialReference || !graphicSpatialReference || spatialReference.equals(graphicSpatialReference) || !(spatialReference.isWebMercator() && 4326 === graphicSpatialReference.wkid));
			                     (tool & editOpMove) === editOpMove && (enabledMove = this._enableMove(graphic));
			                     var enabledScale = (tool & editOpScale) === editOpScale;
			                     var enabledRotate = (tool & editOpRotate) === editOpRotate;
			                     if (enabledScale || enabledRotate) enabledBoxEdit = this._enableBoxEditing(graphic, enabledScale, enabledRotate);
			                     (tool & editOpVertices) === editOpVertices && (enabledVertexEdit = this._enableVertexEditing(graphic));
			                     if (!enabledMove && !enabledVertexEdit && !enabledBoxEdit)
				                     throw Error("[esri.toolbars.Edit::activate] Unable to activate the tool. Check if the tool is valid for the given geometry type.");
			                     if (this._tool = tool)
				                     this._mapPanEndHandle = connect.connect(map, "onPanEnd", this, this._mapPanEndHandler), this._mapExtChgHandle = connect.connect(map, "onExtentChange", this, this._mapExtentChangeHandler), this.onActivate(this._tool, graphic);
			                     map.snappingManager && (enabledMove || enabledVertexEdit) && map.snappingManager._startSelectionLayerQuery()
		                     },
		                     deactivate: function ()
		                     {
			                     var a = this._tool, b = this._graphic;
			                     if (a)
			                     {
				                     var d = !!this._modified;
				                     this._clear();
				                     connect.disconnect(this._mapPanEndHandle);
				                     connect.disconnect(this._mapExtChgHandle);
				                     this._graphic = this._geo = this._mapPanEndHandle = this._mapExtChgHandle = null;
				                     this.onDeactivate(a, b, {isModified: d});
				                     this._map.snappingManager && this._map.snappingManager._stopSelectionLayerQuery()
			                     }
		                     },
		                     refresh: function ()
		                     {
			                     this._refreshMoveables(!0)
		                     },
		                     getCurrentState: function ()
		                     {
			                     return{tool: this._tool, graphic: this._graphic, isModified: !!this._modified}
		                     },
		                     onActivate: function (a, b)
		                     {
		                     },
		                     onDeactivate: function (a, b, d)
		                     {
		                     },
		                     onGraphicMoveStart: function (a)
		                     {
		                     },
		                     onGraphicFirstMove: function (a)
		                     {
			                     this._modified = !0
		                     },
		                     onGraphicMove: function (a, b)
		                     {
		                     },
		                     onGraphicMoveStop: function (a, b)
		                     {
		                     },
		                     onGraphicClick: function (a, b)
		                     {
		                     },
		                     onVertexMoveStart: function (a, b)
		                     {
		                     },
		                     onVertexFirstMove: function (a, b)
		                     {
			                     this._modified = !0
		                     },
		                     onVertexMove: function (a, b, d)
		                     {
		                     },
		                     onVertexMoveStop: function (a, b, d)
		                     {
		                     },
		                     onVertexAdd: function (a, b)
		                     {
			                     this._modified = !0
		                     },
		                     onVertexClick: function (a, b)
		                     {
		                     },
		                     onVertexMouseOver: function (a, b)
		                     {
		                     },
		                     onVertexMouseOut: function (a, b)
		                     {
		                     },
		                     onVertexDelete: function (a, b)
		                     {
			                     this._modified = !0
		                     },
		                     onScaleStart: function (a)
		                     {
		                     },
		                     onScaleFirstMove: function (a)
		                     {
			                     this._modified = !0
		                     },
		                     onScale: function (a, b)
		                     {
		                     },
		                     onScaleStop: function (a, b)
		                     {
		                     },
		                     onRotateStart: function (a)
		                     {
		                     },
		                     onRotateFirstMove: function (a)
		                     {
			                     this._modified = !0
		                     },
		                     onRotate: function (a, b)
		                     {
		                     },
		                     onRotateStop: function (a, b)
		                     {
		                     },
		                     _eventMap: {activate: ["tool", "graphic"], deactivate: ["tool", "graphic", "info"],
			                     "graphic-move-start": ["graphic"], "graphic-first-move": ["graphic"], "graphic-move": ["graphic", "transform"], "graphic-move-stop": ["graphic", "transform"], "graphic-click": ["graphic", "info"], "vertex-move-start": ["graphic", "vertexinfo"], "vertex-first-move": ["graphic", "vertexinfo"], "vertex-move": ["graphic", "vertexinfo", "transform"], "vertex-move-stop": ["graphic", "vertexinfo", "transform"], "vertex-add": ["graphic", "vertexinfo"], "vertex-click": ["graphic", "vertexinfo"], "vertex-mouse-over": ["graphic", "vertexinfo"],
			                     "vertex-mouse-out": ["graphic", "vertexinfo"], "vertex-delete": ["graphic", "vertexinfo"], "scale-start": ["graphic"], "scale-first-move": ["graphic"], scale: ["graphic", "info"], "scale-stop": ["graphic", "info"], "rotate-start": ["graphic"], "rotate-first-move": ["graphic"], rotate: ["graphic", "info"], "rotate-stop": ["graphic", "info"]},
		                     _enableMove: function (graphic)
		                     {
			                     var map = this._map;
			                     switch (graphic.geometry.type)
			                     {
				                     case "point":
				                     case "polyline":
				                     case "polygon":
					                     return this._graphicMover = new _GraphicMover(graphic, map, this), !0
			                     }
			                     return!1
		                     },
		                     _enableVertexEditing: function (graphic)
		                     {
			                     var map = this._map;
			                     switch (graphic.geometry.type)
			                     {
				                     case "multipoint":
				                     case "polyline":
				                     case "polygon":
					                     return this._vertexEditor = _VertexEditor.create(graphic, map, this), !0
			                     }
			                     return!1
		                     },
		                     _enableBoxEditing: function (graphic, enabledScale, enabledRotate)
		                     {
			                     var map = this._map;
			                     switch (graphic.geometry.type)
			                     {
				                     case "polyline":
				                     case "polygon":
					                     return this._boxEditor = new _Box(graphic, map, this, enabledScale, enabledRotate, this._options.uniformScaling), !0;
			                     }
			                     return!1
		                     },
		                     _disableMove: function ()
		                     {
			                     var a = this._graphicMover;
			                     a && (a.destroy(), this._graphicMover = null)
		                     },
		                     _disableVertexEditing: function ()
		                     {
			                     var a = this._vertexEditor;
			                     a && (a.destroy(), this._vertexEditor = null)
		                     },
		                     _disableBoxEditing: function ()
		                     {
			                     var a = this._boxEditor;
			                     a && (a.destroy(), this._boxEditor = null)
		                     },
		                     _clear: function ()
		                     {
			                     this._disableMove();
			                     this._disableVertexEditing();
			                     this._disableBoxEditing();
			                     this._tool = 0;
			                     this._modified = !1
		                     },
		                     _mapPanEndHandler: function ()
		                     {
			                     this._refreshMoveables()
		                     },
		                     _mapExtentChangeHandler: function (a, b, d)
		                     {
			                     d && this._refreshMoveables()
		                     },
		                     _refreshMoveables: function (a)
		                     {
			                     var b = Array.filter([this._graphicMover, this._vertexEditor, this._boxEditor], esriLang.isDefined);
			                     Array.forEach(b, function (b)
			                     {
				                     b.refresh(a)
			                     })
		                     },
		                     _beginOperation: function (a)
		                     {
			                     Array.forEach(this._getAffectedTools(a), function (a)
			                     {
				                     a.suspend()
			                     })
		                     },
		                     _endOperation: function (a)
		                     {
			                     Array.forEach(this._getAffectedTools(a), function (a)
			                     {
				                     a.resume()
			                     })
		                     },
		                     _getAffectedTools: function (a)
		                     {
			                     var b = [];
			                     switch (a)
			                     {
				                     case "MOVE":
					                     b = [this._vertexEditor, this._boxEditor];
					                     break;
				                     case "VERTICES":
					                     b = [this._boxEditor];
					                     break;
				                     case "BOX":
					                     b = [this._vertexEditor];
			                     }
			                     return b = Array.filter(b, esriLang.isDefined)
		                     }});
	lang.mixin(EditEx, {MOVE: 1, EDIT_VERTICES: 2, SCALE: 4, ROTATE: 8});
	has("extend-esri") && lang.setObject("toolbars.Edit", EditEx, esriKernel);
	return EditEx;
});