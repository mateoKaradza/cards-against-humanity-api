const _ = require('lodash')

const test = require('test')

test.api('game one', async function (t, request, store) {
  const data = _.get('body.data', await request.post('/lobby').set(await test.auth('user1@example.com', 'user1')).send({
    name: 'Game Lobby',
    deckId: 1,
    size: 10,
  }))
  store.set('game 1', data)
  const {id} = data

  await request.post(`/lobby/${id}/user`).set(await test.auth('user4@example.com', 'user2'))
  await request.post(`/lobby/${id}/user`).set(await test.auth('user5@example.com', 'user2'))
  await request.post(`/lobby/${id}/user`).set(await test.auth('user6@example.com', 'user2'))

  const r = await request.post(`/game/${id}/round/1`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r.status, 200, 'first run started')

  const r1 = await request.get(`/game/${id}/round/1`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r1.status, 200, 'round exists')
  t.is(r1.body.data, {}, 'czar exists')

  const r2 = await request.get(`/game/${id}/card`).set(await test.auth('user1@example.com', 'user1'))
  t.is(r2.body.data.length, 10, 'player has 10 cards')
  const r3 = await request.get(`/game/${id}/card`).set(await test.auth('user4@example.com', 'user2'))
  t.is(r3.body.data.length, 10, 'player has 10 cards')
  const r4 = await request.get(`/game/${id}/card`).set(await test.auth('user5@example.com', 'user2'))
  t.is(r4.body.data.length, 10, 'player has 10 cards')
  const r5 = await request.get(`/game/${id}/card`).set(await test.auth('user6@example.com', 'user2'))
  t.is(r5.body.data.length, 10, 'player has 10 cards')
})
