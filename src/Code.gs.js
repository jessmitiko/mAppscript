async function main(e) {
  SpreadsheetApp.flush();

  // MUST: os valores "Endereço" e "Categoria" podem mudar de acordo com a configuração do forms - Form Responses
  var data = e?.namedValues;

  var coordinates = await getCoordi(data["Endereço"]);
  console.log(`adding values for '${coordinates.address}': ${coordinates.lat}, ${coordinates.lng}`);

  var values = [
    data["Endereço"],
    data["Categoria"],
    coordinates.lat,
    coordinates.lng
  ];

  insertValues({
    sheetName: 'base',
    values: [values]
  })
}

function doGet(e) {
  var path = e.pathInfo;
  var template = HtmlService.createTemplateFromFile(path || 'home');
  // var template = HtmlService.createTemplateFromFile('template');

  template.values = getValuesFrom('base');
  template._page = path; // debug

  return template.evaluate().setTitle(path);
}


// helpers
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function getSpreadsheetUrl() {
  return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

/**
 * Recebe um objeto contendo o nome da aba e valores em uma matriz, e insere esses valores abaixo dos dados já presentes na aba
 * 
 * @param{{sheetName: string, values: Array}} Objeto contendo o nome da aba e a matriz com os dados a serem inseridos (ex. {sheetName: "Score", values: [['2/3/2021', 'https://www.drogaraia.com.br/', 44.09 ]})
 * 
 */
function insertValues({ sheetName, values }) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var lastRow = sheet.getLastRow() + 1;
  var range = sheet.getRange(lastRow, 1, values.length, values[0].length);

  values = values.map((row, i) => {
    return row.map(column => typeof column === "string" ? column.replace(/\[n\]/g, lastRow + i) : column);
  });

  console.log(`Inserting in ${sheetName} sheet`, values); // debug
  range.setValues(values);
}

function include(filename, url='') {
  if(url) {
    const html = UrlFetchApp.fetch(url);
    return HtmlService.createHtmlOutput(html).getContent(); // debug
  }

  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

function getValuesFrom(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  const lrow = sheet.getLastRow() - 1;
  const lcolumn = sheet.getLastColumn();

  if (lrow === 0) return;

  var values = sheet.getRange(2, 1, lrow, lcolumn).getValues();

  return values.map(row => {
    return {
      'lat': row[_CONFIG.lat],
      'lng': row[_CONFIG.lng],
      'color': row[_CONFIG.color]
    }
  });
}

async function getCoordi(address) {
  var [result] = await Maps.newGeocoder().geocode(address)?.results;

  return {
    'address': result.formatted_address,
    'lat': result.geometry.location.lat,
    'lng': result.geometry.location.lng
  }
}
