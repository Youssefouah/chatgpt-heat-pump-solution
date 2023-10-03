import bot from "./assets/bot.png";
import user from "./assets/user.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
let imgArray = [];
let option = 0;
let loadInterval;
let isFirstLoading = true;

async function query(data) {
  const response = await fetch(
      "http://64.225.92.93:3000/api/v1/prediction/6eb2cc1c-a409-40f7-9ee2-bced0181c952",
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      }
  );
  const result = await response.json();
  return result;
}

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      ++index;
    } else {
      clearInterval(interval);
      if (option === 2) {
        element.innerHTML += "\n\n";
        for (let i = 0; i < imgArray.length; i++) {
          var html = "<div class='upload__img-box'><div style='background-image: url(" + URL.createObjectURL(imgArray.at(i)) + ")' data-number='" + $(".upload__img-close").length + "' data-file='" + imgArray.at(i).name + "' class='img-bg'></div></div>";
          element.innerHTML += html;
        }
        element.innerHTML += "<div id='summarizeBtnDiv' style='display: flex; gap:12px; flex-direction: column; width: 100%; margin-top: 12px'><div style='display: flex; gap: 12px'><button class='upload__btn' data-answer='All correct.'>All correct.</button><button class='upload__btn' data-answer='I have something to change.'>I have something to change.</button></div><div>"
        let chatField = $("#chatField");
        chatField.removeClass("enabled");
        chatField.addClass("disabled");
      }
      if (option === 3) {
        element.innerHTML += "<div id='entireBtnDiv' style='display: flex; gap:12px; flex-direction: column; width: 100%; margin-top: 12px'><div style='display: flex; gap: 12px'><button class='upload__btn' data-answer='Entire house'>Entire house</button><button class='upload__btn' data-answer='Not the entire house'>Not the entire house</button></div><div>"
        let chatField = $("#chatField");
        chatField.removeClass("enabled");
        chatField.addClass("disabled");
      }
      if (isFirstLoading) {
        // element.innerHTML += "<div style='display: flex; gap:12px; flex-direction: column; width: 100%; margin-top: 12px'><div style='display: flex; gap: 12px'><button class='upload__btn' data-answer='gas'>Gas</button><button class='upload__btn' data-answer='oil'>Oil</button><button class='upload__btn' data-answer='other'>Other</button></div><div><textarea id='textComment' style='background: #343541'></textarea></div></div>"
        element.innerHTML += "<div id='curPumpBtnDiv' style='display: flex; gap:12px; flex-direction: column; width: 100%; margin-top: 12px'><div style='display: flex; gap: 12px'><button class='upload__btn' data-answer='gas'>Gas</button><button class='upload__btn' data-answer='oil'>Oil</button><button class='upload__btn' data-answer='other'>Other</button></div><div>"
      }
    }
  }, 20);
}

$('body').on('click', 'button', async function() {
  if (isFirstLoading) {
    isFirstLoading = false;
    $('#curPumpBtnDiv').css("display", "none");
    const answer = $(this).attr('data-answer');

    const uniqueId = generateUniqueId();
    let chatField = $("#chatField");
    chatField.removeClass("disabled");
    chatField.addClass("enabled");
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);
    const resp = await query({question: "I use " + answer});
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";
    firstLoad(resp, uniqueId);
  }
  else if (option === 3) {
    option = 0;
    $('#entireBtnDiv').css("display", "none");
    const answer = $(this).attr('data-answer');

    const uniqueId = generateUniqueId();
    let chatField = $("#chatField");
    chatField.removeClass("disabled");
    chatField.addClass("enabled");
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);
    const resp = await query({question: answer + " is heated by it."});
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";
    firstLoad(resp, uniqueId);
  }
  if (option === 2) {
    option = 0;
    $('#summarizeBtnDiv').css("display", "none");
    const answer = $(this).attr('data-answer');

    const uniqueId = generateUniqueId();
    let chatField = $("#chatField");
    chatField.removeClass("disabled");
    chatField.addClass("enabled");
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);
    const resp = await query({question: answer});
    clearInterval(loadInterval);
    messageDiv.innerHTML = "";
    firstLoad(resp, uniqueId);
  }
})

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
      <div id="imgbox" style="margin-top: 1rem; margin-left: 2rem;"></div>
    </div>
  `;
}

function firstLoad(resp, uniqueId) {
  const messageDiv = document.getElementById(uniqueId);
  const parsedData = resp;
  const optionString = parsedData.slice(0, 7);
  const responseMessage = parsedData.slice(7, parsedData.length);
  option = parseInt(optionString[optionString.length - 1]);

  loader(messageDiv);

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  typeText(messageDiv, responseMessage);
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  $(".upload__img-wrap").html("");

  const data = new FormData(form);
  let prompt = data.get("prompt").trim();

  if(option === 1)
    prompt = "These are the photos.";

  if (prompt === "") {
    form.reset();
    return;
  }

  // user's chatstripe
  if(option !== 1)
    chatContainer.innerHTML += chatStripe(false, prompt);
  if (option === 1) {
    chatContainer.innerHTML += chatStripe(false, "Photos: ");
    if (imgArray.length > 0) {
      chatContainer.innerHTML += '<div>';
      for (let i = 0; i < imgArray.length; i++) {
        var html = "<div class='chat'><div class='upload__img-box'><div style='background-image: url(" + URL.createObjectURL(imgArray.at(i)) + ")' data-number='" + $(".upload__img-close").length + "' data-file='" + imgArray.at(i).name + "' class='img-bg'></div></div></div>";
        chatContainer.innerHTML += html;
      }
      chatContainer.innerHTML += '</div>';
    }
  }

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await query({"question": prompt});

  clearInterval(loadInterval);
  // imgArray.splice(0);
  messageDiv.innerHTML = "";

  if (response) {
    const parsedData = response;
    const optionString = parsedData.slice(0, 7);
    const responseMessage = parsedData.slice(7, parsedData.length);
    option = parseInt(optionString[optionString.length - 1]);
    console.log("option", optionString, option);
    let btn = $("#uploadbtn");
    let chatField = $("#chatField");
    let textArea = $("#textArea");
    switch (option) {
      case 1:
        textArea.blur();
        btn.removeClass("unshow");
        btn.addClass("show");
        chatField.removeClass("enabled");
        chatField.addClass("disabled");
        break;
      case 3:
        textArea.blur();
        chatField.removeClass("enabled");
        chatField.addClass("disabled");
        break;
      default:
        break;
    }

    typeText(messageDiv, responseMessage);
  } else {
    messageDiv.innerHTML = "Something went wrong";
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

function SendImg(e) {
  let chatField = $("#chatField");
  let btn = $("#uploadbtn");
  let btn1 = $("#sendImgBtn");
  btn.removeClass("show");
  btn.addClass("unshow");
  btn1.removeClass("show");
  btn1.addClass("unshow");
  chatField.removeClass("disabled");
  chatField.addClass("enabled");
  handleSubmit(e);
}

function ImgUpload() {
  var imgWrap = "";

  $('.upload__inputfile').each(function () {
    $(this).on('change', function (e) {
      imgWrap = $(this).closest('.upload__box').find('.upload__img-wrap');
      var maxLength = $(this).attr('data-max_length');

      let btn = $("#sendImgBtn");
      var files = e.target.files;
      var filesArr = Array.prototype.slice.call(files);
      var iterator = 0;
      filesArr.forEach(function (f, index) {

        if (!f.type.match('image.*')) {
          return;
        }

        if (imgArray.length > maxLength) {
          return false
        } else {
          var len = 0;
          for (var i = 0; i < imgArray.length; i++) {
            if (imgArray[i] !== undefined) {
              len++;
            }
          }
          if (len > maxLength) {
            return false;
          } else {
            btn.removeClass("unshow");
            btn.addClass("show");
            imgArray.push(f);

            var reader = new FileReader();
            reader.onload = function (e) {
              var html = "<div class='upload__img-box'><div style='background-image: url(" + e.target.result + ")' data-number='" + $(".upload__img-close").length + "' data-file='" + f.name + "' class='img-bg'><div class='upload__img-close'></div></div></div>";
              imgWrap.append(html);
              iterator++;
            }
            reader.readAsDataURL(f);
          }
        }
      });
    });
  });

  $('body').on('click', ".upload__img-close", function (e) {
    var file = $(this).parent().data("file");
    for (var i = 0; i < imgArray.length; i++) {
      if (imgArray[i].name === file) {
        imgArray.splice(i, 1);
        break;
      }
    }
    $(this).parent().parent().remove();
  });
}

ImgUpload();
document.getElementById("sendImgBtn").addEventListener("click", SendImg);
document.addEventListener('DOMContentLoaded', async function() {
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);
  const resp = await query({"question": "Hi, I need heat pump solution."});
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  firstLoad(resp, uniqueId);
});