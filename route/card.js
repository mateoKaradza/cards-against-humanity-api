const joi = require('joi')
const router = new (require('koa-router'))()

const auth = require('middleware/auth')
const consts = require('const')
const responder = require('middleware/responder')
const roleUser = require('middleware/roleUser')
const validate = require('middleware/validate')
const cardRepo = require('repo/card')

router.use(responder)

router.get('/card', auth, async function (ctx) {
  ctx.state.r = await cardRepo.get()
})

router.get('/card/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  ctx.state.r = await cardRepo.getById(id)
})

router.post('/card', auth, validate('body', {
  text: joi.string().trim().required(),
  type: joi.allow([consts.card.white, consts.card.black]).required(),
  deckId: joi.number().integer().positive().required(),
}), roleUser.gte(consts.roleUser.admin), async function (ctx) {
  const {text, type, deckId} = ctx.v.body
  const {id} = await cardRepo.create(text, type, deckId)
  ctx.state.r = await cardRepo.getById(id)
})

router.delete('/card/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), roleUser.gte(consts.roleUser.admin), async function (ctx) {
  const {id} = ctx.v.param
  await cardRepo.deleteById(id)
  ctx.state.r = {}
})

router.post('/card/:id/enable', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  await cardRepo.enableById(id)
  ctx.state.r = {}
})

router.post('/card/:id/disable', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), async function (ctx) {
  const {id} = ctx.v.param
  await cardRepo.disableById(id)
  ctx.state.r = {}
})

module.exports = router
