const joi = require('joi')
const router = new (require('koa-router'))()

const error = require('error')
const auth = require('middleware/auth')
const responder = require('middleware/responder')
const validate = require('middleware/validate')
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
  const {id} = await lobbyRepo.create(name, deckId, size)

  // TODO: On create, add user to the lobby as lobby admin

  ctx.state.r = await lobbyRepo.getById(id)
})

// TODO: Only allow a lobby admin to delete the lobby
router.delete('/lobby/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  await lobbyRepo.deleteById(id)
  ctx.state.r = {}
})

router.post('/lobby/:id/join', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  const lobby = await lobbyRepo.getById(id)

  if (lobby.size === 'number of connected users') {
    throw new error.GenericError('lobby.full', null, 400)
  }

  // TODO: add user to the lobby
})

router.post('/lobby/:id/kick/:userId', auth, validate('param', {
  id: joi.number().integer().positive().required(),
  userId: joi.number().integer().positive().required(),
}), async function (ctx) {
  // TODO: kick user from a lobby as a lobby admin, cant kick himself
})

router.post('/lobby/:id/leave', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  // TODO: if user is a lobby admin, transfer to another user from the lobby
  // TODO: if belongs to a lobby, leave it
})

module.exports = router
