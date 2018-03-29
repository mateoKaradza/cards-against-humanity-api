const error = require('error')
const lobbyRepo = require('repo/lobby')

function belongsToLobby (requiresAdmin) {
  return async function (ctx, next) {
    const {id} = ctx.v.param
    const {id: userId} = ctx.state.user

    let user

    try {
      user = await lobbyRepo.getParticipant(id, userId)
    } catch (err) {
      throw new error.GenericError('lobby.access_denied', null, 401)
    }

    if (requiresAdmin && !user.admin) {
      throw new error.GenericError('lobby.access_denied', null, 401)
    }

    await next()
  }
}

module.exports = {
  belongsToLobby,
}
