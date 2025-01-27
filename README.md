# passport-oauth2-refresh-token

OAuth 2.0 refresh token authentication strategy for [Passport](https://github.com/jaredhanson/passport).

This module lets you identify requests containing a `refresh_token` in the
request body when refreshing an access token, as
[defined](https://datatracker.ietf.org/doc/html/rfc6749#section-6) by the OAuth
2.0 specification. This strategy would be used as an alternative to HTTP Basic
or Client Credentials authentication because the client was not issued any
credentials on registration (because the client is likely in a category of
clients that are not able to reliably keep their secrets).

## Install

```shell
$ npm install passport-oauth2-refresh-token
```

## Usage

#### Configure Strategy

The OAuth 2.0 refresh token "authentication" strategy identifies clients using
only a refresh token.  The strategy requires a `verify` callback, which accepts
the refresh token and calls `done`, providing a client.

```javascript
passport.use(new RefreshTokenStrategy(
	function(token, done) {
		RefreshTokens.findOne(
			{
				where: { token: token },
				include: [Clients]
			},
			function (err, refreshToken) {
				if (err) { return done(err); }
				if (!refreshToken) { return done(null, false); }
				return done(null, refreshToken.client);
			}
		);
	}
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'oauth2-refresh-token'`
strategy, to "authenticate" requests. This strategy is typically used in
combination with HTTP Basic authentication (as provided by [passport-http][http]),
OAuth2 Client Password (as provided by [passport-oauth2-client-password][pass]), and
OAuth2 Public Password (as provided by [passport-oauth2-public-password][public]),
allowing clients without credentials to exchange refresh tokens for access tokens.

[http]: https://github.com/jaredhanson/passport-http
[pass]: https://github.com/jaredhanson/passport-oauth2-client-password
[public]: https://github.com/timshadel/passport-oauth2-public-client

For example, as route middleware in an [Express](http://expressjs.com/)
application, using [OAuth2orize](https://github.com/jaredhanson/oauth2orize)
middleware to implement the token endpoint:

```javascript
app.post(
	'/oauth/token',
	passport.authenticate(['basic', 'oauth2-client-password', 'oauth2-public-client', 'oauth2-refresh-token'], { session: false }),
	oauth2orize.token()
);
```

## Tests

```shell
$ npm install --dev
$ make test
```

[![Build Status](https://secure.travis-ci.org/getsnoopy/passport-oauth2-refresh-token.png)](http://travis-ci.org/getsnoopy/passport-oauth2-refresh-token)

## Credits

- [Jared Hanson](http://github.com/jaredhanson) (Client Password implementation)
- [Tim Shadel](http://github.com/timshadel) (Public Client implementation)
- [getsnoopy](http://github.com/getsnoopy)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2025 getsnoopy
