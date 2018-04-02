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

// TODO: remove this function, use leave instead
router.delete('/lobby/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby(true), async function (ctx) {
  const {id} = ctx.v.param
  await lobbyRepo.deleteById(id)
  ctx.state.r = {}
})

router.post('/lobby/:id/user', auth, validate('param', {
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

// TODO: add usernames to response
router.get('/lobby/:id/user', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby(false), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await lobbyRepo.getParticipants(id)
})

router.delete('/lobby/:id/user/:userId', auth, validate('param', {
  id: joi.number().integer().positive().required(),
  userId: joi.number().integer().positive().required(),
}), belongsToLobby(true), async function (ctx) {
  // TODO: Socket: inform other participants
  const {id, userId} = ctx.v.param
  const participant = await lobbyRepo.getParticipant(id, userId)

  if (participant.admin) {
    throw new error.GenericError('lobby.access_denied', null, 401)
  }

  await lobbyRepo.removeUserFromLobby(id, userId)
  ctx.state.r = {}
})

router.delete('/lobby/:id/user', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby(false), async function (ctx) {
  // TODO: Socket: inform other participants
  const {id} = ctx.v.param
  const {id: userId} = ctx.state.user
  const participant = await lobbyRepo.getParticipant(id, userId)
  await lobbyRepo.removeUserFromLobby(id, userId)

  if (participant.admin) {
    const users = await lobbyRepo.getParticipants(id)

    if (users.length) {
      await lobbyRepo.setParticipantRole(id, users[0].userId, true)
    } else {
      await lobbyRepo.deleteById(id)
    }
  }
  ctx.state.r = {}
})

module.exports = router
