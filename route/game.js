const joi = require('joi')
const router = new (require('koa-router'))()

// const error = require('error')
const auth = require('middleware/auth')
const {belongsToLobby} = require('middleware/lobby')
const responder = require('middleware/responder')
const validate = require('middleware/validate')
const gameRepo = require('repo/game')

router.use(responder)

/*

Algorithm:
- Player array
  put users in array ASC: (user_id + lobby_id) % 20
    if equal, by user_id
    => this way, we will always have some kind of 'random' logic for creating an user array,
      which can be calculated at any point
- Czar
  userArray[round_number % users.length] (0, 1, 2, ..., users.length - 1, 0, 1, 2, ...)

On start of each round, give cards to users
- in first round, give 10 cards to each user
  (configure this number via .env for quicker development and/or allow manipulation via lobby config)
  insert values into user_card table, will be using for tracking the hand

*/

router.post('/game/:id', auth, validate('param', {
  id: joi.number().integer().positive().required(),
}), belongsToLobby(true), async function (ctx) {
  const {id} = ctx.v.param

  await gameRepo.startRound(id, 1)
  await gameRepo.fillHand(id, 1)

  ctx.state.r = {}
})

router.get('/game/:id/round/:round', auth, validate('param', {
  id: joi.number().integer().positive().required(),
  round: joi.number().positive().required(),
}), belongsToLobby(false), async function (ctx) {
  const {id, round} = ctx.v.param

  ctx.state.r = await gameRepo.getRoundById(round, id)
})

router.get('/game/:id/card', auth, validate('param', {
  id: joi.number().integer().positive(),
}), belongsToLobby(false), async function (ctx) {
  const {id} = ctx.v.param
  const {id: userId} = ctx.state.user
  ctx.state.r = await gameRepo.getHand(id, userId)
})

module.exports = router
