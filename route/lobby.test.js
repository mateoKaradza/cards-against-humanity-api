const _ = require('lodash')

const test = require('test')

test.api('create a lobby', async function (t, request, store) {
  const r = await request.post('/lobby').set(await test.auth('user1@example.com', 'user1')).send({
    name: 'Lobby One',
    deckId: 1,
    size: 10,
  })

  const data = _.get(r, 'body.data')
  t.is(r.status, 200, 'success')

  const r2 = await request.get(`/lobby/${data.id}/user`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r2.status, 200, 'success')
  t.is(r2.body.data.length, 1, 'just one participant')

  store.set('lobby 1', data)
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

  await request.post(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))

  const r = await request.delete(`/lobby/${id}`).set(await test.auth('user2@example.com', 'user2'))
  t.is(r.status, 401, 'fails to delete a lobby as a regular user user')

  const r2 = await request.delete(`/lobby/${id}`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r2.status, 200, 'success')
})

test.api('join a lobby', async function (t, request, store) {
  const {id} = store.get('lobby 1')

  const r = await request.post(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))
  t.is(r.status, 200, 'success')

  const r2 = await request.get(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))
  t.is(r2.body.data.length, 2, 'two participants')
})

test.api('leave a lobby', async function (t, request, store) {
  const {id} = store.get('lobby 1')

  const r = await request.delete(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))
  t.is(r.status, 200, 'success')

  const r2 = await request.get(`/lobby/${id}/user`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r2.body.data.length, 1, 'one participant')
})

test.api('kick user from a lobby', async function (t, request, store) {
  const {id} = store.get('lobby 1')
  await request.post(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))

  const user = await request.get('/user/email/user2@example.com').set(await test.auth('superadmin@example.com', 'superadmin'))

  const userId = _.get(user, 'body.data.id')

  const r = await request.delete(`/lobby/${id}/user/${userId}`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r.status, 200, 'delete success')

  const r2 = await request.get(`/lobby/${id}/user`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r2.body.data.length, 1, 'one participant')
})

test.api('lobby admin leaves a lobby', async function (t, request, store) {
  const {id} = store.get('lobby 1')
  await request.post(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))

  await request.delete(`/lobby/${id}/user`).set(await test.auth('user1@example.com', 'user1'))

  const r2 = await request.get(`/lobby/${id}/user`).set(await test.auth('user2@example.com', 'user2'))
  t.is(r2.body.data[0].admin, true, 'another user became admin')
})
