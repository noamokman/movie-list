import _ from 'lodash';
import movieList, {saveKey} from '../src';

describe('movie-list', () => {
  describe('exports', () => {
    it('should expose a default function', () => {
      expect(typeof movieList).toBe('function');
    });

    it('should expose a saveKey function', () => {
      expect(typeof saveKey).toBe('function');
    });
  });

  describe('with invalid options', () => {
    describe('concurrentRequests', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({concurrentRequests: _.constant(5)});
        };

        expect(fn).toThrow('concurrentRequests must be a number');
      });

      it('should reject a string', () => {
        const fn = () => {
          movieList({concurrentRequests: 'hola'});
        };

        expect(fn).toThrow('concurrentRequests must be a number');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({concurrentRequests: {}});
        };

        expect(fn).toThrow('concurrentRequests must be a number');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({concurrentRequests: true});
        };

        expect(fn).toThrow('concurrentRequests must be a number');
      });
    });

    describe('source', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({source: _.constant(5)});
        };

        expect(fn).toThrow('source must be a string');
      });

      it('should reject a number', () => {
        const fn = () => {
          movieList({source: 5});
        };

        expect(fn).toThrow('source must be a string');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({source: {}});
        };

        expect(fn).toThrow('source must be a string');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({source: true});
        };

        expect(fn).toThrow('source must be a string');
      });
    });

    describe('movieGlob', () => {
      it('should reject a function', () => {
        const fn = () => {
          movieList({movieGlob: _.constant(5)});
        };

        expect(fn).toThrow('movieGlob must be a string or a string array');
      });

      it('should reject a number', () => {
        const fn = () => {
          movieList({movieGlob: 5});
        };

        expect(fn).toThrow('movieGlob must be a string or a string array');
      });

      it('should reject an object', () => {
        const fn = () => {
          movieList({movieGlob: {}});
        };

        expect(fn).toThrow('movieGlob must be a string or a string array');
      });

      it('should reject a boolean', () => {
        const fn = () => {
          movieList({movieGlob: true});
        };

        expect(fn).toThrow('movieGlob must be a string or a string array');
      });
    });
  });

  describe('with valid options', () => {
    it('should reject if no key was saved', () => {
      expect(() => movieList()).toThrow('No api key provided');
    });

    it('should return an organized list', () => {
      saveKey({apiKey: 'lol'});

      return movieList()
        .then(listData => {
          expect(listData).toHaveProperty('succeeded');
          expect(listData).toHaveProperty('failed');

          expect(listData.succeeded).toHaveLength(2);

          expect(listData.succeeded[0]).toHaveProperty('path');
          expect(listData.succeeded[0]).toHaveProperty('name');
          expect(listData.succeeded[0]).toHaveProperty('info');

          expect(listData.failed).toHaveLength(2);

          expect(listData.failed[0]).toHaveProperty('state', 'failed');
          expect(listData.failed[0]).toHaveProperty('value');
          expect(listData.failed[0]).toHaveProperty('reason');
        });
    });
  });
});