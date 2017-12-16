const _ = require('lodash')

const consts = require('const')
const test = require('test')

test.api('add a card to the deck', async function (t, request, store) {
  const deckId = _.get(await request.post('/deck').set(await test.auth('admin@example.com', 'admin')).send({
    name: 'Deck For Cards',
  }), 'body.data.id')

  store.set('deck for cards', {id: deckId})

  const r = await request.post('/card').set(await test.auth('admin@example.com', 'admin')).send({
    text: 'White Card',
    type: consts.card.white,
    deckId,
  })

  t.is(r.status, 200, 'added white card')
  store.set('white card 1', _.get(r, 'body.data'))

  const r2 = await request.post('/card').set(await test.auth('admin@example.com', 'admin')).send({
    text: 'Black Card',
    type: consts.card.black,
    deckId,
  })

  t.is(r2.status, 200, 'added black card')
  store.set('black card 1', _.get(r2, 'body.data'))
})

test.api('get all cards', async function (t, request) {
  const r = await request.get(`/card`).set(await test.auth('user1@example.com', 'user1'))

  t.is(r.status, 200, 'success')
  t.ok(r.body.data.length, 'returned an array')
})

test.api('disable a card', async function (t, request, store) {
  const deck = store.get('deck for cards')
  const card = _.get(await request.post('/card').set(await test.auth('admin@example.com', 'admin')).send({
    text: 'Card for disabling',
    type: consts.card.white,
    deckId: deck.id,
  }), 'body.data')
  store.set('card for enabling', card)
  const r = await request.post(`/card/${card.id}/disable`).set(await test.auth('admin@example.com', 'admin')).send({})
  t.is(r.status, 200, 'success')

  const theCard = _.get(await request.get(`/card/${card.id}`).set(await test.auth('admin@example.com', 'admin')), 'body.data')
  t.is(theCard.active, false, 'card inactive')
})

test.api('enable a card', async function (t, request, store) {
  const card = store.get('card for enabling')
  const r = await request.post(`/card/${card.id}/enable`).set(await test.auth('admin@example.com', 'admin')).send({})
  t.is(r.status, 200, 'success')

  const theCard = _.get(await request.get(`/card/${card.id}`).set(await test.auth('admin@example.com', 'admin')), 'body.data')
  t.is(theCard.active, true, 'card active')
})

test.api('delete a card', async function (t, request, store) {
  const deck = store.get('deck for cards')
  const card = _.get(await request.post('/card').set(await test.auth('admin@example.com', 'admin')).send({
    text: 'Delete me',
    type: consts.card.white,
    deckId: deck.id,
  }), 'body.data')
  const r = await request.delete(`/card/${card.id}`).set(await test.auth('admin@example.com', 'admin'))

  t.is(r.status, 200, 'success')
})
