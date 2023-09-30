var { expressjwt: jwt } = require("express-jwt");
function authJwt() {
  return jwt({
    secret: process.env.secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      `${process.env.API_URL_V1}/users/login`,
      `${process.env.API_URL_V1}/users/register`,
    ]
  })
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true)
  }
  done();
}


module.exports = authJwt;
