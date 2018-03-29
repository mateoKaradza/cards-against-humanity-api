const error = require('error')
const {db} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
})

function get () {
  return db.any(`
    SELECT *
    FROM deck
  `)
  .map(map)
  .catch(error.db('db.read'))
}

function getById (id) {
  return db.one(`
    SELECT *
    FROM deck
    WHERE id = $[id]
  `, {id})
  .then(map)
  .catch(error.QueryResultError, error('deck.not_found'))
  .catch(error.db('db.read'))
}

function create (name) {
  return db.one(`
    INSERT INTO deck (name)
    VALUES ($[name])
    RETURNING id
  `, {name})
  .catch(error.db('db.write'))
}

function deleteById (id) {
  return db.one(`
    DELETE FROM deck
    WHERE id = $[id]
    RETURNING id
  `, {id})
  .catch(error.QueryResultError, error('deck.not_found'))
  .catch(error.db('db.delete'))
}

module.exports = {
  create,
  deleteById,
  get,
  getById,
}
