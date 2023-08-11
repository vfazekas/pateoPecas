function findUser(arrayOfArrays, enteredUsername, enteredPassword) {
 for (const userArray of arrayOfArrays) {
  const [username, password, role, filial] = userArray;
  if (username === enteredUsername && password === enteredPassword) {
   return {
    Username: username,
    Password: password,
    Role: role,
    Filial: filial,
   };
  }
 }

 return "User not found.";
}

module.exports = {
 findUser,
};