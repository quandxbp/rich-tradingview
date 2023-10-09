/**
 * PDFAnnotate v1.0.0
 * Author: Ravisha Heshan
 */

var PDFAnnotate = function(container_id, url) {
	this.number_of_pages = 0;
	this.pages_rendered = 0;
	this.active_tool = 1; // 1 - Free hand, 2 - Text, 3 - Arrow, 4 - Rectangle
	this.fabricObjects = [];
	this.color = '#212121';
	this.borderColor = '#000000';
	this.borderSize = 1;
	this.font_size = 16;
	this.active_canvas = 0;
	this.container_id = container_id;
	this.url = url;
	this.widthRec = 150;
	this.heightRec = 130;
	this.urlImage = "";
	this.isKySo = false;
	var inst = this;
	
	var loadingTask = PDFJS.getDocument(this.url);
	loadingTask.promise.then(function (pdf) {
	    var scale = 1.7;
	    inst.number_of_pages = pdf.pdfInfo.numPages;

	    for (var i = 1; i <= pdf.pdfInfo.numPages; i++) {
	        pdf.getPage(i).then(function (page) {
	            var viewport = page.getViewport(scale);
	            var canvas = document.createElement('canvas');
	            document.getElementById(inst.container_id).appendChild(canvas);
	            canvas.className = 'pdf-canvas';
	            canvas.height = viewport.height;
	            canvas.width = viewport.width;
	            context = canvas.getContext('2d');

	            var renderContext = {
	                canvasContext: context,
	                viewport: viewport
	            };
	            var renderTask = page.render(renderContext);
	            renderTask.then(function () {
	                $('.pdf-canvas').each(function (index, el) {
	                    $(el).attr('id', 'page-' + (index + 1) + '-canvas');
	                });
	                inst.pages_rendered++;
	                if (inst.pages_rendered == inst.number_of_pages) inst.initFabric();
	            });
	        });
	    }
	}, function (reason) {
	    console.error(reason);
	});

	this.initFabric = function () {
		var inst = this;
	    $('#' + inst.container_id + ' canvas').each(function (index, el) {
	        var background = el.toDataURL("image/png");
	        var fabricObj = new fabric.Canvas(el.id, {
	            freeDrawingBrush: {
	                width: 1,
	                color: inst.color
	            },
				allowTouchScrolling: true,
	        });
	        inst.fabricObjects.push(fabricObj);
	        fabricObj.setBackgroundImage(background, fabricObj.renderAll.bind(fabricObj));
	        $(fabricObj.upperCanvasEl).click(function (event) {
	            inst.active_canvas = index;
	            inst.fabricClickHandler(event, fabricObj);
	        });
	    });
	}

	this.fabricClickHandler = function(event, fabricObj) {
		var inst = this;
	    if (inst.active_tool == 2) {
	        var text = new fabric.IText('Sample text', {
	            left: event.clientX - fabricObj.upperCanvasEl.getBoundingClientRect().left,
	            top: event.clientY - fabricObj.upperCanvasEl.getBoundingClientRect().top,
	            fill: inst.color,
	            fontSize: inst.font_size,
	            selectable: true
	        });
	        fabricObj.add(text);
	        inst.active_tool = 0;
	    }
	}
}

PDFAnnotate.prototype.enableSelector = function () {
	var inst = this;
	inst.active_tool = 0;
	if (inst.fabricObjects.length > 0) {
	    $.each(inst.fabricObjects, function (index, fabricObj) {
	        fabricObj.isDrawingMode = false;
	    });
	}
}

PDFAnnotate.prototype.enablePencil = function () {
	var inst = this;
	inst.active_tool = 1;
	if (inst.fabricObjects.length > 0) {
	    $.each(inst.fabricObjects, function (index, fabricObj) {
	        fabricObj.isDrawingMode = true;
	    });
	}
}

PDFAnnotate.prototype.enableAddText = function () {
	var inst = this;
	inst.active_tool = 2;
	if (inst.fabricObjects.length > 0) {
	    $.each(inst.fabricObjects, function (index, fabricObj) {
	        fabricObj.isDrawingMode = false;
	    });
	}
}

PDFAnnotate.prototype.enableRectangle = function () {
	var inst = this;
	var fabricObj = inst.fabricObjects[inst.active_canvas];
	inst.active_tool = 4;

	fabricObj.isDrawingMode = false;
	// fabricObj.allowTouchScrolling = false;
	// if (inst.fabricObjects.length > 0) {
		// $.each(inst.fabricObjects, function (index, fabricObj) {
			// fabricObj.isDrawingMode = false;
			// fabricObj.allowTouchScrolling = false;
		// });
	// }

	if (inst.urlImage == "") {
		var rect = new fabric.Rect({
			left: fabricObj.width / 2 - 45,
			top: fabricObj.height / 2 - 45,
			width: inst.widthRec,
			height: inst.heightRec,
			fill: inst.color,
			stroke: inst.borderColor,
			strokeSize: inst.borderSize
		});
		fabricObj.add(rect);
	} else {
		fabric.Image.fromURL(inst.urlImage, function (oImg) {
			//oImg.width = inst.widthRec;
			//oImg.height = inst.heightRec;

			oImg.scaleToWidth(inst.widthRec);
			oImg.scaleToHeight(inst.heightRec);
			oImg.left = fabricObj.width / 2 - 45;
			oImg.top = fabricObj.height / 2 - 45;
			oImg.backgroundColor = 'rgba(0, 0, 0, 0.05)';
			oImg.lockUniScaling = true;
			fabricObj.add(oImg);
			bindImageEvents(oImg, fabricObj);
		});
	}

	function bindImageEvents (imageObject, fabricObj) {
		imageObject.on('mousedown', function(event) {
			// Handle touch start event
			if (fabricObj.allowTouchScrolling) fabricObj.allowTouchScrolling = false;
			
		});

		imageObject.on('mouseup', function(event) {
			// Handle touch start event
			if (!fabricObj.allowTouchScrolling)
			fabricObj.allowTouchScrolling = true;
		});

	}
}

PDFAnnotate.prototype.enableAddArrow = function () {
	var inst = this;
	inst.active_tool = 3;
	if (inst.fabricObjects.length > 0) {
	    $.each(inst.fabricObjects, function (index, fabricObj) {
	        fabricObj.isDrawingMode = false;
	        new Arrow(fabricObj, inst.color, function () {
	            inst.active_tool = 0;
	        });
	    });
	}
}

PDFAnnotate.prototype.deleteSelectedObject = function () {
	var inst = this;
	var activeObject = inst.fabricObjects[inst.active_canvas].getActiveObject();
	if (activeObject)
	{
		inst.fabricObjects[inst.active_canvas].remove(activeObject);
		// alertify.confirm("Xóa vị trí?",
		  // function(){
			// inst.fabricObjects[inst.active_canvas].remove(activeObject);
			// return true;
		  // },
		  // function(){
			// console.log("no")
		  // });
	}
}

PDFAnnotate.prototype.savePdf = function () {
	var inst = this;
	var doc = new jsPDF();
	$.each(inst.fabricObjects, function (index, fabricObj) {
	    if (index != 0) {
	        doc.addPage();
	        doc.setPage(index + 1);
	    }
	    doc.addImage(fabricObj.toDataURL(), 'png', 0, 0);
	});
	doc.save('sample.pdf');
}

PDFAnnotate.prototype.setBrushSize = function (size) {
	var inst = this;
	$.each(inst.fabricObjects, function (index, fabricObj) {
	    fabricObj.freeDrawingBrush.width = size;
	});
}

PDFAnnotate.prototype.setColor = function (color) {
	var inst = this;
	inst.color = color;
	$.each(inst.fabricObjects, function (index, fabricObj) {
        fabricObj.freeDrawingBrush.color = color;
    });
}

PDFAnnotate.prototype.setBorderColor = function (color) {
	var inst = this;
	inst.borderColor = color;
}

PDFAnnotate.prototype.setWidthHeightRec = function (width, height) {
	var inst = this;
	inst.widthRec = width;
	inst.heightRec = height;
}

PDFAnnotate.prototype.setUrlImage = function (urlImage) {
	var inst = this;
	inst.urlImage = urlImage;
}

PDFAnnotate.prototype.setIsKySo = function (isKySo) {
	var inst = this;
	inst.isKySo = isKySo;
}

PDFAnnotate.prototype.getIsKySo = function () {
	var inst = this;
	return inst.isKySo
}

PDFAnnotate.prototype.setFontSize = function (size) {
	this.font_size = size;
}

PDFAnnotate.prototype.setBorderSize = function (size) {
	this.borderSize = size;
}

PDFAnnotate.prototype.clearActivePage = function () {
	var inst = this;
	var fabricObj = inst.fabricObjects[inst.active_canvas];
	var bg = fabricObj.backgroundImage;
	
	fabricObj.clear();
	fabricObj.setBackgroundImage(bg, fabricObj.renderAll.bind(fabricObj));
	fabricObj.allowTouchScrolling = true;
}

PDFAnnotate.prototype.serializePdf = function() {
	var inst = this;
	if (inst.isKySo == true){
			inst.isKySo = false;
			return JSON.stringify(inst.fabricObjects, null, 4);
	} else{
			return ''
	}

}
