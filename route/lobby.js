const joi = require('joi')
const router = new (require('koa-router'))()

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
  ctx.state.r = await lobbyRepo.getById(id)
})

// TODO: Only allow a lobby owner to delete the lobby
router.delete('/lobby/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  await lobbyRepo.deleteById(id)
  ctx.state.r = {}
})

module.exports = router
