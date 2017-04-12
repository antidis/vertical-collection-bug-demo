import Em from 'ember';
import { task, timeout } from 'ember-concurrency';

const NUM_ROWS = 600;
const NUM_COLS = 4;
const ROWS_PER_PAGE = 50;
let oldPerformanceLog;

function logLater(message) {
  let newPerformanceLog = performance.now();
  message = `@${newPerformanceLog}ms: ${message}`;
  if (oldPerformanceLog !== undefined) {
    let distance = newPerformanceLog - oldPerformanceLog;
    message = `${distance}ms later ${message}`;
  }
  oldPerformanceLog = newPerformanceLog;
  console.log(message);
}

export default Em.Component.extend({
  attributeBindings: ['style'],
  classNames: 'ic-table u__relative layout__box o__has-rows',
  style: Em.computed('formattedHeight', function () {
    let formattedHeight = this.get('formattedHeight');
    return (`height: ${formattedHeight};`);
  }),
  height: 500,
  isLoading: false,
  widthsReadFromHeader: false,
  formattedHeight: Em.computed('height', function () {
    let height = this.get('height');
    if (typeof height === 'number') {
      return `${height}px`;
    } else {
      return height;
    }
  }),
  didInsertElement() {
    this._super(...arguments);
  },
  loadNextPageTask: task(function * () {
    logLater('started loadNextPageTask');
    yield this.get('loadPage').perform();
  }).drop(),
  loadPage: task(function * () {
    let page = this.get('page');
    if ((page * ROWS_PER_PAGE) >= NUM_ROWS) { return; }
    logLater(`Loading page #${page}`);
    let rows = this.get('rows');
    yield timeout(1);
    this.set('rows', rows.concat(this.rowsForPage(page)));
    this.incrementProperty('page');
  }).drop(),
  page: 0,
  setColumns() {
    let before_a = 96;
    let columns = [
      {
        label: 'Index',
        propertyName: 'index'
      }
    ];
    for (let i = 1, l = NUM_COLS; i < l; i++) {
      let char = String.fromCharCode(before_a + i);
      columns.push({
        label: char.repeat(10).toUpperCase(),
        propertyName: char
      });
    }
    this.set('columns', columns);
  },
  init() {
    this._super(...arguments);
    this.set('rows', []);
    this.setColumns();
  },
  rowsForPage(page) {
    let firstIndex = page * ROWS_PER_PAGE;
    let lastIndex = Math.min(NUM_ROWS, (firstIndex + ROWS_PER_PAGE) - 1);
    let rows = [];

    let columns = this.get('columns');
    let numColumns = this.get('columns.length');
    for (let rowIndex = firstIndex; rowIndex <= lastIndex; rowIndex++) {
      let row = {};
      row['index'] = rowIndex;
      for (let i = 1, l = numColumns; i < l; i++) {
        let propertyName = columns[i]['propertyName'];
        row[propertyName] = columns[i]['label'];
      }
      rows.push(row);
    }
    return rows;
  }
});
