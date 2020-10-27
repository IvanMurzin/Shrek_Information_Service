// подключение зависимостей
const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

// использование static директорий
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/styles'));

// установка body paser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// подключение к базе данных и установка соединения с ней
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: "Shrek Information Service Data Base",
  password: "password"
});

// установка обработчика страниц
app.set("view engine", "hbs");

// получение списка фильмов
app.get("/", function (req, res) {
  pool.query("SELECT * FROM films", function (err, data) {
    if (err) return console.log(err);
    res.render("index.hbs", { 
      films: data, 
    });
  });
});

// получаем имя фильма, информацию о котором нужно вывести
app.get("/info/:film_name", function (req, res) {
  const film_name = req.params.film_name;
  pool.query("SELECT * FROM films WHERE film_name=?",[film_name], function (err, film_data) {
    if (err) return console.log(err);
    pool.query("SELECT * FROM actors WHERE film_name=?",[film_name], function (err, actors_data) {
      if (err) return console.log(err);
      pool.query("SELECT * FROM localizers WHERE film_name=?",[film_name], function (err, localizers_data) {
        if (err) return console.log(err);
        res.render("information.hbs", { 
          films: film_data[0],
          actors: actors_data,
          localizers: localizers_data
        });
      });
    });
  });
});

// возвращаем форму для добавления фильмов
app.get("/create", function (req, res) {
  res.render("create.hbs");
});

// возвращаем форму для добавления актеров
app.get("/create_actor/:film_name", function (req, res) {
  const film_name = req.params.film_name;
  res.render("create_actor.hbs",{
    film_name: film_name
  });
});

// возвращаем форму для добавления локализаторов
app.get("/create_localizer/:film_name", function (req, res) {
  const film_name = req.params.film_name;
  res.render("create_localizer.hbs",{
    film_name: film_name
  });
});

// получаем отправленный фильм и добавляем их в БД 
app.post("/create", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const film_name = req.body.film_name;
  const film_poster = req.body.film_poster;
  const film_release_date = req.body.film_release_date;
  const film_duration = req.body.film_duration;
  const film_producer = req.body.film_producer;
  const film_description = req.body.film_description;
  const film_trailer = req.body.film_trailer;
  const insert_data = [film_name, film_poster, film_release_date, film_duration, film_producer, film_description, film_trailer]
  pool.query("INSERT INTO films (film_name, film_poster,film_release_date,film_duration,film_producer,film_description,film_trailer) VALUES (?,?,?,?,?,?,?)", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// получаем отправленного актера и добавляем их в БД 
app.post("/create_actor/:film_name", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const actor_name = req.body.actor_name;
  const film_name = req.params.film_name;
  const actor_preview = req.body.actor_preview;
  const insert_data = [actor_name,film_name,actor_preview]
  pool.query("INSERT INTO actors (actor_name,film_name,actor_preview) VALUES (?,?,?)", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/info/"+film_name);
  });
});

// получаем отправленного локализатора и добавляем их в БД 
app.post("/create_localizer/:film_name", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const localizer_name = req.body.localizer_name;
  const film_name = req.params.film_name;
  const localizer_preview = req.body.localizer_preview;
  const insert_data = [localizer_name,film_name,localizer_preview]
  pool.query("INSERT INTO localizers (localizer_name,film_name,localizer_preview) VALUES (?,?,?)", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/info/"+film_name);
  });
});

// получем имя редактируемого фильма, получаем его из БД и отправлям с формой редактирования
app.get("/edit/:film_name", function (req, res) {
  const film_name = req.params.film_name;
  pool.query("SELECT * FROM films WHERE film_name=?", [film_name], function (err, data) {
    if (err) return console.log(err);
    res.render("edit.hbs", {
      film: data[0]
    });
  });
});

// получем имя редактируемого актера, получаем его из БД и отправлям с формой редактирования
app.get("/edit_actor/:actor_name", function (req, res) {
  const actor_name = req.params.actor_name;
  pool.query("SELECT * FROM actors WHERE actor_name=?", [actor_name], function (err, data) {
    if (err) return console.log(err);
    res.render("edit_actor.hbs", {
      actor: data[0]
    });
  });
});

// получем имя редактируемого локализатора, получаем его из БД и отправлям с формой редактирования
app.get("/edit_localizer/:localizer_name", function (req, res) {
  const localizer_name = req.params.localizer_name;
  pool.query("SELECT * FROM localizers WHERE localizer_name=?", [localizer_name], function (err, data) {
    if (err) return console.log(err);
    res.render("edit_localizer.hbs", {
      localizer: data[0]
    });
  });
});

// получаем отредактированный фильм и отправляем их в БД
app.post("/edit", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const film_name = req.body.film_name;
  const film_poster = req.body.film_poster;
  const film_release_date = req.body.film_release_date;
  const film_duration = req.body.film_duration;
  const film_producer = req.body.film_producer;
  const film_description = req.body.film_description;
  const film_trailer = req.body.film_trailer;
  const insert_data = [film_poster, film_release_date, film_duration, film_producer, film_description, film_trailer, film_name];
  pool.query("UPDATE films SET film_poster=?,film_release_date=?, film_duration=?, film_producer=?, film_description=?, film_trailer=? WHERE film_name=?", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// получаем отредактированного актера и отправляем их в БД
app.post("/edit_actor/:film_name", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const actor_name = req.body.actor_name;
  const film_name = req.params.film_name;
  const actor_preview = req.body.actor_preview;
  const insert_data = [film_name,actor_preview,actor_name];
  pool.query("UPDATE actors SET film_name=?, actor_preview=? WHERE actor_name=?", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/info/"+film_name);
  });
});

// получаем отредактированного локализатора и отправляем их в БД
app.post("/edit_localizer/:film_name", urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const localizer_name = req.body.localizer_name;
  const film_name = req.params.film_name;
  const localizer_preview = req.body.localizer_preview;
  const insert_data = [film_name,localizer_preview,localizer_name];
  pool.query("UPDATE localizers SET film_name=?, localizer_preview=? WHERE localizer_name=?", insert_data, function (err, data) {
    if (err) return console.log(err);
    res.redirect("/info/"+film_name);
  });
});

// получаем имя удаляемого фильма и удаляем его из БД
app.post("/delete/:film_name", function (req, res) {
  const film_name = req.params.film_name;
  pool.query("DELETE FROM films WHERE film_name=?", [film_name], function (err, data) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// получаем имя удаляемого актера и удаляем его из БД
app.post("/delete_actor/:actor_name", function (req, res) {
  const actor_name = req.params.actor_name;
  pool.query("DELETE FROM actors WHERE actor_name=?", [actor_name], function (err, data) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// получаем имя удаляемого локализатора и удаляем его из БД
app.post("/delete_localizer/:localizer_name", function (req, res) {
  const localizer_name = req.params.localizer_name;
  pool.query("DELETE FROM localizers WHERE localizer_name=?", [localizer_name], function (err, data) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// запускаем сервер на адресе localhost с портом 3000
app.listen(3000, function () {
  console.log("http://127.0.0.1:3000");
});