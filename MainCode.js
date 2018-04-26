let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let app = express();
let mysql = require('mysql');
let Client = require('ftp');


//FTP connection Properties
let c = new Client();
c.connect({
    user: 'ajit',
    host: 'localhost',
    port: 21,
    password: 'ajit1234',
    secure: false,
    connTimeout: 40000,
});


//mySQL connection properties and connection
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kane7able',
    database: 'FastTrackIT',
    multipleStatements: true
});
connection.connect(function (error) {
        if (!!error) {
            console.log("Error");
        }
    }
);


//Main Page loader with sku details
app.get('/', function (req, resp) {
    connection.query("SELECT count(*) as invCount FROM inventory ; SELECT DATE_FORMAT(UPDATE_TIME, '%m/%d/%Y') as lastTime FROM   information_schema.tables WHERE  TABLE_SCHEMA = 'FastTrackIT' AND TABLE_NAME = 'inventory'", function (error, rows) {
        if (!!error) {
            console.log("Error in querry");
        } else {
            if (rows.length > 0) {
                resp.render('index', {"totalSKU": rows[0][0].invCount, "modifyDate": rows[1][0].lastTime});

            } else {
                console.log("Error in data presentation");
            }
        }
    });

});


//CSV file upload and homepage sku details modifier
app.post('/upload', function (req, resp) {
    let util = require('util');
    let multiparty = require('multiparty');
    let form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        let loadQuery = "LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE inventory FIELDS TERMINATED BY ',' ENCLOSED BY '\"'  LINES TERMINATED BY '\n' IGNORE 1 LINES (inv_UPA,inv_thumbnail,inv_rtn_qty,inv_seller,inv_item_brand,inv_item_desc,inv_Amount,inv_model,inv_load,@inv_width,@inv_depth,@inv_height,@inv_weight,inv_additional_info,inv_todo)" +
            "set inv_width= if(@inv_width = '',0,@inv_width), " +
            "inv_depth= if(@inv_depth = '',0,@inv_depth), " +
            "inv_height= if(@inv_height = '',0,@inv_height), " +
            "inv_weight= if(@inv_weight = '',0,@inv_weight)";
        connection.query(loadQuery, files.csvFile[0].path, function (error) {
            if (!!error) {
                console.log("Error in querry " + error.toString());
            } else {
                console.log("Data uploaded successfully");
            }
        });

        connection.query("SELECT count(*) as invCount FROM inventory ; SELECT DATE_FORMAT(UPDATE_TIME, '%m/%d/%Y') as lastTime FROM   information_schema.tables WHERE  TABLE_SCHEMA = 'FastTrackIT' AND TABLE_NAME = 'inventory'", function (error, rows) {
            if (!!error) {
                console.log("Error in querry");
            } else {
                if (rows.length > 0) {
                    console.log(rows[0][0].invCount);
                    resp.render('index', {"totalSKU": rows[0][0].invCount, "modifyDate": rows[1][0].lastTime});
                } else {
                    console.log("Error in data presentation");
                }
            }
        });

    });
});


//SKU lookup
app.get('/searchData', function (req, resp) {
    "use strict";
    let input = req.query.text;
    connection.query("select inv_UPA, inv_rtn_qty, inv_seller, inv_item_brand, inv_todo, DATE_FORMAT(NOW(), '%m/%d/%Y') as curdate from inventory where inv_UPA = '" + input + "'", function (error, rows) {
        if (!!error) {
            console.log("Error in querry");
            resp.json({result: "NoData"});
        } else {
            if (rows.length > 0) {
                resp.json({
                    result: "Success",
                    upa: rows[0].inv_UPA,
                    rtnqty: rows[0].inv_rtn_qty,
                    seller: rows[0].inv_seller,
                    brand: rows[0].inv_item_brand,
                    todo: rows[0].inv_todo,
                    curDate: rows[0].curdate
                });
            } else {
                console.log("Error in data presentation");
                resp.json({result: "NoData"});
            }
        }
    });
});

//FTP file update
app.get('/postData', function (req, resp) {
    "use strict";
    let csvData = req.query.text;
    let timeStamp = Date.now().toString();
    console.log(timeStamp);
    c.put(csvData.toString(), 'www/csvUpload_' + timeStamp + '_.csv', function (err) {
        if (err) throw err;
        c.end();
    });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
module.exports = app;

