var vows = require('vows');
var assert = require('assert');
var util = require('util');
var RefreshTokenStrategy = require('passport-oauth2-refresh-token/strategy');


vows.describe('RefreshTokenStrategy').addBatch({

	'strategy': {
		topic: function() {
			return new RefreshTokenStrategy(function(){});
		},

		'should be named oauth2-refresh-token': function (strategy) {
			assert.equal(strategy.name, 'oauth2-refresh-token');
		},
	},

	'strategy handling a request': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				if (token == 'rftkn') {
					done(null, { id: 1 });
				} else {
					done(null, false);
				}
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client) {
					self.callback(null, client);
				}
				strategy.fail = function() {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				req.body = {};
				req.body['refresh_token'] = 'rftkn';
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not generate an error' : function(err, client) {
				assert.isNull(err);
			},
			'should authenticate' : function(err, client) {
				assert.equal(client.id, 1);
			},
		},
	},

	'strategy that verifies a request with additional info': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				if (token == 'rftkn') {
					done(null, { id: 1 }, { foo: 'bar' });
				} else {
					done(null, false);
				}
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client, info) {
					self.callback(null, client, info);
				}
				strategy.fail = function() {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				req.body = {};
				req.body['refresh_token'] = 'rftkn';
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not generate an error' : function(err, client) {
				assert.isNull(err);
			},
			'should authenticate' : function(err, client) {
				assert.equal(client.id, 1);
			},
			'should authenticate with additional info' : function(err, client, info) {
				assert.equal(info.foo, 'bar');
			},
		},
	},

	'strategy handling a request that is not verified': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				done(null, false);
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client) {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.fail = function() {
					self.callback(null);
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				req.body = {};
				req.body['refresh_token'] = 'rftkn';
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should fail authentication' : function(err, client) {
				// fail action was called, resulting in test callback
				assert.isNull(err);
			},
		},
	},

	'strategy that errors while verifying request': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				done(new Error('something went wrong'));
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client) {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.fail = function() {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.error = function(err) {
					self.callback(null, err);
				}

				req.body = {};
				req.body['refresh_token'] = 'rftkn';
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not call success or fail' : function(err, e) {
				assert.isNull(err);
			},
			'should call error' : function(err, e) {
				assert.instanceOf(e, Error);
				assert.equal(e.message, 'something went wrong');
			},
		},
	},

	'strategy handling a request without a body': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				done(null, false);
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client) {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.fail = function(challenge, status) {
					self.callback(null, challenge, status);
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not call success or error' : function(err, challenge, status) {
				assert.isNull(err);
			},
			'should fail authentication with default status' : function(err, challenge, status) {
				assert.isUndefined(challenge);
			},
		},
	},

	'strategy handling a request without a refresh token': {
		topic: function() {
			var strategy = new RefreshTokenStrategy(function(token, done) {
				done(null, false);
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				strategy.success = function(client) {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.fail = function(challenge, status) {
					self.callback(null, challenge, status);
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				req.body = {};
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not call success or error' : function(err, challenge, status) {
				assert.isNull(err);
			},
			'should fail authentication with default status' : function(err, challenge, status) {
				assert.isUndefined(challenge);
			},
		},
	},

	'strategy constructed without a verify callback': {
		'should throw an error': function () {
			assert.throws(function() { new RefreshTokenStrategy() });
		},
	},

	'strategy with passReqToCallback=true option': {
		topic: function() {
			var strategy = new RefreshTokenStrategy({passReqToCallback:true}, function(req, token, done) {
				assert.isNotNull(req);
				if (token == 'rftkn') {
					done(null, { id: 1, foo: req.params.foo });
				} else {
					done(null, false);
				}
			});
			return strategy;
		},

		'after augmenting with actions': {
			topic: function(strategy) {
				var self = this;
				var req = {};
				req.params = { foo: 'bar' }
				strategy.success = function(client) {
					self.callback(null, client);
				}
				strategy.fail = function() {
					self.callback(new Error('should-not-be-called'));
				}
				strategy.error = function() {
					self.callback(new Error('should-not-be-called'));
				}

				req.body = {};
				req.body['refresh_token'] = 'rftkn';
				process.nextTick(function () {
					strategy.authenticate(req);
				});
			},

			'should not generate an error' : function(err, client) {
				assert.isNull(err);
			},
			'should authenticate' : function(err, client) {
				assert.equal(client.id, 1);
				assert.equal(client.foo, 'bar');
			},
		},
	},

}).export(module);
