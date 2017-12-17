export default class Configstore {
  constructor () {
    this.all = {};
  }

  set (name, value) {
    this.all[name] = value;
  }

  get (name) {
    return this.all[name];
  }

  has (name) {
    return !!this.all[name];
  }

  delete (name) {
    delete this.all[name];
  }
}