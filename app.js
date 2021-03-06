const app = new (require('koa'))()
const mount = require('koa-mount')

app.silent = process.env.LOG < 3
app.use(require('koa-response-time')())
app.use(require('koa-conditional-get')())
app.use(require('koa-etag')())
app.use(require('koa-helmet')())
app.use(require('kcors')())
app.use(require('koa-bodyparser')())
app.use(require('middleware/error'))

// TODO: Add Socket.io

app.use(mount('/', require('route/card').routes()))
app.use(mount('/', require('route/deck').routes()))
app.use(mount('/', require('route/lobby').routes()))
app.use(mount('/', require('route/user').routes()))
app.use(mount('/', require('route/game').routes()))

app.use(async function (ctx, next) {
  ctx.throw(404)
  await next()
})

module.exports = app
