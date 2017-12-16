const _ = require('lodash')

const test = require('test')

test.api('add a deck', async function (t, request, store) {
  const r = await request.post('/deck').set(await test.auth('admin@example.com', 'admin')).send({
    name: 'Deck One',
  })

  t.is(r.status, 200, 'success')
  store.set('deck 1', _.get(r, 'body.data'))
})

test.api('get all decks', async function (t, request) {
  const r = await request.get(`/deck`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.ok(r.body.data.length, 'returned an array')
})

test.api('get a deck', async function (t, request, store) {
  const deck = store.get('deck 1')
  const {id} = deck
  const r = await request.get(`/deck/${id}`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.deepEqual(r.body.data, deck, 'returning the deck')
})

test.api('delete a deck', async function (t, request) {
  const id = _.get(await request.post('/deck').set(await test.auth('admin@example.com', 'admin')).send({
    name: 'Deck For Deleting',
  }), 'body.data.id')

  const r = await request.delete(`/deck/${id}`).set(await test.auth('admin@example.com', 'admin'))

  t.is(r.status, 200, 'success')
})

test.api('get all cards from a deck', async function (t, request, store) {
  const {id} = store.get('deck for cards')
  const r = await request.get(`/deck/${id}/card`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.ok(r.body.data.length, 'returned an array')
})

test.api('get all enabled cards from a deck', async function (t, request, store) {
  const deck = store.get('deck for cards')
  const allCards = _.get(await request.get(`/deck/${deck.id}/card`).set(await test.auth('user1@example.com', 'user1')), 'body.data')

  const card = store.get('card for enabling')
  await request.post(`/card/${card.id}/disable`).set(await test.auth('admin@example.com', 'admin')).send({})
  const enabledCards = _.get(await request.get(`/deck/${deck.id}/card/enabled`).set(await test.auth('user1@example.com', 'user1')), 'body.data')

  t.is(allCards.length > enabledCards.length, true, 'does not return disabled cards')
})
