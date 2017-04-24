const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cons = require('consolidate'),
      dust = require('dustjs-helpers'),
      pg = require('pg'),
      app = express();

// DB Connect String
const connect = 'postgres://josh:1@localhost/recipebook';

// const config = {
// 	user: 'josh',
// 	database: 'recipebook',
// 	password: '1',
// 	host: 'localhost',
// 	port: 5432,
// 	max: 10,
// 	idleTimeoutMillis: 30000
// };
// const pool = new pg.Pool(config);

// Assign Dust Engine to .dust Files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	// PG Connect
	pg.connect(connect, (err, client, done) => {
	  if (err) return console.error('error fetching client from pool', err);
	  client.query('select * from recipes', (err, result) => {
	    if (err) return console.error('error running query', err);
	    res.render('index', {recipes: result.rows});
	    done();
	  });
	});
});

app.post('/add', (req, res) => {
	pg.connect(connect, (err, client, done) => {
	  if (err) return console.error('error fetching client from pool', err);
	  client.query('insert into recipes(name, ingredients, directions) values($1, $2, $3)',
			[req.body.name, req.body.ingredients, req.body.directions]);
		done();
		res.redirect('/');
	});
});

app.delete('/delete/:id', (req, res) => {
  pg.connect(connect, (err, client, done) => {
	  if (err) return console.error('error fetching client from pool', err);
	  client.query('delete from recipes where id = $1',
			[req.params.id]);
		done();
		res.send(200);
	});
});

app.post('/edit', (req, res) => {
  pg.connect(connect, (err, client, done) => {
	  if (err) return console.error('error fetching client from pool', err);
	  client.query('update recipes set name=$1, ingredients=$2, directions=$3 where id = $4',
			[req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
		done();
		res.redirect('/');
	});
});

// Server
app.listen(3000, () => {
  console.log('Server Started on Port 3000');
});
