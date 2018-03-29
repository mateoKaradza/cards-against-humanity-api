const joi = require('joi')
const router = new (require('koa-router'))()

const error = require('error')
const auth = require('middleware/auth')
const responder = require('middleware/responder')
const validate = require('middleware/validate')
const {belongsToLobby} = require('middleware/lobby')
const lobbyRepo = require('repo/lobby')

router.use(responder)

router.get('/lobby', auth, async function (ctx) {
  ctx.state.r = await lobbyRepo.get()
})

router.get('/lobby/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await lobbyRepo.getById(id)
})

router.post('/lobby', auth, validate('body', {
  name: joi.string().trim().required(),
  deckId: joi.number().integer().positive().required(),
  size: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {name, deckId, size} = ctx.v.body
  const {id: userId} = ctx.state.user
  const {id} = await lobbyRepo.create(name, deckId, size)
  await lobbyRepo.addUserToLobby(id, userId, true)
  ctx.state.r = await lobbyRepo.getById(id)
})

// TODO: Only allow a lobby admin to delete the lobby
// TODO: remove this function, use leave instead
router.delete('/lobby/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  await lobbyRepo.deleteById(id)
  ctx.state.r = {}
})

router.post('/lobby/:id/users', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  const {id: userId} = ctx.state.user
  const lobby = await lobbyRepo.getById(id)

  const users = await lobbyRepo.getParticipants(id)

  if (lobby.size === users.length) {
    throw new error.GenericError('lobby.full', null, 400)
  }

  await lobbyRepo.addUserToLobby(id, userId, false)
  // TODO: Socket: inform other participants

  ctx.state.r = {}
})

router.get('/lobby/:id/users', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby, async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await lobbyRepo.getParticipants(id)
})

router.delete('/lobby/:id/users/:userId', auth, validate('param', {
  id: joi.number().integer().positive().required(),
  userId: joi.number().integer().positive().required(),
}), belongsToLobby, async function (ctx) {
  // TODO: kick user from a lobby as a lobby admin, cant kick himself
  // TODO: Socket: inform other participants
})

router.delete('/lobby/:id/users', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby, async function (ctx) {
  // TODO: if user is a lobby admin, transfer to another user from the lobby
  // TODO: if belongs to a lobby, leave it
  // TODO: if last user is leaving the lobby (lobby admin), delete the lobby
  // TODO: Socket: inform other participants
  const {id} = ctx.v.param
  const {id: userId} = ctx.state.user
  await lobbyRepo.removeUserFromLobby(id, userId)
  ctx.state.r = {}
})

module.exports = router
