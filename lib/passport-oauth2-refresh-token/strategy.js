/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util');


/**
 * `RefreshTokenStrategy` constructor.
 *
 * @api protected
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('OAuth 2.0 refresh token strategy requires a verify function');

  passport.Strategy.call(this);
  this.name = 'oauth2-refresh-token';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the refresh token in the request body.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  if (!req.body || !req.body['refresh_token']) {
    return this.fail();
  }

  var refreshToken = req.body['refresh_token'];

  var self = this;

  function verified(err, client, info) {
    if (err) { return self.error(err); }
    if (!client) { return self.fail(); }
    self.success(client, info);
  }

  if (self._passReqToCallback) {
    this._verify(req, refreshToken, verified);
  } else {
    this._verify(refreshToken, verified);
  }
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
