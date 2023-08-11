const express = require("express");
const session = require('express-session');
const { google } = require("googleapis");
const userUtils = require('./functions/userUtils');
const { getGoogleSheetsClient } = require('./functions/googleSheetsUtils');
const pegaFilial = require('./functions/getFilial');
const validaRef = require('./functions/validRef');
const convertArray = require('./functions/convertArrayToObjects');


const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var root = require('path').join(__dirname, '/src/img');
app.use(express.static(root));

// Configure session middleware
app.use(session({
 secret: 'mysecret',
 resave: false,
 saveUninitialized: false
}));

// Authentication middleware
function authenticate(req, res, next) {
 if (req.session.authenticated) {
  return next();
 }

 // User is not authenticated, redirect to the login page
 res.redirect('/');
}

app.get("/", (req, res) => {
 res.render("login", { message: '' })
});


app.post('/', async (req, res) => {
 const enteredUsername = req.body.username;
 const enteredPassword = req.body.password;

 try {
  const googleSheets = await getGoogleSheetsClient();

  const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";

  // Read rows from spreadsheet
  const getUsuarios = await googleSheets.spreadsheets.values.get({
   spreadsheetId,
   range: "user!A2:D",
  });
  const usuarios = getUsuarios.data.values;
  // Use the findUser function from userUtils.js
  const result = userUtils.findUser(usuarios, enteredUsername, enteredPassword);
  req.session.authenticated = true;

  // Check if the user is found
  if (typeof result === 'string') {
   // User not found, redirect to the login page with a message
   res.redirect('/?msg=User not found');
  } else {
   // User found, redirect to the menu page with the user information
   req.session.authenticated = true;
   req.session.user = result; // Store the 'result' object in the 'user' session variable
   res.redirect('/menu');
  }

 } catch (error) {
  console.error("Error occurred:", error);
  res.status(500).json({ error: "Internal Server Error" });
 }
});

app.get('/menu', authenticate, (req, res) => {
 // Access the user information from the session
 const user = req.session.user;
 // Render the 'menu' template and pass the user information as local variables
 res.render('menu', { user });

});


app.get("/form", authenticate, async (req, res) => {
 const user = req.session.user;
 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";
 const column = pegaFilial.getFilial(user.Filial);

 // Read Consultores
 const getConsultor = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `vendedor!${column}2:${column}`,
 });
 const consultor = getConsultor.data.values;

 // Read Categoria
 const getCategoria = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `categ!A2:A`,
 });
 const categoria = getCategoria.data.values;

 res.render("form", { info: user, consult: consultor, categ: categoria })
});

app.post('/form', async (req, res) => {
 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";
 const colaborador = req.body.Consultor;
 const referencia = req.body.numberInput;
 const data = req.body.dateInput;
 const categ = req.body.categoria;
 const partName = req.body.nomePeca;
 const precoCusto = req.body.preco_custo;
 const precoPublic = req.body.preco_public;
 const motivo = req.body.result;
 const filial = req.session.user.Filial;



 // Write row(s) to spreadsheet
 await googleSheets.spreadsheets.values.append({
  spreadsheetId,
  range: 'DB!A2:I',
  valueInputOption: "USER_ENTERED",
  resource: {
   values: [[filial, data, colaborador, categ, partName, referencia, precoCusto, precoPublic, motivo]],
  },
 });
 res.redirect("/form?msg=item enviado com sucesso");


});


app.post('/search', async (req, res) => {
 const selectedValue = req.body.selectedValue;
 const ref = req.body.ref
 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";

 // Read Consultores
 const getPecas = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${selectedValue}!A2:B`,
 });
 const response = getPecas.data.values;

 const refIsThere = validaRef.validRef(response, ref);

 res.json(refIsThere);
});


app.get('/add', authenticate, async (req, res) => {
 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";
 const user = req.session.user;

 // Read Categoria
 const getCategoria = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `categ!A2:A`,
 });
 const categoria = getCategoria.data.values;

 res.render('add', { categ: categoria, msg: '', user });
});

app.post('/add', async (req, res) => {
 const name = req.body.name;
 const ref = req.body.ref;
 const categ = req.body.categoria
 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";

 // Read Categoria
 const getCategoria = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `categ!A2:A`,
 });
 const categoria = getCategoria.data.values;

 // Read Consultores
 const getPecas = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${categ}!A2:B`,
 });
 const response = getPecas.data.values;

 const refIsThere = validaRef.validRef(response, ref);

 if (typeof refIsThere === 'string') {

  res.render("add", { categ: categoria, msg: 'referência já existente no sistema' })

 } else {

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
   spreadsheetId,
   range: `${categ}!A3:B`,
   valueInputOption: "USER_ENTERED",
   resource: {
    values: [[name, ref]],
   },
  });
  res.redirect(`/form?name=${name}&reference=${ref}&category=${categ}`);
 }
});

app.get('/table', authenticate, async (req, res) => {

 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";

 // Read Categoria
 const getCategoria = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `categ!A2:A`,
 });
 const categorias = getCategoria.data.values;

 res.render('table', { categorias });

});


app.get('/getParts', async (req, res) => {

 const selectedCategory = req.query.category;

 const googleSheets = await getGoogleSheetsClient();
 const spreadsheetId = "1lLdLCpDq7EJrIm1bnzGjpjnSLGuS3rU6XLEGJIg2JTo";

 // Read Categoria
 const arrayParts = await googleSheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${selectedCategory}!A2:B`,
 });
 const partsInfo = arrayParts.data.values;
 const arrayConverted = convertArray.convertArrayToObjects(partsInfo)

 res.json(arrayConverted);

});


























const PORT = 3000;

app.listen(PORT, (req, res) => console.log(`http://localhost:${PORT}`))
