const error = require('error')
const {db} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
})

async function get () {
  return db.any(`
    SELECT *
    FROM lobby
  `)
  .map(map)
  .catch(error.db('db.read'))
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM lobby
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('lobby.not_found'))
  .catch(error.db('db.read'))
}

async function create (name, deckId, size) {
  return db.one(`
    INSERT INTO lobby (name, deck_id, size)
    VALUES ($[name], $[deckId], $[size])
    RETURNING id
  `, {
    name,
    deckId,
    size,
  })
  .catch(error.db('db.write'))
}

async function deleteById (id) {
  return db.one(`
    DELETE FROM lobby
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('lobby.not_found'))
  .catch(error.db('db.delete'))
}

module.exports = {
  create,
  deleteById,
  get,
  getById,
}
