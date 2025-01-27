var vows = require('vows');
var assert = require('assert');
var util = require('util');
var refreshToken = require('passport-oauth2-refresh-token');


vows.describe('passport-oauth2-refresh-token').addBatch({

	'module': {
		'should report a version': function (x) {
			assert.isString(refreshToken.version);
		},

		'should export Strategy': function (x) {
			assert.isFunction(refreshToken.Strategy);
		},
	},

}).export(module);
