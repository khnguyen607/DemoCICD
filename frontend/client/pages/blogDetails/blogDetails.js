document.addEventListener("DOMContentLoaded", async () => {
  await Helper.fetchBackendLink();
  // Khởi tạo trang
  _init();
  _showCategories();
  _getCategory();
  // Đặt bình luận
  _getComments();
  _sendComment();
});

async function _init() {
  var item = await Helper.fetchData(
    `blog&action=find&id=${Helper.getParameter("id")}`
  );
  document.querySelector(".page-banner-cont h2").textContent = capitalizeFirst(
    item.Name
  );
  document.querySelector(
    ".page-banner-cont .breadcrumb-item.active"
  ).textContent = capitalizeFirst(item.Name);
  document.querySelector(".entry-title").textContent = capitalizeFirst(
    item.Name
  );

  const date = new Date(item.Date);
  document.querySelector(
    ".cont .post-date"
  ).innerHTML = `${date.getDate()} Tháng ${
    date.getMonth() + 1
  }, ${date.getFullYear()}`;
  document.querySelector(".blog-details .thum img").src = Helper.getLink(
    item.Img
  );
  document.querySelector("._blogContent").innerHTML = item.Content;
}

async function _getCategory() {
  var items = await Helper.fetchData(
    `blog&action=getCategories&id=${Helper.getParameter("id")}`
  );
  var categories = "";
  items.forEach((item) => {
    categories += item.Name + ", ";
  });
  if (categories) {
    categories = categories.slice(0, -2);
  }
  document.querySelector(".post-category").textContent = categories;
}

async function _showCategories() {
  var items = await Helper.fetchData("category");
  var dataList = document.querySelector(".category-list");
  dataList.innerHTML = "";
  items.forEach((item) => {
    let dataItem = document.createElement("li");
    dataItem.innerHTML = `<li><a href="#">${item.Name}</a></li>`;
    dataItem.addEventListener("click", () => {
      window.location.href = `./?page=blogs&category=${item.Name}`;
    });
    dataList.appendChild(dataItem);
  });
}

async function _getComments() {
  var comments = await Helper.fetchData(
    `blog&action=getComments&id=${Helper.getParameter("id")}`
  );
  document.querySelector("h3.comments-area").textContent =
    "Bình luận (" + comments.length + ")";
  var commentsList = document.querySelector(".commentsList");
  var commentsItem = document.querySelector(".commentsItem").cloneNode(true);
  commentsList.innerHTML = "";
  if (comments) {
    comments.forEach((item) => {
      var itemClone = commentsItem.cloneNode(true);
      itemClone.setAttribute("data-commentId", item.ID);
      itemClone.querySelector(".comment-name h6").textContent = item.Name;
      itemClone.querySelector(".comment-description p").textContent = item.Content;
      itemClone.querySelector(".comment-name span").textContent = formatDate(
        item.Date
      );

      itemClone
        .querySelector(".comment-replay")
        .addEventListener("click", function () {
          itemClone.querySelector("._inputGroup").classList.toggle("d-none");
        });

      itemClone
        .querySelector("._inputGroup button")
        .addEventListener("click", async () => {
          var Content = itemClone.querySelector("._inputGroup input").value;
          var userID = Helper.getCookie("user_id");
          var parentCommentID = item.ID;
          var blogID = Helper.getParameter("id");
          addComment(Content, userID, parentCommentID, blogID);
        });

      if (item.parentCommentID) {
        commentsList
          .querySelector(
            `.commentsItem[data-commentId='${item.parentCommentID}'] li`
          )
          .appendChild(itemClone);
      } else {
        commentsList.appendChild(itemClone);
      }
    });
  }
}

async function _sendComment() {
  document
    .querySelector(".comment-form form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var Content = document.querySelector(".comment-form textarea").value;
      var userID = Helper.getCookie("user_id");
      var parentCommentID = null;
      var blogID = Helper.getParameter("id");
      addComment(Content, userID, parentCommentID, blogID);
    });
}

function capitalizeFirst(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(inputDateStr) {
  var dateObj = new Date(inputDateStr);

  var day = dateObj.getDate();
  var month = dateObj.getMonth() + 1; // Tháng bắt đầu từ 0
  var year = dateObj.getFullYear();

  var hours = dateObj.getHours();
  var minutes = dateObj.getMinutes();

  var period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  minutes = minutes < 10 ? "0" + minutes : minutes;

  var formattedDate =
    "Đã đăng: " +
    day +
    "/" +
    month +
    "/" +
    year +
    " " +
    hours +
    ":" +
    minutes +
    " " +
    period;

  return formattedDate;
}

async function addComment(Content, userID, parentCommentID, blogID) {
  if (!Helper.getCookie("user_id")) {
    alert("Đăng nhập để có thể bình luận");
    return;
  }
  const formData = new FormData();
  formData.append("Content", Content);
  formData.append("userID", userID);
  formData.append("parentCommentID", parentCommentID);
  formData.append("blogID", blogID);
  // Send form data using fetch
  fetch(Helper.backendLink + "?controller=comment&action=insert", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data == true) {
        location.reload();
        alert("Đăng bình luận thành công");
      }
    })
    .catch((error) => {
      // Handle errors
      console.error("There was a problem with the fetch operation:", error);
    });
}
