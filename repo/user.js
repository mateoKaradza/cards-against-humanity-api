const _ = require('lodash')
const assert = require('assert')
const bcrypt = require('bcrypt')

const consts = require('const')
const error = require('error')
const {db} = require('db')
const {mapper} = require('repo/base')

const map = mapper({
  id: 'id',
  createdAt: 'created_at',
  email: 'email',
  username: 'username',
})

function hashPassword (password) {
  return bcrypt.hash(password, _.toInteger(process.env.BCRYPT_ROUNDS))
  .catch(error.db('user.password_invalid'))
}

function checkPasswordWithHash (password, hash) {
  password = password || 'null'
  hash = hash || 'null'
  return bcrypt.compare(password, hash).then(assert)
  .catch(error.AssertionError, error('user.password_wrong'))
}

async function checkPassword (id, password) {
  const r = await db.one(`
    SELECT password
    FROM "user"
    WHERE id = $1
  `, [id])
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
  if (!password && !r.password) return
  await checkPasswordWithHash(password, r.password)
}

async function create (email, username, password) {
  return db.tx(async function (t) {
    return t.none(`
      INSERT INTO
        "user" (email, username, password)
        VALUES ($[email], $[username], $[password])
      INSERT INTO
        user_role (user_id, role)
        VALUES (currval('user_id_seq'), $[role])
    `, {
      email,
      username,
      password: await hashPassword(password),
      role: consts.roleUser.none,
    })
    .catch({constraint: 'user_email_key'}, error('user.duplicate.email'))
    .catch({constraint: 'user_username_key'}, error('user.duplicate.username'))
  })
  .catch(error.db('db.write'))
}

async function updatePassword (id, password) {
  await db.none(`
    UPDATE "user"
    SET password = $2
    WHERE id = $1
  `, [id, await hashPassword(password)])
  .catch(error.db('db.update'))
}

function updateEmail (id, email) {
  return db.one(`
    UPDATE "user"
    SET email = $2
    WHERE id = $1
    RETURNING *
  `, [id, email])
  .catch({constraint: 'user_email_key'}, error('user.duplicate'))
  .catch(error.db('db.write'))
  .then(map)
}

function getById (id) {
  return db.one(`
    SELECT *
    FROM "user"
    WHERE id = $1
  `, [id])
  .then(map)
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
}

async function getByIdPassword (id, password) {
  const user = await db.one(`
    SELECT *
    FROM "user"
    WHERE id = $1
  `, [id])
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
  await checkPasswordWithHash(password, user.password)
  return map(user)
}

function getByEmail (email) {
  return db.one(`
    SELECT *
    FROM "user"
    WHERE email = $1
  `, [email])
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
  .then(map)
}

async function getByEmailPassword (email, password) {
  const user = await db.one(`
    SELECT *
    FROM "user"
    WHERE email = $1
  `, [email])
  .catch(error.QueryResultError, error('user.not_found'))
  .catch(error.db('db.read'))
  await checkPasswordWithHash(password, user.password)
  .catch(error('user.password_wrong'))
  return map(user)
}

function getRoleById (id) {
  return db.one(`
    SELECT role
    FROM user_role
    WHERE user_id = $[id]
  `, {id})
  .catchReturn(error.QueryResultError, consts.roleUser.none)
  .catch(error.db('db.read'))
  .get('role')
}

function setRoleById (id, role) {
  return db.none(`
    UPDATE user_role
    SET role = $[role]
    WHERE user_id = $[id]
  `, {id, role})
  .catch({constraint: 'user_role_user_id_fkey'}, error.db('user.not_found'))
  .catch(error.db('db.write'))
}
module.exports = {
  create,
  checkPassword,
  updatePassword,
  updateEmail,
  getByEmail,
  getByEmailPassword,
  getById,
  getByIdPassword,
  getRoleById,
  setRoleById,
}
