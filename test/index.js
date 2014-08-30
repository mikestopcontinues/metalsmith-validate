var assert = require('assert');
var Metalsmith = require('metalsmith');
var validate = require('..');

describe('metalsmith-validate', function () {
	it('should apply hash argument to all files', function (done) {
		Metalsmith('test/fixtures/hash')
			.use(validate({
				default: {
					default: 'unspecified'
				}
			}))
			.build(function (err, files) {
				if (err) {
					return done(err);
				}

				assert.equal(files['one.md'].default, 'specified');
				assert.equal(files['two.md'].default, 'unspecified');
				done();
			});
	});

	it('should apply default value if key unspecified', function (done) {
		Metalsmith('test/fixtures/default')
			.use(validate([
				{
					metadata: {
						default: {
							default: 'unspecified'
						}
					}
				}
			]))
			.build(function (err, files) {
				if (err) {
					return done(err);
				}

				assert.equal(files['one.md'].default, 'specified');
				assert.equal(files['two.md'].default, 'unspecified');
				done();
			});
	});

	it('should apply value returned by default callback if key unspecified', function (done) {
		Metalsmith('test/fixtures/default-cb')
			.use(validate([
				{
					metadata: {
						default: {
							default: function (file, data) {
								return 'unspecified';
							}
						}
					}
				}
			]))
			.build(function (err, files) {
				if (err) {
					return done(err);
				}

				assert.equal(files['one.md'].default, 'specified');
				assert.equal(files['two.md'].default, 'unspecified');
				done();
			});
	});

	it('should fail if exists = true and key unspecified', function (done) {
		Metalsmith('test/fixtures/exists')
			.use(validate([
				{
					metadata: {
						exists: {
							exists: true
						}
					}
				}
			]))
			.build(function (err) {
				assert.equal(err.toString().indexOf('one.md'), -1);
				done();
			});
	});

	it('should fail if exists = false and key specified', function (done) {
		Metalsmith('test/fixtures/missing')
			.use(validate([
				{
					metadata: {
						exists: {
							exists: false
						}
					}
				}
			]))
			.build(function (err) {
				assert.equal(err.toString().indexOf('two.md'), -1);
				done();
			});
	});

	it('should fail if key not type specified by string', function (done) {
		var metalsmith = Metalsmith('test/fixtures/type');
		metalsmith
			.use(validate([
				{
					metadata: {
						type: {
							type: 'String'
						}
					}
				}
			]))
			.build(function (err) {
				assert.equal(err.toString().indexOf('one.md'), -1);
				done();
			});
	});

	it('should fail if key not any type in array of types', function (done) {
		var metalsmith = Metalsmith('test/fixtures/types');
		metalsmith
			.use(validate([
				{
					metadata: {
						type: {
							type: ['String', 'Array']
						}
					}
				}
			]))
			.build(function (err) {
				assert.equal(err, undefined);
				done();
			});
	});

	it('should fail key does not match string pattern', function (done) {
		var metalsmith = Metalsmith('test/fixtures/pattern');
		metalsmith
			.use(validate([
				{
					metadata: {
						pattern: {
							pattern: '^match'
						}
					}
				}
			]))
			.build(function (err, files) {
				assert.equal(err.toString().indexOf('one.md'), -1);
				done();
			});
	});

	it('should fail if key does not match regex pattern', function (done) {
		var metalsmith = Metalsmith('test/fixtures/regex');
		metalsmith
			.use(validate([
				{
					metadata: {
						pattern: {
							pattern: /^match/
						}
					}
				}
			]))
			.build(function (err, files) {
				assert.equal(err.toString().indexOf('one.md'), -1);
				done();
			});
	});

	it('should fail if key does not match callback pattern', function (done) {
		var metalsmith = Metalsmith('test/fixtures/regex');
		metalsmith
			.use(validate([
				{
					metadata: {
						pattern: {
							pattern: function (value) {
								return value.match(/^match/);
							}
						}
					}
				}
			]))
			.build(function (err, files) {
				assert.equal(err.toString().indexOf('one.md'), -1);
				done();
			});
	});
});
