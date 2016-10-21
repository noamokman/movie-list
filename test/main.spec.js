import chai from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
const expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('movie-list', () => {
  let movieList = require('../src');

  describe('exports', () => {
    it('should expose a function', () => {
      expect(movieList).to.be.a('function');
    });
  });

  describe('with invalid', () => {
    describe('concurrentRequests', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({concurrentRequests: () => 5});
        };

        expect(fn).to.throw(TypeError, 'concurrentRequests must be a number');
      });

      it('should reject a string', () => {
        const fn = () => {
          movieList({concurrentRequests: 'hola'});
        };

        expect(fn).to.throw(TypeError, 'concurrentRequests must be a number');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({concurrentRequests: {}});
        };

        expect(fn).to.throw(TypeError, 'concurrentRequests must be a number');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({concurrentRequests: true});
        };

        expect(fn).to.throw(TypeError, 'concurrentRequests must be a number');
      });
    });

    describe('source', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({source: () => 5});
        };

        expect(fn).to.throw(TypeError, 'source must be a string');
      });

      it('should reject a number', () => {
        const fn = () => {
          movieList({source: 5});
        };

        expect(fn).to.throw(TypeError, 'source must be a string');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({source: {}});
        };

        expect(fn).to.throw(TypeError, 'source must be a string');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({source: true});
        };

        expect(fn).to.throw(TypeError, 'source must be a string');
      });
    });

    describe('movieGlob', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({movieGlob: () => 5});
        };

        expect(fn).to.throw(TypeError, 'movieGlob must be a string or a string array');
      });

      it('should reject a number', () => {
        const fn = () => {
          movieList({movieGlob: 5});
        };

        expect(fn).to.throw(TypeError, 'movieGlob must be a string or a string array');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({movieGlob: {}});
        };

        expect(fn).to.throw(TypeError, 'movieGlob must be a string or a string array');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({movieGlob: true});
        };

        expect(fn).to.throw(TypeError, 'movieGlob must be a string or a string array');
      });
    });
  });

  describe('with valid options', () => {
    beforeEach(function () {
      this.timeout(5000);

      const globbyMock = sinon.stub().returns(Promise.resolve(['San.Andreas.2015.720p.WEBRIP.x264.AC3-EVE.mkv', 'Aloha.2015.1080p.BluRay.x264.DTS-WiKi.mkv', 'server.error.1993.720p.DVDRIP.x264.AC3-EVE.mkv', 'not.found.1993.720p.DVDRIP.x264.AC3-EVE.mkv']));
      const omdbMock = {
        get (name, cb) {
          if (name === 'server error') {
            return cb(new Error('Not Found!'));
          }

          const value = {
            'San Andreas': {
              bla: 'bla'
            },
            Aloha: {
              bla: 'bla2'
            }
          }[name];

          if (!value) {
            return cb();
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

      movieList = require('../src');
    });

    afterEach(() => {
      mockery.deregisterMock('globby');
      mockery.deregisterMock('omdb');
      mockery.disable();
    });

    it('should return an organized list', () => {
      return movieList()
        .then(listData => {
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
});