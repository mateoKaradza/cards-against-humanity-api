const _ = require('lodash')

const error = require('error')
const {db, helper} = require('db')
const lobbyRepo = require('repo/lobby')
const {mapper} = require('repo/base')

const participantMap = mapper({
  lobbyId: 'lobby_id',
  userId: 'user_id',
  admin: 'admin',
  points: 'points',
  joinedAt: 'joined_at',
})

const roundMap = mapper({
  lobbyId: 'lobby_id',
  round: 'round',
  czarId: 'czar_user_id',
  czarCardId: 'czar_card_id',
  userId: 'user_id',
  cardId: 'card_id',
})

const cs = helper.ColumnSet(['lobby_id', 'user_id', 'round', 'card_id'], {table: 'user_card'})

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
      AND type = 0
  `, {
    id,
  })

  return _.sampleSize(cards, limit)
}

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

function getRoundById (id, lobbyId) {
  return db.one(`
    SELECT *
    FROM round
    WHERE
      lobby_id = $[lobbyId]
      AND round = $[id]
  `, {
    id,
    lobbyId,
  })
  .catch(error.db('db.read'))
  .then(roundMap)
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
    SELECT card.*
    FROM card
    INNER JOIN user_card
    ON card.id = user_card.card_id
    WHERE
      user_card.lobby_id = $[id]
      AND user_card.user_id = $[userId]
      AND user_card.used_round IS NULL
  `, {
    id,
    userId,
  })
  .catch(error.db('db.read'))
}

async function fillHand (id, roundNumber) {
  let cardIndex = 0
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

  const prep = []
  participants.map(p => {
    for (let i = p.cards; i < 10; i++) {
      prep.push({
        lobby_id: id,
        user_id: p.user_id,
        round: roundNumber,
        card_id: cards[cardIndex++].id,
      })
    }
  })

  return db.none(helper.insert(prep, cs))
}

module.exports = {
  fillHand,
  getHand,
  getRoundById,
  startRound,
}
