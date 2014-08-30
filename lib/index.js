'use strict';

var debug = require('debug')('metalsmith-validate');
var Matcher = require('minimatch').Minimatch;
var typeCheck = require('type-check').typeCheck;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin that allows you to easily validate file metadata, checking existence, type, and regex pattern. Can also supply default value.
 *
 * @param {Array|Object} matchers array of rules applied to pattern-matched files, or hash of metadata validators to apply to all files
 * @option {*} matchers[key].default set key to value if unset
 * @option {Boolean} matchers[key].exists whether the key should exist
 * @option {Array|string} matchers[key].type array of strings (or single string) of types which key must match at least one of
 * @option {RegExp|string|Function} matchers[key].pattern regex pattern as RegExp or string to compare against key, or callback(value) returning Boolean
 * @return {Function}
 */

function plugin(matchers) {
	if (!Array.isArray(matchers)) {
		matchers = [
			{
				metadata: matchers,
			}
		];
	}

	matchers = matchers.map(function (rule) {
		rule.pattern = rule.pattern || '**/*';
		debug('Normalize rule with pattern %s', rule.pattern);
		rule.matcher = new Matcher(rule.pattern);
		rule.metadata = rule.metadata || {};

		Object.keys(rule.metadata).forEach(function (key) {
			rule.metadata[key] = typeof rule.metadata[key] === 'object' ? rule.metadata[key] : {
				exists: rule.metadata[key],
			};

			var validator = rule.metadata[key];

			if (validator.type && !Array.isArray(validator.type)) {
				validator.type = [validator.type];
			}

			if (typeof validator.pattern === 'string') {
				validator.pattern = new RegExp(validator.pattern);
			}
		});

		return rule;
	});

	return function (files, metalsmith, done) {
		var err;

		Object.keys(files).forEach(function (file) {
			debug('Validate file %s', file);
			var data = files[file];

			matchers.forEach(function (rule) {
				if (rule.matcher.match(file)) {
					debug('Validate against rule with matching pattern %s', rule.pattern);
					Object.keys(rule.metadata).every(function (key) {
						var validator = rule.metadata[key];

						if ('default' in validator && !(key in data)) {
							return data[key] = typeof validator.default === 'function' ? validator.default(data[key]) : validator.default;
						}

						if ('exists' in validator && validator.exists != key in data) {
							err = new Error('File "' + file + '" ' + (validator.exists ? 'does not have' : 'has') + ' value "' + key + '".');
							return false;
						}

						if (!(key in data)) {
							return true;
						}

						if ('type' in validator && validator.type.indexOf(typeof data[key]) === -1) {
							var valid = false;

							validator.type.some(function (type) {
								return valid = typeCheck(type, data[key]);
							});

							if (!valid) {
								err = new Error('File "' + file + '" value "' + key + '" must be of type [' + validator.type.join(', ') + '].');
								return false;
							}
						}

						if ('pattern' in validator && (
							(typeof validator.pattern === 'function' && !validator.pattern(data[key])) ||
							(typeof validator.pattern !== 'function' && !data[key].match(validator.pattern))
							)) {
							err = new Error('File "' + file + '" value "' + key + '" does not match ' + validator.pattern + '.');
							return false;
						}

						return true;
					});
				}

				if (err) {
					return false;
				}
			});
		});

		done(err);
	};
}
