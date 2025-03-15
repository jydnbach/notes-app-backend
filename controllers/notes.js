const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({});
  res.json(notes);
});

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

notesRouter.post('/', async (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({ error: 'Content is missing' }).end();
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  const savedNote = await note.save();
  res.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

notesRouter.put('/:id', async (req, res, next) => {
  const body = req.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, {
      new: true,
    });
    res.json(updatedNote);
  } catch (err) {
    next(err);
  }
});

module.exports = notesRouter;
