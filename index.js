const fs = require('fs');
const cors = require('cors');
const express = require('express');
var nodemailer = require('nodemailer');
const app = express();
const path = require('path');
const multer = require('multer');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + '/upload')));
const { mailer } = require('./services/nodemailer/mailer')

// read file functionality
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

// read directory functionality
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

// add customer photo with multer functionality
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './upload');
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + '-' + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  console.log('=====file :: ', file);
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Only .png, .jpg and .jpeg files are allowed!'));
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// add customer functionality
app.post('/customer/add', upload.single('profileImage'), async (req, res) => {
  let customerPhoto = req.file.filename;
  params = req.body;
  console.log("======email", params.email)
  params.photo = customerPhoto;
  let getCustomerData = await readFile();
  getCustomerData.push(params);
  fs.writeFile('./data', JSON.stringify(getCustomerData), (error) => {
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
  //nodemailer functionality
  // let transporter = nodemailer.createTransport({
  //   host: 'smtp.gmail.com',
  //   port: 465,
  //   secure:true,
  //   auth: {
  //       user: 'shailesh.gabu@creditt.in',
  //       pass: 'hegaixrozpzbcjpf'
  //   }
  // });
  // var mailOptions = {
  //   from: 'shailesh.gabu@creditt.in',
  //   to: params.email,
  //   subject: 'Sending Email using Node.js',
  //   text: 'welcome to creditt'
  // };
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });
});

// get customer functionality
app.get('/customer/get', async (req, res) => {
  let getCustomerData = await readFile();
  res.json({
    status: true,
    data: getCustomerData,
  });
});

// update customer functionality
app.put('/customer/update', upload.single('profileImage'), async (req, res) => {
  params = req.body;
  console.log('params', params);
  let oldPhoto = params.oldCustomerPhoto;
  if (params.profileImage == 'undefined') {
    params.profileImage = oldPhoto;
  } else {
    let files = req.file.filename;
    params.profileImage = files;
  }
  let updateUser = {
    id: params.id,
    name: params.name,
    mobile: params.mobile,
    email: params.email,
    photo: params.profileImage,
  };
  console.log('updateUser', updateUser);
  let getData = await readFile();
  Object.keys(getData).forEach((ele) => {
    if (getData[ele].id == params.id) {
      getData[ele] = updateUser;
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
  if (params.profileImage !== oldPhoto) {
    const deleteFile = `./upload/${params.oldCustomerPhoto}`;
    if (fs.existsSync(deleteFile)) {
      fs.unlink(deleteFile, (err) => {
        if (err) {
          console.log(err);
        }
        console.log('deleted');
      });
    }
  }
});

// delete customer functionality
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
// const readMailhtml = () => {

//   fs.readFile(
//     path.join(__dirname, '/pages/dashboard/mail.html'),
//     'utf-8',
//     (error, html) => {
//       if (error) {
//         resolve(false);
//         console.log(error);
//         return;
//       }
//       html.replace('##name', 'gabu shailesh');
//       console.log(html)
//     }
//   );


// };
//send mail functionality
app.post("/customer/sendmail", async (req, res) => {
  params = req.body;
  console.log(params);
  fs.readFile(path.join(__dirname, '/pages/mail/mail.html'), 'utf-8', (error, htmlContent) => {
    if (error) {
      console.log(error)
    }
    const html = htmlContent.replace(/##recipient's-name##/g,'kartavya Solanki').replace(/##sender-name##/g, 'Credify Technologies Pvt Ltd.').replace(/##sender-designation##/g, 'Node developer').replace(/##sender-mobile##/g, '+91 2245811515').replace(/##sender-email##/g, 'info@creditt.in').replace(/##sender-website##/g, 'https://creditt.in/').replace(/##user-name##/g, 'kartavya123').replace(/##user-email-address##/g, 'kartavya.solanki@creditt.in').replace(/##company-name##/g,'Credify Technologies').replace(/ ##company-support-mail##/g,'customer.support@gmail.com').replace(/##company-info-mail##/g,'info@creditt.in');
    console.log(html) 

    let mailOptions = {
      from: 'shailesh.gabu@creditt.in',
      to: params.mailAddress,
      subject: params.mailSubject,
      html: html
    };
    mailer(mailOptions)
  })
})

// user login and signup ---------------------------------------

//read file user isExist ??
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

//user register functionality
app.post('/user/register', async (req, res) => {
  params = req.body;
  let getUserData = await readUser();
  let checkEmail = getUserData.find((ele) => ele.email == params.email);
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

//user login functionality
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
  } else {
    if (isExistEmail !== undefined) {
      res.json({
        userNameStatus: true,
        msg: 'Wrong Password',
      });
    } else {
      res.json({
        status: false,
        msg: 'User Not Exist',
      });
    }
  }
});

//node mailer
// let transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure:true,
//   auth: {
//       user: 'shailesh.gabu@creditt.in',
//       pass: 'hegaixrozpzbcjpf'
//   }
// });
// var mailOptions = {
//   from: 'shailesh.gabu@creditt.in',
//   to: 'shaileshgabu1431@gmail.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

//server
app.listen(3200, (error) => {
  if (error) {
    console.log(error);
  }
  console.log('server started');
});
