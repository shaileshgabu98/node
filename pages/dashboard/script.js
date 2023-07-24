$(document).ready(function () {
  getCustomer();
});
const addCustomerBtn = () => {
  $('#nameError').addClass('d-none');
  $('#mobileError').addClass('d-none');
  $('#emailError').addClass('d-none');
  $('#customerName').val('');
  $('#customerNumber').val('');
  $('#customerEmail').val('');
  $('#img-preview').html('');
  showSubmit();
  hideLoaderBtn();
};
const editCustomerBtn = (row) => {
  $('#customerName').val(row.name);
  $('#customerNumber').val(row.mobile);
  $('#customerEmail').val(row.email);
  $('#customerId').val(row.id);
  $('#customerPhoto').val(row.photo);
  $('#img-preview').html(`<img src="../../upload/${row.photo}" />`);
  showSubmit();
  hideLoaderBtn();
};
const sendMailBtn = (row) => {
  $('#recipient-name').val(row.email);

}
const mailHandler = () => {
  let mailAddress = $('#recipient-name').val();
  let mailSubject = $('#mail-subject').val();
  let mailMessage = $('#message-text').val();
  let mailDetails = { mailAddress: mailAddress, mailSubject: mailSubject, mailMessage: mailMessage }
  console.log(mailDetails);
  $.ajax({
    type: "POST",
    url: 'http://localhost:3200/customer/sendmail',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(mailDetails),
    success: function (response) {
      console.log(response)
    }
  })
}
var modelType = '';
const openModel = (modal, row) => {
  if ('updateModal' == modal) {
    modelType = 'update';
    editCustomerBtn(row);
  } else if ('addModal' == modal) {
    modelType = 'add';
    addCustomerBtn();
  } else {
    console.log('no modal match');
  }
};

const handleSubmit = () => {
  if (modelType == 'update') {
    updateCustomer(event);
  } else {
    addCustomer(event);

  }
};

$('#choose-file').change(function () {
  getImgData();
  function getImgData() {
    var files = $('#choose-file')[0].files[0];
    console.log(files);
    if (files) {
      var fileReader = new FileReader();
      fileReader.readAsDataURL(files);
      fileReader.onload = function () {
        $('#img-preview').html('<img src="' + this.result + '" />');
      };
    }
  }
});

const addCustomer = (event) => {
  event.preventDefault();
  const formData = new FormData();
  let files = $('#choose-file')[0].files[0];
  let id = Math.random();
  let name = $('#customerName').val();
  let mobile = $('#customerNumber').val();
  let email = $('#customerEmail').val();
  formData.append('profileImage', files);
  formData.append('id', id)
  formData.append('name', name)
  formData.append('mobile', mobile)
  formData.append('email', email)
  if (name != '' && mobile != '' && email != '') {
    showLoaderBtn();
    hideSubmit();
    $.ajax({
      type: 'POST',
      enctype: 'multipart/form-data',
      url: 'http://localhost:3200/customer/add',
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      success: function (response) {
        console.log("response", response)
        if (response.status == true) {
          $('#customerName').val('');
          $('#customerNumber').val('');
          $('#customerEmail').val('');
          $('#img-preview').html('');
          $('#customerPhoto').val('');
          $('#CustomerModel').modal('hide');
          hideLoaderBtn();
          showSubmit();
          getCustomer();
        }
      },
    });
  } else {
    if (name == '') $('#nameError').removeClass('d-none');
    if (mobile == '') $('#mobileError').removeClass('d-none');
    if (email == '') $('#emailError').removeClass('d-none');
  }
};

const updateCustomer = (event) => {
  event.preventDefault();
  const formData = new FormData();
  let files = $('#choose-file')[0].files[0];
  let nameUpdate = $('#customerName').val();
  let mobileUpdate = $('#customerNumber').val();
  let emailUpdate = $('#customerEmail').val();
  let customerPhoto = $('#customerPhoto').val();
  let id = parseFloat($('#customerId').val());
  formData.append('id', id);
  formData.append('name', nameUpdate);
  formData.append('email', emailUpdate);
  formData.append('mobile', mobileUpdate);
  formData.append('profileImage', files);
  formData.append('oldCustomerPhoto', customerPhoto);
  if (nameUpdate != '' && mobileUpdate != '' && emailUpdate != '') {
    showLoaderBtn();
    hideSubmit();
    $.ajax({
      type: 'PUT',
      enctype: 'multipart/form-data',
      url: 'http://localhost:3200/customer/update',
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      success: function (response) {
        if (response.status == true) {
          $('#customerName').val('');
          $('#customerNumber').val('');
          $('#customerEmail').val('');
          $('#customerPhoto').val('');
          $('#img-preview').html('');
          $('#choose-file').val('')
          $('#CustomerModel').modal('hide');
          hideLoaderBtn();
          showSubmit();
          getCustomer();
        }
      }
    });
  } else {
    if (nameUpdate == '') $('#nameError').removeClass('d-none');
    if (mobileUpdate == '') $('#mobileError').removeClass('d-none');
    if (emailUpdate == '') $('#emailError').removeClass('d-none');
  }
};

const getCustomer = () => {
  showLoader();
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3200/customer/get',
    dataType: 'json',
    contentType: 'application/json',
    success: function (response) {
      console.log("response :::::", response)
      closeLoader();
      if (response.status == true) {
        $('#customerTbody').empty();
        if (response?.data && response?.data?.length > 0) {
          for (let i = 0; i < response.data.length; i++) {
            let ele = response.data[i];
            ele.isUpdate = true;
            let tbody = `<tr><th>${i + 1
              }</th><th><img style="width:40px; height:30px" src="../../upload/${ele.photo
              }"></th><th>${ele.name}</th><th>${ele.mobile}</th><th>${ele.email
              }</th><th><span onclick='openModel("updateModal",${JSON.stringify(
                ele
              )})' data-bs-toggle="modal" data-bs-target="#CustomerModel" ><i class="bi bi-pencil-square"></i></span><span class='px-2' onclick='deleteCustomer(${JSON.stringify(
                ele
              )})'><i class="bi bi-trash"></i></span><span class='px-2' onclick='sendMailBtn(${JSON.stringify(ele)})' data-bs-toggle="modal" data-bs-target="#mailModal"><i class="bi bi-envelope-at"></i></span></th></tr>`;
            $('#customerTbody').append(tbody);
          }
        }
      }
    },
  });
};
const deleteCustomer = (row) => {
  showLoader();
  $.ajax({
    type: 'DELETE',
    url: 'http://localhost:3200/customer/delete',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(row),
    success: function (response) {
      closeLoader();
      if (response.status == true) {
        getCustomer();
      }
    },
  });
};

const showLoader = () => {
  $('#spinner').removeClass('d-none');
};
const closeLoader = () => {
  $('#spinner').addClass('d-none');
};
const hideSubmit = () => {
  $('#submitBtn').addClass('d-none');
};
const showSubmit = () => {
  $('#submitBtn').removeClass('d-none');
};
const hideLoaderBtn = () => {
  $('#loadingBtn').addClass('d-none');
};
const showLoaderBtn = () => {
  $('#loadingBtn').removeClass('d-none');
};
