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

function get () {
  return db.any(`
    SELECT *
    FROM lobby
  `)
  .map(map)
  .catch(error.db('db.read'))
}

function getById (id) {
  return db.one(`
    SELECT *
    FROM lobby
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('lobby.not_found'))
  .catch(error.db('db.read'))
}

function create (name, deckId, size) {
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

function deleteById (id) {
  return db.one(`
    DELETE FROM lobby
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('lobby.not_found'))
  .catch(error.db('db.delete'))
}

function addUserToLobby (id, userId, admin = false) {
  return db.one(`
    INSERT INTO participants (lobby_id, user_id, admin)
    VALUES ($[id], $[userId], $[admin])
  `, {
    id,
    userId,
    admin,
  })
}

function removeUserFromLobby (id, userId) {
  return db.none(`
    DELETE FROM participants
    WHERE lobby_id = $[id]
      AND user_id = [$userId]
  `, {
    id,
    userId,
  })
}

module.exports = {
  addUserToLobby,
  create,
  deleteById,
  get,
  getById,
  removeUserFromLobby,
}
