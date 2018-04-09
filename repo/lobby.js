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

const participantMap = mapper({
  lobbyId: 'lobby_id',
  userId: 'user_id',
  admin: 'admin',
  points: 'points',
  joined: 'joined_at',
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
  return db.none(`
    INSERT INTO participant (lobby_id, user_id, admin)
    VALUES ($[id], $[userId], $[admin])
  `, {
    id,
    userId,
    admin,
  })
  .catch({constraint: 'participant_lobby_id_fkey'}, error('lobby.not_found'))
  .catch({constraint: 'participant_user_id_fkey'}, error('user.not_found'))
  .catch(error.db('db.write'))
}

function removeUserFromLobby (id, userId) {
  return db.none(`
    DELETE FROM participant
    WHERE
      lobby_id = $[id]
      AND user_id = $[userId]
  `, {
    id,
    userId,
  })
  .catch({constraint: 'participant_lobby_id_fkey'}, error('lobby.not_found'))
  .catch({constraint: 'participant_user_id_fkey'}, error('user.not_found'))
  .catch(error.db('db.delete'))
}

function setParticipantRole (id, userId, admin) {
  return db.none(`
    UPDATE participant
    SET admin = $[admin]
    WHERE
      lobby_id = $[id]
      AND user_id = $[userId]
  `, {
    id,
    userId,
    admin,
  })
  .catch({constraint: 'participant_lobby_id_fkey'}, error('lobby.not_found'))
  .catch({constraint: 'participant_user_id_fkey'}, error('user.not_found'))
  .catch(error.db('db.write'))
}

function getParticipants (id) {
  return db.any(`
    SELECT *
    FROM participant
    WHERE lobby_id = $[id]
  `, {
    id,
  })
  .map(participantMap)
  .catch(error.db('db.read'))
}

function getParticipant (id, userId) {
  return db.one(`
    SELECT *
    FROM participant
    WHERE
      lobby_id = $[id]
      AND user_id = $[userId]
  `, {
    id,
    userId,
  })
  .then(participantMap)
  .catch(error.db('db.read'))
}

module.exports = {
  addUserToLobby,
  create,
  deleteById,
  get,
  getById,
  getParticipant,
  getParticipants,
  setParticipantRole,
  removeUserFromLobby,
}
