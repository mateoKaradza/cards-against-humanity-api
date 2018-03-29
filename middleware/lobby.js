const error = require('error')
const lobbyRepo = require('repo/lobby')

// TODO: extend with is an admin functionality

async function belongsToLobby (ctx, next) {
  const {id} = ctx.v.param
  const {id: userId} = ctx.state.user

  try {
    await lobbyRepo.getParticipant(id, userId)
    await next()
  } catch (err) {
    throw new error.GenericError('lobby.access_denied')
  }
}

module.exports = {
  belongsToLobby,
}
