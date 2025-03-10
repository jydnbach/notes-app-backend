require('dotenv').config();
const express = require('express');
const Note = require('./models/note');

const app = express();
// const cors = require('cors');
// // app.use(cors());

app.use(express.static('dist'));

let notes = [
  {
    id: '1',
    content: 'HTML is easy',
    important: true,
  },
  {
    id: '2',
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: '3',
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:', request.path);
  console.log('Method:', request.body);
  console.log('---');
  next();
};

app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, resonse) => {
  response.status(404).send({ error: 'unkown endpoint' });
};

app.get('/', (request, response) => {
  response.send('<h1>Hello world</h1>');
});

app.get('/api/notes', (request, response) => {
  // response.json(notes);
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.statusCode(400).json({ error: 'content missing' });
  }

  const note = new Note({
    content: body.content,
    impmortant: body.important || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then((note) => {
    response.json(note);
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' });
//   response.end(JSON.stringify(notes));
// });

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
