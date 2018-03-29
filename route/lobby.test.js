const _ = require('lodash')

const test = require('test')

test.api('create a lobby', async function (t, request, store) {
  const r = await request.post('/lobby').set(await test.auth('user1@example.com', 'user1')).send({
    name: 'Lobby One',
    deckId: 1,
    size: 10,
  })

  t.is(r.status, 200, 'success')
  store.set('lobby 1', _.get(r, 'body.data'))
})

test.api('get all lobbies', async function (t, request) {
  const r = await request.get(`/lobby`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.ok(r.body.data.length, 'returned an array')
})

test.api('get a lobby', async function (t, request, store) {
  const lobby = store.get('lobby 1')
  const {id} = lobby
  const r = await request.get(`/lobby/${id}`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.deepEqual(r.body.data, lobby, 'returning the lobby')
})

test.api('delete a lobby', async function (t, request) {
  const id = _.get(await request.post('/lobby').set(await test.auth('user1@example.com', 'user1')).send({
    name: 'Lobby For Deleting',
    deckId: 1,
    size: 10,
  }), 'body.data.id')

  const r = await request.delete(`/lobby/${id}`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
})
