export default class Task {
  constructor() {
    this.document = null;
    this.id = null;
    this.deleteButton = null;
    this.deletedFromDom = false;
    this.deletedFromDb = false;
    this.addedToDom = false;
    this.addedToDb = false;
    this.date = null;
    this.dayOfWeek = "";
    this.listElement = null;
    this.taskNum = -1;
  }
}