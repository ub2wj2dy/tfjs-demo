const express = require('express');
const path = require('path');

const config = require('./config.json');
const PREFERABLE_HEIGHT = config.webcam.height;
const PREFERABLE_WIDTH = config.webcam.width;
const FPS = config.webcam.fps || 1;
const public_dir = path.join(__dirname, '../public');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const cv = require('opencv4nodejs');
const webcam = new cv.VideoCapture(0);
webcam.set(cv.CAP_PROP_FRAME_WIDTH, PREFERABLE_WIDTH);
webcam.set(cv.CAP_PROP_FRAME_HEIGHT, PREFERABLE_HEIGHT);

app.get('/', (req, res) => {
	res.sendFile(path.join(public_dir, 'index.html'))
})

cocoSsd.load('mobilenet_v2').then((model) => {
	console.log('coco ssd loaded');

	const captureAndSend = () => {
		webcam.readAsync()
		.then((frame) => {
			const {cols: width, rows: height} = frame;
			const img = cv.imencode('.jpg', frame);
			io.emit('image', img.toString('base64'));

			// BGR to RGB
			const frame_rgb = frame.cvtColor(cv.COLOR_BGR2RGB);
			const tensor = tf
				.tensor3d(new Uint8Array(frame_rgb.getData()), [height, width, 3], 'int32');
			model.detect(tensor).then((detectedObjects) => {
				io.emit('detected', detectedObjects);
			});
		});
	}

	setInterval(captureAndSend, 1000 / FPS);
});

io.on('connection', (socket) => {
	console.log(`${socket.id} user connected`);
	socket.on('disconnect', () => {
		console.log(`${socket.id} user disconnected`);
	});
});

app.all('/*', (req, res) => {
	return res.status(404).send('Not found');
});

http.listen(config.port, () => {
	console.log(`Started on ${config.port}`);
});