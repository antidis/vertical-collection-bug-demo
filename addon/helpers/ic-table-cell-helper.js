import Em from 'ember';

function tableCellNode(value, width) {
  let cellNode = document.createElement('TD');
  let widthDiv = document.createElement('DIV');
  let textNode = document.createTextNode(value);
  cellNode.classList.add('table__cell');
  widthDiv.classList.add('table__width__jammer');
  widthDiv.appendChild(textNode);
  if (width !== undefined) {
    widthDiv.style.minWidth = `${width}px`;
  }
  cellNode.appendChild(widthDiv);
  return cellNode;
}

export function icTableCellHelper(params, hash) {
  let column = hash['column'];
  let row = hash['row'];
  let value = row[column.propertyName];
  return tableCellNode(value, column.width);
}

export default Em.Helper.helper(icTableCellHelper);
