const _ = require('lodash')
const error = require('error')
const {db} = require('db')
const lobbyRepo = require('repo/lobby')
const {mapper} = require('repo/base')

const participantMap = mapper({
  lobbyId: 'lobby_id',
  userId: 'user_id',
  admin: 'admin',
  points: 'points',
  joinedAt: 'joined_at',
})

async function getCzarCard (id, deckId) {
  const cards = await db.many(`
    SELECT *
    FROM card
    WHERE
      id NOT IN (
        SELECT czar_card_id
        FROM round
        WHERE lobby_id = $[id]
      )
      AND type = 1
      AND deck_id = $[deckId]
  `, {
    id,
    deckId,
  })
  .catch(error.db('db.read'))
  return _.sample(cards)
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
  .map(participantMap)

  return _.sample(users)
}

async function startRound (id, round) {
  const {deckId} = await lobbyRepo.getById(id)
  const {id: cardId} = await getCzarCard(id, deckId)
  const {userId} = await getNextCzarUser(id)

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
    FROM card
    WHERE
      id NOT IN (
        SELECT card_id
        FROM user_card
        WHERE lobby_id = $[id]
      )
      AND deck_id = $[id]
  `, {
    id,
  })

  return _.sampleSize(cards, limit)
}

async function fillHand (id, roundNumber) {
  let cardIndex = 0
  let query = ''
  let cards = await getCards(id)

  let participants

  try {
    participants = await db.many(`
      SELECT user_id, count (card_id) as cards
      FROM user_card
      WHERE
        lobby_id = $[id]
        AND used_round = NULL
      GROUP BY user_id
    `, {
      id,
    })
  } catch (error) {
    participants = await db.many(`
      SELECT user_id, 0 as cards
      FROM participant
      WHERE lobby_id = $[id]
    `, {
      id,
    })
  }

  participants.forEach(async p => {
    for (let i = p.cards; i < 10; i++) {
      query += `
        INSERT INTO user_card (lobby_id, user_id, round, card_id)
        VALUES (${id}, ${p.user_id}, ${roundNumber}, ${cards[cardIndex++].id});
      `
    }
  })

  return db.none(query)
}

module.exports = {
  fillHand,
  getHand,
  startRound,
}
