var defaultConfig = require("./default-config");
var program = require('commander');
var cliUtils = require("./cli").utils;
var args = require("optimist").argv;
var Q = require("q");

var allowedOptions = ["host", "server", "proxy", "files"];

/**
 * @param {String} string
 * @returns {string}
 */
function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Template for method name
 * @param {String} key
 * @returns {String}
 */
function methodName(key) {
    return "_merge%sOption".replace("%s", ucfirst(key));
}

/**
 * @param {Object} obj
 * @param {String} key
 * @param {Object} args
 * @returns {Object}
 */
function transformOption(obj, key, args) {
    if (args[key] && typeof obj[key] !== "undefined") {
        obj[key] = cliUtils[methodName(key)](obj[key], args[key]);
    }
    return obj;
}

/**
 * @param {Object} defaultConfig
 * @param {Object} args
 * @param {Array} allowedOptions
 * @returns {Object}
 */
function mergeOptions(defaultConfig, args, allowedOptions) {
    return allowedOptions
        .reduce(function (obj, key) {
            return transformOption(obj, key, args);
        }, defaultConfig);
}


module.exports = function (version) {

    var deferred = Q.defer();

    program
        .version(version)
        .option('-s, --server', 'Run a Local server (uses your cwd as the web root)')
        .option('-p, --proxy', 'Proxy an existing server')
        .option('-f, --files', 'File paths to watch')
        .option('--no-comments', "Don't add comments to the config file")
        .option('--host', 'Specify a hostname to use');

    program
        .command('init')
        .description('Creates a default config file')
        .action(function() {
        });

    program
        .command('start')
        .description('Start Browser Sync')
        .action(function() {
            var options = mergeOptions(defaultConfig, args, allowedOptions);
            deferred.resolve({files: options.files, config: options});
        });

    program.parse(process.argv);

    return deferred.promise;
};
