export default {
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