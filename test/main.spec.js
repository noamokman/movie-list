'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var mockery = require('mockery');
var Q = require('q');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('movie-list', function () {
  var movieList = require('../lib');

  describe('with invalid options', function () {
    it('should reject options as function', function () {
      var fn = function () {
        movieList(function () {
        });
      };

      expect(fn).to.throw(TypeError, 'options must be an object');
    });

    it('should reject options as string', function () {
      var fn = function () {
        movieList('bla');
      };

      expect(fn).to.throw(TypeError, 'options must be an object');
    });

    it('should reject options as number', function () {
      var fn = function () {
        movieList(5);
      };

      expect(fn).to.throw(TypeError, 'options must be an object');
    });

    it('should reject options as boolean', function () {
      var fn = function () {
        movieList(true);
      };

      expect(fn).to.throw(TypeError, 'options must be an object');
    });
  });

  describe('with valid options', function () {
    beforeEach(function () {
      var globbyMock = sinon.stub().returns(Q.resolve(['San.Andreas.2015.720p.WEBRIP.x264.AC3-EVE.mkv', 'Aloha.2015.1080p.BluRay.x264.DTS-WiKi.mkv', 'server.error.1993.720p.DVDRIP.x264.AC3-EVE.mkv']));
      var omdbMock = {
        get: function (name, cb) {
          var value = {
            'San Andreas': {
              bla: 'bla'
            },
            Aloha: {
              bla: 'bla2'
            }
          }[name];

          if (!value) {
            return cb(new Error('Not Found!'));
          }

          cb(null, value);
        }
      };

      mockery.registerMock('globby', globbyMock);
      mockery.registerMock('omdb', omdbMock);
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      movieList = require('../lib');
    });

    afterEach(function () {
      mockery.deregisterMock('globby');
      mockery.deregisterMock('omdb');
      mockery.disable();
    });

    it('should return an organized list', function () {
      return movieList()
        .then(function (listData) {
          expect(listData).to.have.property('succeeded')
            .that.is.an('array');
          expect(listData).to.have.property('failed')
            .that.is.an('array');

          expect(listData.succeeded[0]).to.have.property('path')
            .that.is.a('string');
          expect(listData.succeeded[0]).to.have.property('name')
            .that.is.a('string');
          expect(listData.succeeded[0]).to.have.property('info')
            .that.is.an('object');

          expect(listData.failed[0]).to.have.property('state', 'failed');
          expect(listData.failed[0]).to.have.property('value')
            .that.is.an('object');
          expect(listData.failed[0]).to.have.property('reason')
            .that.is.an('Error');
        });
    });
  });

  describe('exports', function () {
    it('should expose a function', function () {
      expect(movieList).to.be.a('function');
    });
  });
});