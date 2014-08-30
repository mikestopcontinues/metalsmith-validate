# metalsmith-validate

A [Metalsmith](https://github.com/segmentio/metalsmith) plugin that allows you to validate file metadata. You can check existence, type, and regex pattern. Neat.

## Features

  - works on files matching pattern
  - can specify default for when key unspecified
  - can test for existence or for lack thereof
  - can validate against type or array of types using [check-types](https://github.com/philbooth/check-types.js)
  - can match against pattern as RegExp, string, or callback(value) returning boolean

## Installation

    $ npm install metalsmith-validate

## Usage

### Validate all files

Pass hash of file metadata keys and rules.

```js
var validate = require('metalsmith-validate');

metalsmith.use(validate({
  title: {
  	exists: true,
  	type: 'String'
  },
  date: {
  	exists: true,
  	pattern: /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/
  },
  tag: {
  	default: 'news'
  },
  draft: {
  	exists: false
  }
}));
```

### Validate pattern-matching files

Pass array of hashes with file-matching pattern and metadata validation hash:

```js
var validate = require('metalsmith-validate');

metalsmith.use(validate([
	{
		pattern: 'post/*',
		metadata: {
			title: true, // shorthand for title: { exists: true }
			date: true,
			invalid: false
		}
	},
	{
		// pattern defaults to '**/*'
		metadata: {
			template: {
				default: 'default.jade'
				pattern: function (value) {
					return value.match(/\.jade$/);
				}
			}
		}
	}
));
```

## CLI Usage

All of the same options apply, just add them to the `"plugins"` key in your `metalsmith.json` configuration:

```json
{
  "plugins": {
    "metalsmith-validate": [
      {
        "pattern": "page/*",
        "metadata": {
        	"title": {
        		"exists": true,
        		"type": "String"
        	}
        }
      }
    ]
  }
}
```

## License

  MIT
