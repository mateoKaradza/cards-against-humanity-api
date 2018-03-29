const _ = require('lodash')

const consts = require('const')
const test = require('test')

// TODO: add test for recover password

test.api('auth', async function (t, request) {
  const r = await request.post('/auth').send({
    email: 'user1@example.com',
    password: 'user1',
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.ok(_.get(r.body, 'data.token'), 'token')
})

test.api('auth wrong password', async function (t, request) {
  const r = await request.post('/auth').send({
    email: 'user1@example.com',
    password: 'user2',
  })
  t.is(r.status, 400, 'bad request')
  t.is(r.body.error, 'user.password_wrong', 'error code')
})

test.api('self get', async function (t, request) {
  const r = await request.get('/self').set(await test.auth('user1@example.com', 'user1'))
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.is(_.get(r.body, 'data.email'), 'user1@example.com', 'email')
})

test.api('self update', async function (t, request) {
  const r = await request.put('/self').set(await test.auth('user1@example.com', 'user1'))
  t.is(r.status, 500, 'not implemented')
})

test.api('self add and change password', async function (t, request) {
  const r2 = await request.put('/self/password').set(await test.auth('user4@example.com', 'user2')).send({
    oldPassword: 'user2',
    newPassword: 'Password1234',
  })
  t.is(r2.status, 200, 'success')
  t.notok(r2.body.error, 'no error')

  const r3 = await request.post('/auth').send({
    email: 'user4@example.com',
    password: 'Password1234',
  })
  t.is(r3.status, 200, 'success')
  t.notok(r3.body.error, 'no error')
  t.ok(_.get(r3.body, 'data.token'), 'token')
})

test.api('self change password with wrong password', async function (t, request) {
  const r = await request.put('/self/password').set(await test.auth('user1@example.com', 'user1')).send({
    oldPassword: 'wrong password',
    newPassword: 'Password1234',
  })
  t.is(r.status, 400, 'wrong password')
  t.ok(r.body.error, 'with error')

  const r2 = await request.post('/auth').send({
    email: 'user1@example.com',
    password: 'user1',
  })
  t.is(r2.status, 200, 'success')
  t.notok(r2.body.error, 'no error')
  t.ok(_.get(r2.body, 'data.token'), 'token')
})

test.api('self change email', async function (t, request) {
  const r = await request.put('/self/email').set(await test.auth('user3@example.com', 'user3')).send({
    password: 'user3',
    email: 'user3.1@example.com',
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')

  const r2 = await request.post('/auth').send({
    email: 'user3.1@example.com',
    password: 'user3',
  })
  t.is(r2.status, 200, 'success')
  t.notok(r2.body.error, 'no error')
  t.ok(_.get(r2.body, 'data.token'), 'token')
})

test.api('self change email with wrong password', async function (t, request) {
  const r = await request.put('/self/email').set(await test.auth('user3.1@example.com', 'user3')).send({
    password: 'wrong password',
    email: 'user3.2@example.com',
  })
  t.is(r.status, 400, 'wrong password')
  t.ok(r.body.error, 'with error')

  const r2 = await request.post('/auth').send({
    email: 'user3.1@example.com',
    password: 'user3',
  })
  t.is(r2.status, 200, 'success')
  t.notok(r2.body.error, 'no error')
  t.ok(_.get(r2.body, 'data.token'), 'token')
})

test.api('self role get', async function (t, request) {
  const r = await request.get('/self/role').set(await test.auth('user1@example.com', 'user1'))
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
  t.deepEqual(r.body.data, {
    user: consts.roleUser.none,
    admin: false,
  })
})

test.api('role put admin by superadmin', async function (t, request) {
  const id = _.get(await request.get('/user/email/user1@example.com').set(await test.auth('superadmin@example.com', 'superadmin')), 'body.data.id')
  const r = await request.put(`/user/${id}/role`).set(await test.auth('superadmin@example.com', 'superadmin')).send({
    role: consts.roleUser.admin,
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
})

test.api('role put admin by admin', async function (t, request) {
  const id = _.get(await request.get('/user/email/user1@example.com').set(await test.auth('superadmin@example.com', 'superadmin')), 'body.data.id')
  const r = await request.put(`/user/${id}/role`).set(await test.auth('admin@example.com', 'admin')).send({
    role: consts.roleUser.admin,
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
})

test.api('role put superadmin by admin', async function (t, request) {
  const id = _.get(await request.get('/user/email/user1@example.com').set(await test.auth('superadmin@example.com', 'superadmin')), 'body.data.id')
  const r = await request.put(`/user/${id}/role`).set(await test.auth('admin@example.com', 'admin')).send({
    role: consts.roleUser.superadmin,
  })
  t.is(r.status, 401, 'unauthorized')
  t.is(r.body.error, 'role.insufficient', 'error code')
})

test.api('role put none by admin', async function (t, request) {
  const id = _.get(await request.get('/user/email/user1@example.com').set(await test.auth('superadmin@example.com', 'superadmin')), 'body.data.id')
  const r = await request.put(`/user/${id}/role`).set(await test.auth('admin@example.com', 'admin')).send({
    role: consts.roleUser.none,
  })
  t.is(r.status, 200, 'success')
  t.notok(r.body.error, 'no error')
})
