/**
 *
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 7/7/14 5:15 PM
 */
const should = require('chai').should();
const dash = require( 'lodash' );
const Logger = require('../lib/Logger' );
const JSONFileAppender = require('../lib/JSONFileAppender');

describe('JSONFileAppender', function() {
    'use strict';

    const createBareLogger = function(options) {
        var opts = Object.assign({}, options);

        opts.level = 'info';

        return new Logger( opts );
    };
    const createLogger = function(options) {
        const opts = Object.assign({}, options);

        opts.domain = 'MyDomain';
        opts.category = 'MyCategory';
        opts.level = 'debug';

        return new Logger( opts );
    };

    const createOptions = function(options) {
        const opts = Object.assign({}, options);

        opts.level = 'debug';
        opts.logFilePath = '/tmp/log-test.log';
        opts.autoOpen = false;

        return opts;
    };

    describe('#instance', function() {
        var appender = new JSONFileAppender( createOptions() ),
            methods = [
                'formatter',
                'write',
                'setLevel',
                'closeWriter',
                'getTypeName',
                'formatEntry',
                'formatLevel',
                'formatTimestamp',
                'formatMessage',
                'formatDate',
                'formatObject'
            ];

        it('should create an instance of JSONFileAppender', function() {
            should.exist( appender );
            appender.should.be.instanceof( JSONFileAppender );
            appender.getTypeName().should.equal('JSONFileAppender');
        });

        it('should have all expected methods by size and type', function() {
            dash.functionsIn( appender ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                appender[ method ].should.be.a( 'function' );
            });
        });
    });

    describe('write/format', function() {
        const opts = createOptions();
        const logger = createLogger();

        it('should write a formatted entry', function(done) {
            opts.writer = {};
            opts.writer.write = function(str) {
                should.exist( str );

                str.should.contain('"level":"INFO"');
                str.should.contain('{');
                str.should.contain('}');
                str.should.contain('"group":0');

                done();
            };

            const appender = new JSONFileAppender( opts );
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ] );
            appender.write( entry );

        });

        it('should skip log entries less than the specified level', function(done) {
            opts.writer = function(str) {
                should.not.exist( str );
            };

            opts.level = 'fatal';

            const appender = new JSONFileAppender( opts );
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ] );
            appender.write( entry );

            process.nextTick(function() {
                done();
            });
        });
    });

    describe('formatEntry', function() {
        const appender = new JSONFileAppender( createOptions() );
        const barelogger = createBareLogger();
        const logger = createLogger();

        it('should create and format fields for a bare logger', function() {
            const entry = barelogger.createEntry( 'info', 'this is a test, time: ' );
            const str = appender.formatEntry( entry );

            should.exist( str );
            str.length.should.equal( 1 );
            str[0].should.contain("{");
            str[0].should.contain("}");
            str[0].should.not.contain("domain");
            str[0].should.contain("INFO");
        });

        it('should create and format fields for a specified log entry', function() {
            const entry = logger.createEntry( 'info', 'this is a test, time: ' );
            const str = appender.formatEntry( entry );
            
            should.exist( str );
            str.length.should.equal( 1 );
            str[0].should.contain("{");
            str[0].should.contain("}");
            str[0].should.contain("domain");
            str[0].should.contain('"INFO"');
            should.equal(typeof(JSON.parse(str[0])),"object");
            should.equal(Object.keys(JSON.parse(str[0])).length, 6);
        });

        it('should create and format fields for a specified log entry with extra null', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], null );
            const str = appender.formatEntry( entry );

            should.exist( str );
            str.length.should.equal( 1 );
            str[0].should.contain('"time"');
            str[0].should.contain(' time: ');
            should.equal(typeof(JSON.parse(str[0])),"object");
            should.equal(Object.keys(JSON.parse(str[0])).length, 6);
        });

        it('should create and format fields for a specified log entry with extra object', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], {"remark":"good","picture":"none"} );
            const str = appender.formatEntry( entry );
            should.exist( str );
            str.length.should.equal( 1 );
            str[0].should.contain('"remark":"good"');
            str[0].should.contain('"picture"');
            should.equal(typeof(JSON.parse(str[0])),"object");
            should.equal(Object.keys(JSON.parse(str[0])).length, 8);
        });

        it('should create and format fields for a specified log entry with extra array', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], ["good","none"] );
            const str = appender.formatEntry( entry );

            should.exist( str );
            str.length.should.equal( 1 );
            str[0].should.contain('"extra"');
            str[0].should.contain('[');
            should.equal(typeof(JSON.parse(str[0])),"object");
            should.equal(Object.keys(JSON.parse(str[0])).length, 7);
        });
    });    
});
