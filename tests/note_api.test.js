const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');

const mongoose = require('mongoose');

const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const helper = require('./test_helper');

const Note = require('../models/note');

describe('when there are some notes saved initially', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Note.insertMany(helper.initialNotes);
  });

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all notes are returned', async () => {
    const res = await api.get('/api/notes');

    assert.strictEqual(res.body.length, helper.initialNotes.length);
  });

  test('a specific note is within the returned notes', async () => {
    const res = await api.get('/api/notes');

    const contents = res.body.map((r) => r.content);

    assert(contents.includes('Browser can execute only JavaScript'));
  });

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb();

      const noteToView = notesAtStart[0];

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.deepStrictEqual(resultNote.body, noteToView);
    });
  });
});

test('there are two notes', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplified making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

  const contents = notesAtEnd.map((r) => r.content);

  assert(contents.includes('async/await simplified making async calls'));
});

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  };

  await api.post('/api/notes').send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test('a specific note can be viewed', async () => {
  const noteAtStart = await helper.notesInDb();

  const noteToView = noteAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const noteAtEnd = await helper.notesInDb();

  const contents = noteAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(helper.initialNotes.length - 1, noteAtEnd.length);
});

after(async () => {
  await mongoose.connection.close();
});
