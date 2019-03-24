var express = require('express');
var app = express();
var path = require('path');

console.log("server running \n");


var host = '127.0.0.1';
var port = 5432;

/* uni login*/
// var user = 'student';
// var database = 'studentdb';
// var password = 'dbpassword';
// var searchPath = "studentdb, ga_app";

/* ben login */
//var user = 'postgres';
//var database = 'category';
//var password = 'dbpassword';
//var searchPath = "category, coursework_schema";

/* Will login */
var user = 'postgres';
var database = 'projects';
var password = 'password';
var searchPath = "projects, ga_app;";

var client;

app.use(express.static('public'));

async function connectDB() {
	// Website you wish to allow to connect
	// add this line to address the cross-domain XHR issue.


	//connect to postgres db
	const { Client } = require('pg');
	const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
	console.log(connectionString);
	client = new Client({
		connectionString: connectionString,
	});
	await client.connect();

	//set search path
	const sqlquery1 = "SET SEARCH_PATH TO " + searchPath;
	console.log(sqlquery1);
	const res2 = await client.query(sqlquery1);


}

app.post('/check_id', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
			sqlQuery = "SELECT * FROM check_ID(" + json + ");";
			console.log(sqlQuery);
			const sqlQueryResult = await client.query(sqlQuery);
			result = sqlQueryResult.rows[0];

		}
		catch (err) {
			console.log(err);
			result = new Object();
			result.check_id = false;
		}
		var json_res = JSON.stringify(result);
		console.log(json_res);
		res.end(json_res);
		// gets staff id from front end, checks if it's in the database and returns a boolean
	});
});

app.post('/check_staff', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		sqlQuery = "SELECT staffid FROM staff WHERE fname = '" + json.fname + "' AND sname = '" + json.sname + "' AND dob = '" + json.dob + "';";
		var result = new Object();
		try {
			const sqlQueryResult = await client.query(sqlQuery);
			result = sqlQueryResult.rows[0];
			if (!result) {
				result = new Object();
				result.staffid = false;
			}
		}
		catch (err) {
			result.staffid = false;
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
		// checks staff id based on name and dob, either returns the staff id or returns false if not found
	});
});

app.post('/get_carriage_details', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
			sqlQuery = "SELECT * FROM carriage_details(" + json + ");"
			const sqlQueryResult2 = await client.query(sqlQuery);
			result = sqlQueryResult2.rows[0];
			console.log(result);
		}
		catch (err) {
			result = new Object();
			result.car_exists = false;
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

app.post('/submit_form', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	var body = '';
	req.on('data', function (data) {
		console.log(data);
		body += data;
		console.log("Body: " + body);
	});
	req.on('end', async function () {
		var result = new Object();

		try {
			var json = JSON.parse(body);
			console.log(json);
			sqlQuery = "SELECT * FROM insert_fault($1,$2,$3,$4,$5,$6)";
			var values = [json.carriage, json.category, json.location, json.description, json.userID, json.img];
			sqlQuery = "SELECT * FROM insert_fault(" + json.carriage + ", '" + json.category + "', '" + json.location + "', '" + json.description + "', " + json.userID + ", '" + json.img + "');";
			console.log(sqlQuery);
			//console.log(values);
			const sqlQueryResult = await client.query(sqlQuery);
			console.log(sqlQueryResult);
			result.success = true;
		}
		catch (err) {
			console.log(err);
			result.success = false;
		}
		var json_res = JSON.stringify(result);
		console.log(result);
		res.end(json_res);
	});
});

app.post('/show_image', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		sqlQuery = "select * from fault where faultno = 25;"
		const sqlQueryResult = await client.query(sqlQuery);

		result = sqlQueryResult.rows;

		var json_res = JSON.stringify(result);
		console.log(result);
		res.end(json_res);
	});
});

app.post('/get_users_faults', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		try {
			sqlQuery = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault WHERE staffID = " + json.userID + ";";
			const sqlQueryResult = await client.query(sqlQuery);
			result = sqlQueryResult.rows;
		}
		catch (err) {
			result = new Object();
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

app.post('/filter_faults', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		var result;
		var filterCount = 0;
		sqlStatement = "SELECT faultNo,carriageNo, category,location, faultDesc, dateReported, status FROM fault";
		console.log(json);
		for (var filter in json) {
			if (json[filter]) {
				if (filterCount == 0) {
					sqlStatement += " WHERE";
				}
				else {
					sqlStatement += ' AND';
				}
				sqlStatement += " " + filter + " = '" + json[filter] + "'";
				filterCount += 1;
			}
		}
		sqlStatement += " ORDER BY datereported DESC, timeReported DESC;";
		console.log(sqlStatement);
		try {
			const sqlQueryResult = await client.query(sqlStatement);
			result = sqlQueryResult.rows;
			console.log(result);
		}
		catch (err) {
			result = new Object();
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});

app.post('/get_fault_image', async function (req, res) {
	console.log(req.url);
	console.log(req.method);

	res.setHeader('Access-Control-Allow-Origin', '*');

	await connectDB();

	var sqlQuery;

	req.on('data', async function (data) {
		var json = JSON.parse(data);
		console.log(json);
		sqlStatement = "SELECT img FROM fault WHERE faultno = " + json;
		console.log(sqlStatement);
		try {
			const sqlQueryResult = await client.query(sqlStatement);
			result = sqlQueryResult.rows;
			console.log(result);
		}
		catch (err) {
			console.log(err);
		}
		var json_res = JSON.stringify(result);
		res.end(json_res);
	});
});


app.get('/', function (req, res) {
	console.log("Get - " + req.url);
	res.sendFile(path.join(__dirname + '/index.html'));

});

app.listen(3000);
