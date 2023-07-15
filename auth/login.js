$(document).ready(function () {});

const submitForm = (event) => {
  event.preventDefault()
  let userEmail = $("#userEmail").val();
  let userPassword = $("#userPassword").val();
  userData = { email: userEmail, password: userPassword };
  console.log("::user",userData);
  $.ajax({
    type: "POST",
    url: "http://localhost:3200/user/login",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(userData),
    success: function (response) {
      console.log(response);
        if (response.userStatus  === true ) {
          window.location.href = "../pages/dashboard/index.html"
          return;
        }else if(response.userNameStatus  === true ){
          alert(response.msg)
        }else{
          alert(response.msg)
        }
      } 
  });
};
const userRegister = () => {
  let userFirstName = $("#userFirstName").val();
  let userLastName = $("#userLastName").val();
  let userEmail = $("#registerEmail").val();
  let userPassword = $("#registerPassword").val();

  let userData = {
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    password: userPassword,
  };
  $.ajax({
    type: "POST",
    url: "http://localhost:3200/user/register",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(userData),
    success: function (response) {
      $("#userFirstName").val("")
      $("#userLastName").val("")
      $("#registerEmail").val("")
      $("#registerPassword").val("")
      console.log(response);
      alert(response.msg)
    },
  });
};
