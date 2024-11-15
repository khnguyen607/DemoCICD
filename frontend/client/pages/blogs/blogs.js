document.addEventListener("DOMContentLoaded", async () => {
  await Helper.fetchBackendLink();
  _init();
  _showCategories();
});

async function _init() {
  var items = await Helper.fetchData("blog&action=getAllsFK");
  if (Helper.getParameter("q"))
    document.querySelector(".sidebar-search input").value =
      Helper.getParameter("q");
  filterBy(items);
  // document.querySelector(".sidebar-search form").addEventListener('submit', (evt) => { evt.preventDefault(); filterBy(items) })
}

async function showDatas(items) {
  var dataList = document.querySelector(".dataList");
  var dataItem = dataList.querySelector(".dataItem").cloneNode(true);
  dataList.innerHTML = "";
  await items.forEach((item) => {
    let cloneData = dataItem.cloneNode(true);

    cloneData.querySelector("h3").textContent = item.Name;
    cloneData
      .querySelectorAll("a._hrefBlogDetail")
      .forEach((i) => (i.href = `./?page=blogDetails&id=${item.ID}`));
    cloneData.querySelector("img").src = Helper.getLink(item.Img);
    cloneData.querySelector("p").textContent = item.Subtitle;
    cloneData.querySelector("span.author").textContent = item.user;
    cloneData.querySelector("span.cat").textContent = item.categoriesValue;

    const date = new Date(item.Date);
    cloneData.querySelector(".date").textContent =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    dataList.appendChild(cloneData);
  });
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

function chunkArray(array, chunkSize) {
  let result = [];
  let j = 1;
  for (let i = 0; i < array.length; i += chunkSize) {
    let chunk = array.slice(i, i + chunkSize);
    result[j] = chunk;
    j++;
  }
  return result;
}

async function filterBy(items) {
  runMain(items);
  async function runMain(items) {
    var items = items.filter((item) => {
      if (!byName(item.Name)) return false;
      if (!byCategories(item.categoriesValue)) return false;
      return true;
    });
    let chunkItem = chunkArray(items, 2);
    new Pagination(chunkItem);
    showDatas(chunkItem[1]);
  }

  // Lọc theo tên
  function byName(name) {
    var nameValue = document.querySelector(".sidebar-search input").value;
    if (name.toLowerCase().includes(nameValue.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  function byCategories(name) {
    if (!Helper.getParameter("category")) return true;
    if (!name) return false;
    var nameValue = Helper.getParameter("category");
    if (name.toLowerCase().includes(nameValue.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }
}

class Pagination {
  static curentPage = 1;
  static items = null;
  constructor(items) {
    Pagination.items = items;
    this.displayPagination();
    this.eventListeners();
    Pagination.displayPage();
  }

  // active nội dung đang được chọn
  static async displayPage() {
    document
      .querySelectorAll(".page-pagination li[data-pageIndex] a")
      .forEach((item) => {
        item.classList.remove("active");
      });
    document
      .querySelector(
        `.page-pagination li[data-pageIndex="${Pagination.curentPage}"] a`
      )
      .classList.add("active");
    showDatas(Pagination.items[Pagination.curentPage]);
  }

  eventListeners() {
    // lắng nghe sự kiện chọn trang
    document
      .querySelectorAll(".page-pagination li[data-pageIndex]")
      .forEach((item) => {
        item.addEventListener("click", () => {
          Pagination.curentPage = parseInt(item.getAttribute("data-pageIndex"));
          Pagination.displayPage();
        });
      });

    // lắng nghe sự kiện bấm nút trang trước
    document
      .querySelector(".page-pagination .prev")
      .addEventListener("click", () => {
        if (Pagination.curentPage > 1) {
          Pagination.curentPage--;
          Pagination.displayPage();
        }
      });

    // lắng nghe sự kiện bấm nút trang sau
    document
      .querySelector(".page-pagination .next")
      .addEventListener("click", () => {
        if (
          Pagination.curentPage <
          document.querySelectorAll(".page-pagination li[data-pageIndex]")
            .length
        ) {
          Pagination.curentPage++;
          Pagination.displayPage();
        }
      });
  }

  displayPagination() {
    var prev = document.createElement("li");
    prev.classList.add("prev", "page-item");
    prev.innerHTML = `<a href="javascript:void(0);" aria-label="Previous">
                            <i class="fa fa-angle-left"></i>
                        </a>`;
    var next = document.createElement("li");
    next.classList.add("next", "page-item");
    next.innerHTML = `<a href="javascript:void(0);" aria-label="Next">
                            <i class="fa fa-angle-right"></i>
                        </a>`;

    var paginations = document.querySelector(".page-pagination");
    paginations.innerHTML = "";
    paginations.appendChild(prev);
    for (let i = 1; i < Pagination.items.length; i++) {
      var pagination = document.createElement("li");
      pagination.classList.add("page-item");
      pagination.setAttribute("data-pageIndex", i);
      pagination.innerHTML = `<a href="javascript:void(0);">${i}</a>`;
      paginations.appendChild(pagination);
    }
    paginations.appendChild(next);
  }
}
