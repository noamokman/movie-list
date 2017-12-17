export default class {
  byId ({title}) { // eslint-disable-line class-methods-use-this
    if (title === 'server error') {
      return Promise.reject(new Error('Not Found!'));
    }

    const value = {
      'San Andreas': {
        bla: 'bla'
      },
      Aloha: {
        bla: 'bla2'
      }
    }[title];

    if (!value) {
      return Promise.resolve({Response: 'False'});
    }

    return Promise.resolve(value);
  }
}