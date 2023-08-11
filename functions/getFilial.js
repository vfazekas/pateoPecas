function getFilial(filial) {

 if (filial === 'RECIFE') {
  return "A"
 } else if (filial === 'OLINDA') {
  return "E"
 } else if (filial === 'PIEDADE') {
  return "I"
 } else if (filial === 'JOÃO PESSOA') {
  return "D"
 } else if (filial === 'RETIRO') {
  return "B"
 } else if (filial === 'FEIRA DE SANTANA') {
  return "G"
 } else if (filial === 'HOLANDESES') {
  return "C"
 } else if (filial === 'MANAUS') {
  return "F"
 } else if (filial === 'BEQUIMÃO') {
  return "H"
 } else return

}

module.exports = {
 getFilial,
};