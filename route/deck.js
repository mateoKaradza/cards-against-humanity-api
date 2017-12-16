const joi = require('joi')
const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const consts = require('const')
const responder = require('middleware/responder')
const roleUser = require('middleware/roleUser')
const validate = require('middleware/validate')
const cardRepo = require('repo/card')
const deckRepo = require('repo/deck')

router.use(responder)

router.get('/deck', auth, async function (ctx) {
  ctx.state.r = await deckRepo.get()
})

router.get('/deck/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await deckRepo.getById(id)
})

router.post('/deck', auth, validate('body', {
  name: joi.string().trim().required(),
}), roleUser.gte(consts.roleUser.admin), async function (ctx) {
  const {name} = ctx.v.body
  const {id} = await deckRepo.create(name)
  ctx.state.r = await deckRepo.getById(id)
})

router.delete('/deck/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), roleUser.gte(consts.roleUser.admin), async function (ctx) {
  const {id} = ctx.v.param
  await deckRepo.deleteById(id)
  ctx.state.r = {}
})

router.get('/deck/:id/card', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await cardRepo.getByDeckId(id)
})

router.get('/deck/:id/card/enabled', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await cardRepo.getEnabledByDeckId(id)
})

module.exports = router
