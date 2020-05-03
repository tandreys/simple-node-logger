/**
 * @class AbstractAppenderTests
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 7/7/14 6:27 PM
 */
const should = require('chai').should(),
    dash = require( 'lodash' ),
    Logger = require('../lib/Logger' ),
    AbstractAppender = require('../lib/AbstractAppender');

describe('AbstractAppender', function() {
    'use strict';


    const createBareLogger = function(options) {
        var opts = Object.assign({}, options);

        opts.level = 'info';

        return new Logger( opts );
    };

    const createLogger = function(options) {
        var opts = Object.assign({}, options);

        opts.domain = 'MyDomain';
        opts.category = 'MyCategory';
        opts.level = 'debug';

        return new Logger( opts );
    };

    const  createOptions = function(options) {
        var opts = Object.assign({}, options);

        opts.typeName = 'FooAppender';

        return opts;
    };

    describe('#instance', function() {
        var appender = new AbstractAppender( createOptions() ),
            methods = [
                'getTypeName',
                'formatEntry',
                'formatLevel',
                'formatTimestamp',
                'formatMessage',
                'formatDate',
                'formatObject'
            ];

        it('should create an instance of AbstractAppender', function() {
            should.exist( appender );
            appender.should.be.instanceof( AbstractAppender );
            appender.getTypeName().should.equal('FooAppender');
        });

        it('should have all expected methods by size and type', function() {
            dash.functionsIn( appender ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                appender[ method ].should.be.a( 'function' );
            });
        });

        it('require typename', function(){
            var appender = null,
                opts = {};
            opts.typeName = null;
            try {
                appender = new AbstractAppender( opts);
            } catch(e) {
                should.exist( e );
            }
            should.equal(appender,null);

        });
    });

    describe('formatEntry', function() {
        const  appender = new AbstractAppender( createOptions() );
        const barelogger = createBareLogger();
        const logger = createLogger();

        it('should create and format fields for a bare logger', function() {
            const entry = barelogger.createEntry( 'info', [ 'this is a test, time: ', new Date() ] );
            const fields = appender.formatEntry( entry );

            should.exist( fields );
            fields.length.should.equal( 4 );
        });

        it('should create and format fields for a specified log entry', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ] );
            const fields = appender.formatEntry( entry );

            should.exist( fields );
            fields.length.should.equal( 6 );
        });

        it('should create and format fields for a specified log entry with extra null', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], null );
            const fields = appender.formatEntry( entry );

            should.exist( fields );
            fields.length.should.equal( 6 );
        });

        it('should create and format fields for a specified log entry with extra object', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], {"remark":"good","picture":"none"} );
            const fields = appender.formatEntry( entry );

            should.exist( fields );
            fields.length.should.equal( 8 );
        });

        it('should create and format fields for a specified log entry with extra array', function() {
            const entry = logger.createEntry( 'info', [ 'this is a test, time: ', new Date() ], ["good","none"] );
            const fields = appender.formatEntry( entry );

            should.exist( fields );
            fields.length.should.equal( 8 );
        });
    });

    describe('formatObject', function() {
        const appender = new AbstractAppender( createOptions() );

        it('should format a complex object into human readable output', function() {
            const list = [
                { 
                    name:'flarb', 
                    date:new Date() 
                },
                appender
            ];

            list.forEach(function(obj) {
                const formatted = appender.formatObject( obj );

                // console.log( formatted );
                formatted.should.be.a('string');
            });
        });

        it('should format an error object with message and stack trace', function() {
            const err = new Error('this is my error');
            const fmt = appender.formatObject(err);
            fmt.should.be.a('string');
            fmt.should.contain('this is my error');
            fmt.should.contain('at ');
        });

        it('no value', function() {
            
            const fmt = appender.formatObject(null);
            fmt.should.be.a('string');
            fmt.should.equal('');
        });

        it('object value', function() {
            
            const fmt = appender.formatObject('[object Object]');
            fmt.should.be.a('string');
            fmt.should.equal("'[object Object]'");
        });        

    });

    describe('formatMessage', function() {
        const appender = new AbstractAppender( createOptions() );

        it('no messages', function() {
            const formatted = appender.formatMessage( null );

            // console.log( formatted );
            formatted.should.equal ( '' );
            
        });

        it('list of messages is not an array', function() {
            const list = {"message":'this is a test, time: '};

            const formatted = appender.formatMessage( list );

            // console.log( formatted );
            formatted.should.equal ( list );
            
        });

        it('should format a list of log messages', function() {
            const list = [ 'this is a test, time: ', new Date(), ' ', { name:'flarb', date:new Date() }, ' ', appender ];

            const formatted = appender.formatMessage( list );

            // console.log( formatted );
            should.exist( formatted );
            formatted.should.be.a('string');
        });
    });

    describe('#timestampFormat', function() {
        const ts = 1428516587697; // 2015-04-08T18:09:47.697Z

        it('should have the default format', function() {
            const opts = createOptions();
            const appender = new AbstractAppender( opts );
            const sdt = appender.formatTimestamp( ts);
            const parts = sdt.split('.');

            // get this to pass for all timezones
            parts[0].split(':')[1].should.equal( '09' );
            parts[0].split(':')[2].should.equal( '47' );
            parts[1].should.equal( '697' );

            // sdt.should.equal( '18:09:47.697');
        });

        it('should have a custom format from options', function() {
            const opts = {
                typeName:'customerTSAppender',
                timestampFormat:'x' // unix timestamp
            };
            const appender = new AbstractAppender( opts);
            const sdt = appender.formatTimestamp( ts );

            sdt.should.equal( ts.toString() );
        });
    });


    describe ("prettyprint", function() {
        var opt = createOptions();

        it('object value without pretty print', function() {
            opt.prettyPrint = false;
            const appender = new AbstractAppender( opt );
            const fmt = appender.formatObject({"name":"John"});
            fmt.should.be.a('string');
            fmt.should.equal('{"name":"John"}');
        });

        it('object value with pretty print', function() {
            opt.prettyPrint = true;
            const appender = new AbstractAppender( opt );
            const fmt = appender.formatObject({"name":"John"});
            fmt.should.be.a('string');
            fmt.should.equal('{\n  "name": "John"\n}');
        });
    });
});
