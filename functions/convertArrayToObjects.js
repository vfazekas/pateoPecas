function convertArrayToObjects(arrayOfArrays) {
  // Skip the first row (header)
  const dataRows = arrayOfArrays.slice(1);

  const objectsArray = dataRows.map(dataRow => {
    const [name, reference] = dataRow.map(item => item.trim());
    return { name, reference };
  });

  return objectsArray;
}

module.exports = {
  convertArrayToObjects,
};