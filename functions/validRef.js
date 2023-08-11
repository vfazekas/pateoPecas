function validRef(arrays, ref) {
 for (const subArray of arrays) {
  const [partName, partRef] = subArray;
  if (partRef === ref) {
   return partName;
  }
 }
 return null; // Reference not found in any sub-array
}

module.exports = {
 validRef,
};