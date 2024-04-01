const express = require('express');
const compression = require('compression');
const port = process.env.port || 5000;
const mysql = require('mysql2')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(compression());
/** 
var connection = mysql.createConnection({
    host        : 'sql5.freemysqlhosting.net', //127.0.0.1
    user        : 'sql5668264', 
    password    : 'tcXzruYSbE', // change this
    database    : 'sql5668264'
});
*/
const pool = mysql.createPool({
    host: 'sql5.freemysqlhosting.net',
    user: 'sql5668264',
    password: 'tcXzruYSbE',
    database: 'sql5668264',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });


app.get('/budget', async (req, res)=>{
    // this gets the info from the database
    try{
        const user_id = req.headers.user_id;
        const [results, fields] = await pool.execute('SELECT * FROM budget_data WHERE user_id = ?', [user_id]);
        res.json(results);
    } catch(error){
        console.error('Error fetching budget data:', error);
        res.status(500).send('Error fetching patient data');
    }
    
});


 /**
app.post('/createBudget', (req, res) => {
    
    const {
        title,
        budget_amt,
        expense,
        color,
        user_id
    } = req.body;
    console.log(req.body);
    
    connection.query('INSERT INTO budget_data (title, budget_amt, expense, color, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, budget_amt, expense, color, user_id],
        (error, results) => {
            if (error) {
                console.error('Error inserting budget:', error);
                res.status(500).send(`Error inserting new budget: ${error.message}`);
            } else {
                // Redirect to the patient list page or any other page as needed
                console.log('Received form data:', req.body);
                res.status(200).send('Budget inserted successfully');
            }
        }
    );
});
 */
app.post('/createBudget', async (req, res) => {
    try {
      const { title, budget_amt, expense, color, user_id } = req.body;
      console.log(req.body);
  
      await pool.execute('INSERT INTO budget_data (title, budget_amt, expense, color, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, budget_amt, expense, color, user_id]);
  
      console.log('Received form data:', req.body);
      res.status(200).send('Budget inserted successfully');
    } catch (error) {
      console.error('Error inserting budget:', error);
      res.status(500).send(`Error inserting new budget: ${error.message}`);
    }
  });

// create account
/** 
app.post('/api/register', (req, res)=>{
    
    const { username, password } = req.body; 
    console.log('old pass '+password);
    bcrypt.hash(password, 10, (err, hash)=>{
        console.log('new pass '+hash);
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to hash the password' });
        }
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (error, results)=>{
        if (error){
            console.error('Create account insert failed: ', error);
            res.status(500).send(`Error inserting new budget: ${error.message}`);
        }
        else {
            // Redirect to the patient list page or any other page as needed
            console.log('Received form data:', req.body);
            res.status(200).send('user inserted successfully');
        }

        

        console.log(req.body);
        console.log('Username created: ' +username);
        console.log('Pass created: ' +hash);
    });
    })
    
});
*/
app.post('/api/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Hash the password asynchronously
      const hash = await bcrypt.hash(password, 10);
  
      const [results] = await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
  
      // Redirect to the appropriate page or send a success response
      console.log('Received form data:', req.body);
      res.status(200).send('User inserted successfully');
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).send(`Error inserting new user: ${error.message}`);
    }
  });

//login
/** 
app.post('/api/login', (req, res)=>{
    connection.connect();
    const { username, password } = req.body; 
    const secretKey = 'My super secret key';
    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results)=>{
        if (error){
            console.error('DB query failed: ', error);
            res.status(500).json({
                success: false,
                token: null,
                err: 'interanl server error'
            });
            return;
        }
        if (results.length ===0){
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
            return;
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, passwordMatch)=>{
            if (err) {
                console.error('Error comparing passwords: ', err);
                res.status(500).json({
                    success: false,
                    token: null,
                    err: 'internal server error'
                });
                return;
            }

            if (passwordMatch){
                let token= jwt.sign({user_id: user.user_id, username: user.username }, secretKey,{expiresIn: '3m'});
                //test if user_id is correct
                console.log('Server response:', {
                    success: true,
                    err: null, 
                    token,
                    user_id: user.user_id,
                });
                res.json({
                    success: true,
                    err: null, 
                    token,
                    user_id: user.user_id
                });
            } else {
                res.status(401).json({
                    success: false,
                    token: null,
                    err: 'Username or password is incorrect'
                });
            }
        })
        
    })
});
*/
app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const secretKey = 'My super secret key';
  
      const [results] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  
      if (results.length === 0) {
        res.status(401).json({
          success: false,
          token: null,
          err: 'Username or password is incorrect'
        });
        return;
      }
  
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (passwordMatch) {
        const token = jwt.sign({ user_id: user.user_id, username: user.username }, secretKey, { expiresIn: '3m' });
  
        console.log('Server response:', {
          success: true,
          err: null,
          token,
          user_id: user.user_id,
        });
  
        res.json({
          success: true,
          err: null,
          token,
          user_id: user.user_id
        });
      } else {
        res.status(401).json({
          success: false,
          token: null,
          err: 'Username or password is incorrect'
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        token: null,
        err: 'Internal server error'
      });
    }
  });

// for getting specific entries
/** 
app.get('/budget/:user_id/:budget_id', async (req, res)=>{
    connection.connect();
    const budget_id = req.params.budget_id;
    
    connection.query('SELECT * FROM budget_data WHERE budget_id = ?', [budget_id], (error, results)=>{
        if (error){
            console.error('error fetching budget data', error);
            res.status(500).send('error fetching budgeting data');
        } else {
            res.json(results[0])
        }
    });
});
*/
app.get('/budget/:user_id/:budget_id', async (req, res) => {
    try {
      const budget_id = req.params.budget_id;
  
      const [results] = await pool.execute('SELECT * FROM budget_data WHERE budget_id = ?', [budget_id]);
  
      if (results.length === 0) {
        res.status(404).json({
          success: false,
          err: 'Budget not found'
        });
      } else {
        res.json(results[0]);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      res.status(500).send('Error fetching budget data');
    }
  });


/** 
  app.delete('/delete/:user_id/:budget_id', (req, res) => {
    connection.connect();
    const user_id = req.params.user_id;
    const toDelete = req.params.budget_id;

    connection.query('DELETE FROM budget_data WHERE user_id = ? AND budget_id = ?',
        [user_id, toDelete],
        (error, results) => {
            if (error) {
                console.error('Error deleting data:', error);
                res.status(500).send('Error deleting data');
            } else {
                res.status(200).send('Delete successful');
            }
        }
    );
});
*/
app.delete('/delete/:user_id/:budget_id', async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const toDelete = req.params.budget_id;
  
      await pool.execute('DELETE FROM budget_data WHERE user_id = ? AND budget_id = ?', [user_id, toDelete]);
  
      res.status(200).send('Delete successful');
    } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).send('Error deleting data');
    }
  });


// for updating entries
/** 
app.put('/updateBudget/:user_id/:budget_id', async (req,res)=>{
    connection.connect();
    const toUpdate = req.params.budget_id;
    const user_id = req.params.user_id;
    
    connection.query('UPDATE budget_data SET title = ?, budget_amt = ?, expense =?, color=? WHERE user_id=? AND budget_id =?',
    [req.body.title, req.body.budget_amt, req.body.expense, req.body.color, user_id, toUpdate],
    (error, results) => {
        if (error) {
            console.error('Error updating data:', error);
            res.status(500).send('Error updationg data');
        } else {
            res.status(200).send('updating successful');
        }
        }
    )
})
*/
app.put('/updateBudget/:user_id/:budget_id', async (req, res) => {
    try {
      const toUpdate = req.params.budget_id;
      const user_id = req.params.user_id;
  
      await pool.execute(
        'UPDATE budget_data SET title = ?, budget_amt = ?, expense =?, color=? WHERE user_id=? AND budget_id =?',
        [req.body.title, req.body.budget_amt, req.body.expense, req.body.color, user_id, toUpdate]
      );
  
      res.status(200).send('Updating successful');
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).send('Error updating data');
    }
  });

/** 
app.listen(port, ()=>{
    console.log(`API running on port http://localhost:${port}`)
    connection.connect((err)=>{
        if (err) throw err;
        console.log("Database connected!")
    })
});
*/
app.listen(port, async () => {
    console.log(`API running on port http://localhost:${port}`);
    let connection;  // Declare connection variable outside the try-catch block

    try {
        connection = await pool.getConnection();
        await connection.ping(); // Test the connection

        // Add your additional setup or checks here if needed

        console.log('Database connected!');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        if (connection) {
            connection.release();  // Release the connection back to the pool
        }
    }
});
