(function(){
	const videoElement = document.getElementById('video');
	const canvasElement = document.getElementById('canvas');
	const ctx = canvasElement.getContext('2d');

	const font = '24px helvetica';
	const activeColor = '#2fff00';
	const textColor = '#000000';
	ctx.font = font;
	ctx.textBaseline = 'top';
	ctx.strokeStyle = activeColor;
	ctx.lineWidth = 1;

	const showDetected = function(detectedObjects){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		detectedObjects.forEach(function(detected){
			const x = detected.bbox[0];
			const y = detected.bbox[1];
			const width = detected.bbox[2];
			const height = detected.bbox[3];
			// Draw the bounding box.
			ctx.strokeRect(x, y, width, height);

			// Draw the label background.
			ctx.fillStyle = activeColor;
			const textWidth = ctx.measureText(detected.class).width;
			const textHeight = parseInt(font, 10);
			// draw top left rectangle
			ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
			// draw bottom left rectangle
			ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);
			// Draw the text last to ensure it's on top.
			ctx.fillStyle = textColor;
			ctx.fillText(detected.class, x, y);
			ctx.fillText(detected.score.toFixed(2), x, y + height - textHeight);
		});
	}

	const detectFromVideoFrame = function(model, video){
		model.detect(video).then(detectedObjects => {
			showDetected(detectedObjects);

			requestAnimationFrame(() => {
				detectFromVideoFrame(model, video);
			});
		});
	}

	if (navigator.mediaDevices.getUserMedia){
		const webcamPromise = navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: false,
			})
			.then(function(stream){
				videoElement.srcObject = stream;
				cocoSsd.load()
					.then(function(model){
						detectFromVideoFrame(model, videoElement);
					});
			})
	}
})();