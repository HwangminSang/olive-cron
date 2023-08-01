const User = require('../models/user.js.bk')

/*
    refresh_user_token function updates the token of the user
    given the id and the new token. It extracts the id and token
    from the request body then updates the token of the associated user
 */
exports.refresh_user_token = (req, res, next) => {
  const { id, token } = req.body
  if (id === undefined || token === undefined || id === '' || token === '') {
    res.status(400).json({ error: 'id and token are required' })
  } else {
    User.update({ userId: id }, { $set: { token } })
      .exec()
      .then(response => {
        res.status(200).json(response)
      })
      .catch(err => {
        res.status(500).json({ error: err })
      })
  }
}
