const API_URL =
"https://script.google.com/macros/s/AKfycbyt4i0e-jyRMTHh-KcOTolRQXIvGYbD_r9nm_BURXX7zVO6J1ICZuPX7BiUh7f7S9oVsg/exec";

let users = [];
let assets = [];

let selectedType = "RADIO";
let selectedAction = "RECEIVE";
let selectedAsset = null;

const userModal =
document.getElementById("userModal");

const userSelect =
document.getElementById("userSelect");

const currentUser =
document.getElementById("currentUser");

const assetGrid =
document.getElementById("assetGrid");

const statusBar =
document.getElementById("statusBar");

async function loadUsers(){

  const res =
    await fetch(
      API_URL + "?action=users"
    );

  users = await res.json();

  userSelect.innerHTML = "";

  users.forEach(user=>{

    const option =
      document.createElement("option");

    option.value = user;
    option.textContent = user;

    userSelect.appendChild(option);

  });

}

async function loadAssets(){

  const res =
    await fetch(
      API_URL + "?action=assets&t=" +
      Date.now()
    );

  assets = await res.json();

  renderAssets();

}

function renderAssets(){

  assetGrid.innerHTML = "";

  const filtered =
    assets.filter(
      x=>x.type===selectedType
    );

  filtered.forEach(asset=>{

    const div =
      document.createElement("div");

    div.className = "asset";

    if(asset.holder){

      div.classList.add("busy");

    }

    if(
      selectedAsset &&
      selectedAsset.assetId===asset.assetId
    ){

      div.classList.add("selected");

    }

    div.innerHTML = `

      <div class="asset-name">
        ${asset.name}
      </div>

      <div class="asset-holder">
        ${asset.holder || ""}
      </div>

    `;

    div.onclick = ()=>{

      selectedAsset = asset;

      renderAssets();

    };

    assetGrid.appendChild(div);

  });

}

function getUser(){

  return localStorage.getItem(
    "username"
  );

}

function setUser(name){

  localStorage.setItem(
    "username",
    name
  );

}

function refreshUserUI(){

  const user = getUser();

  if(!user){

    userModal.classList.remove(
      "hidden"
    );

    return;
  }

  currentUser.textContent =
    "👤 " + user;

  userModal.classList.add(
    "hidden"
  );

}

async function submit(){

  if(!selectedAsset){

    alert(
      "Vui lòng chọn thiết bị"
    );

    return;
  }

  const payload = {

    user:getUser(),

    assetId:
      selectedAsset.assetId,

    action:
      selectedAction

  };

const url =
  API_URL +
  "?action=submit" +
  "&user=" + encodeURIComponent(getUser()) +
  "&assetId=" + encodeURIComponent(selectedAsset.assetId) +
  "&txAction=" + encodeURIComponent(selectedAction);

const res = await fetch(url);

  const result =
    await res.json();

  if(result.success){

    statusBar.textContent =
      "✅ Thành công";

    selectedAsset = null;

    await loadAssets();

  }else{

    alert(
      result.message
    );

  }

}

document
.getElementById("saveUserBtn")
.onclick = ()=>{

  setUser(
    userSelect.value
  );

  refreshUserUI();

};

document
.getElementById("changeUserBtn")
.onclick = ()=>{

  userModal.classList.remove(
    "hidden"
  );

};

document
.querySelectorAll(".type-btn")
.forEach(btn=>{

  btn.onclick = ()=>{

    document
      .querySelectorAll(
        ".type-btn"
      )
      .forEach(
        x=>x.classList.remove(
          "active"
        )
      );

    btn.classList.add(
      "active"
    );

    selectedType =
      btn.dataset.type;

    selectedAsset = null;

    renderAssets();

  };

});

document
.querySelectorAll(".action-btn")
.forEach(btn=>{

  btn.onclick = ()=>{

    document
      .querySelectorAll(
        ".action-btn"
      )
      .forEach(
        x=>x.classList.remove(
          "active"
        )
      );

    btn.classList.add(
      "active"
    );

    selectedAction =
      btn.dataset.action;

  };

});

document
.getElementById("confirmBtn")
.onclick = submit;

async function init(){

  await loadUsers();

  refreshUserUI();

  await loadAssets();

  setInterval(
    loadAssets,
    10000
  );

}

init();
