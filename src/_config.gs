// MUST: definir as configurações de acordo com a necessidade
const _CONFIG = {
  // de-para referente a aba 'base'
  // columns => nome: index
  'lat': 2,
  'lng': 3,
  'color': 4
}

function createTrigger() {
  ScriptApp.newTrigger('main').forForm().onFormSubmit().create();
}
