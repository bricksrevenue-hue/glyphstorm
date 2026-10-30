// Shared cosmetic catalog. These IDs are validated by the authoritative server.
export const FLEET = Object.freeze([
  ['01-dart', 'Dart', '#70f7d1', 'Swept wings'],
  ['02-manta', 'Manta', '#b5a0ff', 'Curved wings'],
  ['03-comet', 'Comet', '#ffbe78', 'Twin engines'],
  ['04-orbit', 'Orbit', '#ff8caf', 'Ring drive'],
  ['05-kite', 'Kite', '#93c6ff', 'Faceted hull'],
  ['06-scout', 'Scout', '#e5ed80', 'Compact cabin'],
  ['07-prism', 'Prism', '#efb0ff', 'Three pods'],
  ['08-aurora', 'Aurora', '#a0e7f4', 'Four fins']
].map(([id,name,color,description]) => Object.freeze({
  id,name,color,description,src:'/assets/ships/'+id+'.png'
})));
export const findShip = id => FLEET.find(ship => ship.id === id);
export const shipFor = id => findShip(id) || FLEET[0];
