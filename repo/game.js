const _ = require('lodash')
const error = require('error')
const {db} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  name: 'name',
  size: 'size',
  deckId: 'deck_id',
  createdAt: 'created_at',
})

async function getCzarCard (id) {
  const cards = await db.many(`
    SELECT *
    FROM deck
    WHERE id NOT IN (
      SELECT czar_card_id
      FROM round
      WHERE lobby_id = $[id]
    )
  `, {
    id,
  })
  .catch(error.db('db.read'))
  return _.some(cards)
}

// TODO: need better logic
async function getNextCzarUser (id) {
  const users = await db.many(`
    SELECT *
    FROM participant
    WHERE lobby_id = $[id]
  `, {
    id,
  })
  .catch(error.db('db.read'))

  return _.some(users)
}

async function startRound (id, round) {
  const {id: cardId} = await getCzarCard(id)
  const {id: userId} = await getNextCzarUser(id)

  return db.none(`
    INSERT INTO round (lobby_id, round, czar_user_id, czar_card_id)
    VALUES ($[id], $[round], $[userId], $[cardId])
  `, {
    id,
    round,
    userId,
    cardId,
  })
  .catch(error.db('db.write'))
}

async function getHand (id, userId) {
  return db.many(`
    SELECT deck.*
    FROM deck
    INNER JOIN user_card
    WHERE
      user_card.card_id = deck.id
      AND user_card.lobby_id = $[id]
      AND user_card.user_id = $[userId]
      AND user_card.used_round IS NULL
  `, {
    id,
    userId,
  })
  .catch(error.db('db.read'))
}

async function getCards (id, limit = 100) {
  const cards = await db.many(`
    SELECT *
    FROM DECK
    WHERE deck.id NOT IN (
      SELECT card_id
      FROM user_card
      WHERE lobby_id = $[id]
    )
  `, {
    id,
  })

  return _.sampleSize(cards, limit)
}

async function fillHand (id) {
  let cardIndex = 0
  let cards = await getCards(id)

  const participants = await db.many(`
    SELECT user_id, count (card_id) as cards
    FROM user_card
    WHERE
      lobby_id = $[id]
      AND used_round = NULL
    GROUP BY user_id
  `, {
    id,
  })
  participants.forEach(async p => {
    // TODO: pitat stipu
    for (let i = p.cards; i < 10; i++) {
      await db.none(`
        GIVE CARD TO USER
      `)
    }
  })
  return db.none(`

  `)
}

module.exports = {
  getHand,
  startRound,
}
