const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
var bodyParser = require('body-parser');
const { get } = require('http');
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + '/upload')));

app.get('/customer/update', function (req, res) {
  res.sendFile(__dirname + '/pages/dashboard/index.html');
});

async function readFile() {
  return new Promise((resolve) => {
    if (fs.existsSync('./data')) {
      fs.readFile('./data', 'utf-8', (error, data) => {
        if (error) {
          resolve(false);
          console.log(error);
          return;
        }
        resolve(JSON.parse(data));
      });
    } else {
      resolve([]);
    }
  });
}

async function readCustomerPhotos() {
  return new Promise((resolve) => {
    fs.readdir('./upload', (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
      files.forEach((file) => {
        const imagePath = path.join('./upload', file);
        fs.readFile(imagePath, (err, data) => {
          if (err) {
            console.error('Error reading image:', err);
            return;
          }
        });
      });
      resolve(files);
    });
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './upload');
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });
app.post('/upload', upload.single('profileImage'), async (req, res) => {
  let customerPhoto = req.file.filename;
  let getCustomerData = await readFile();
  let lastElement = getCustomerData[getCustomerData.length - 1];
  console.log("new photo upload api")

  Object.keys(getCustomerData).forEach((ele) => {
    if (getCustomerData[ele].id == lastElement.id) {
      lastElement.photo = customerPhoto;
      getCustomerData[ele] = lastElement;
    }
  });
  fs.writeFile('./data', JSON.stringify(getCustomerData), (error) => {
    if (error) {
      console.log(error, 'file not created');
      res.json({
        status: false,
        msg: 'file not create',
      });
    }
  });
});
app.post('/customer/add', async (req, res) => {
  params = req.body;
  console.log(params);
  let getUserData = await readFile();
  getUserData.push(params);
  fs.writeFile('./data', JSON.stringify(getUserData), (error) => {
    if (error) {
      console.log(error, 'file not created');
      res.json({
        status: false,
        msg: 'file not create',
      });
    } else {
      console.log('file created');
      res.json({
        status: true,
        msg: 'file created',
      });
    }
  });
});
app.get('/customer/get', async (req, res) => {
  let getCustomerData = await readFile();
  res.json({
    status: true,
    data: getCustomerData,
  });
});
app.post('/upload', upload.single('profileImage'), async (req, res) => {
  let customerPhoto = req.file.filename;
  getUpdatedPhoto(customerPhoto)
});

let updatedPhoto = ''
const getUpdatedPhoto=(customerPhoto)=>{
  updatedPhoto = customerPhoto
}

app.put('/update/photo',async(req,res)=>{
  params = req.body
  let getCustomerData = await readFile();
  Object.keys(getCustomerData).forEach((ele) => {
    if (getCustomerData[ele].id == params.id) {
      getCustomerData[ele].photo = updatedPhoto
    }
  });
  fs.writeFile('./data', JSON.stringify(getCustomerData), (error) => {
    if (error) {
      console.log(error, 'file not created');
      res.json({
        status: false,
        msg: 'file not create',
      });
    }
  });
  const deleteFile = `./upload/${params.photo}`;
  if (fs.existsSync(deleteFile)) {
    fs.unlink(deleteFile, (err) => {
      if (err) {
        console.log(err);
      }
      console.log('deleted');
    });
  }
 
})



app.put('/customer/update', async (req, res) => {
  let getData = await readFile();
  params = req.body;
  Object.keys(getData).forEach((ele) => {
    if (getData[ele].id == params.id) {
      getData[ele] = params;
    }
  });
  fs.writeFile('./data', JSON.stringify(getData), (error) => {
    if (error) {
      console.log(error, 'file not created');
      res.json({
        status: false,
        msg: 'file not create',
      });
    } else {
      res.json({
        status: true,
        msg: 'data updated',
        data: getData,
      });
    }
  });
});
app.delete('/customer/delete', async (req, res) => {
  let getData = await readFile();
  params = req.body;
  const filteredPeople = getData.filter((item) => item.id !== params.id);
  getData = filteredPeople;
  fs.writeFile('./data', JSON.stringify(getData), (error) => {
    if (error) {
      console.log(error, 'file not created');
      res.json({
        status: false,
        msg: 'file not create',
      });
    } else {
      res.json({
        status: true,
        msg: 'data updated',
        data: getData,
      });
    }
  });
  console.log(params.photo);
  const deleteFile = `./upload/${params.photo}`;
  if (fs.existsSync(deleteFile)) {
    fs.unlink(deleteFile, (err) => {
      if (err) {
        console.log(err);
      }
      console.log('deleted');
    });
  }
});

// user login and signup ---------------------------------------
const readUser = () => {
  return new Promise((resolve) => {
    if (fs.existsSync(path.join(__dirname, '/auth/userData'))) {
      fs.readFile(
        path.join(__dirname, '/auth/userData'),
        'utf-8',
        (error, data) => {
          if (error) {
            resolve(false);
            console.log(error);
            return;
          }
          resolve(JSON.parse(data));
        }
      );
    } else {
      resolve([]);
    }
  });
};
readUser();
app.post('/user/register', async (req, res) => {
  params = req.body;
  console.log(params);
  let getUserData = await readUser();
  let checkEmail = getUserData.find((ele) => ele.email == params.email);
  console.log('::::check_mail', checkEmail);
  if (checkEmail == undefined) {
    getUserData.push(params);
    fs.writeFile(
      path.join(__dirname, '/auth/userData'),
      JSON.stringify(getUserData),
      (error) => {
        if (error) {
          console.log(error);
          res.json({
            status: false,
            msg: 'file not create',
          });
        } else {
          res.json({
            status: true,
            msg: 'registration success',
            data: params,
          });
        }
      }
    );
  } else {
    res.json({
      status: true,
      msg: 'Email is Already Exist',
      data: params,
    });
  }
});
app.post('/user/login', async (req, res) => {
  params = req.body;
  let user = await readUser();
  const findUser = (ele) => {
    return ele.email == params.email && ele.password == params.password;
  };
  let isExistUser = user.find(findUser);
  const findEmail = (ele) => {
    return ele.email == params.email;
  };
  let isExistEmail = user.find(findEmail);
  if (isExistUser !== undefined) {
    res.json({
      userStatus: true,
      msg: 'Login success',
    });
    // console.log("login success");
  } else {
    if (isExistEmail !== undefined) {
      res.json({
        userNameStatus: true,
        msg: 'Wrong Password',
      });
      // console.log("wrong password");
    } else {
      res.json({
        status: false,
        msg: 'User Not Exist',
      });
      // console.log("user not exist");
    }
  }
});

app.listen(3200, (error) => {
  if (error) {
    console.log(error);
  }
  console.log('server started');
});
