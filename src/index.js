const express = require('express');
const path = require('path');

const config = require('./config.json');
const public_dir = path.join(__dirname, '../public');

const app = express();
const map = {
	'/': 'index.html',
	'/bundle.js': 'bundle.js',
	'/bundle.css': 'bundle.css'
}

Object.keys(map).forEach(route => {
	app.get(route, (req, res) => {
		res.sendFile(path.join(public_dir, map[route]))
	})
});

app.get('/', (req, res) => {
	res.sendFile(path.join(public_dir, 'index.html'));
});

app.all('/*', (req, res) => {
	return res.status(404).send('Not found');
});

app.listen(config.port, () => { console.log(`Started on ${config.port}` )});