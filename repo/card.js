const error = require('error')
const {db} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  text: 'text',
  type: 'type',
  deckId: 'deck_id',
  active: 'active',
  createdAt: 'created_at',
})

async function get () {
  return db.any(`
    SELECT *
    FROM card
  `)
  .map(map)
  .catch(error.db('db.read'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM card
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('deck.not_found'))
  .catch(error.db('db.read'))
}

async function getByDeckId (id) {
  return db.any(`
    SELECT *
    FROM card
    WHERE deck_id = $[id]
  `, {id})
  .map(map)
  .catch(error.db('db.read'))
}

async function getEnabledByDeckId (id) {
  return db.any(`
    SELECT *
    FROM card
    WHERE
      deck_id = $[id]
      AND active = TRUE
  `, {id})
  .map(map)
  .catch(error.db('db.read'))
}

async function create (text, type, deckId) {
  return db.one(`
    INSERT INTO card (text, type, deck_id)
    VALUES ($[text], $[type], $[deckId])
    RETURNING id
  `, {
    text,
    type,
    deckId,
  })
  .catch({constraint: 'card_deck_id_fkey'}, error('deck.not_found'))
  .catch(error.db('db.write'))
}

async function deleteById (id) {
  return db.one(`
    DELETE FROM card
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('card.not_found'))
  .catch(error.db('db.delete'))
}

async function disableById (id) {
  return db.one(`
    UPDATE card
    SET active = FALSE
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('card.not_found'))
  .catch(error.db('db.write'))
}

async function enableById (id) {
  return db.one(`
    UPDATE card
    SET active = TRUE
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('card.not_found'))
  .catch(error.db('db.write'))
}

module.exports = {
  create,
  deleteById,
  disableById,
  enableById,
  get,
  getByDeckId,
  getById,
  getEnabledByDeckId,
}
