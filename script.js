import bot from "./assets/bot.png";
import user from "./assets/user.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
let imgArray = [];
let option = 0;
let loadInterval;

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
      }
    }
  }, 20);


}

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

function firstLoad() {
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  typeText(messageDiv, "Hi, How can I assist you today?");
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  $(".upload__img-wrap").html("");

  const data = new FormData(form);
  const prompt = data.get("prompt").trim();

  if (prompt === "") {
    form.reset();
    return;
  }

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, prompt);
  if (option === 1) {
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

  const response = await query({"question": data.get("prompt")});

  clearInterval(loadInterval);
  // imgArray.splice(0);
  messageDiv.innerHTML = "";

  if (response) {
    const parsedData = response;
    const optionString = parsedData.slice(0, 7);
    const responseMessage = parsedData.slice(7, parsedData.length);
    option = parseInt(optionString[optionString.length - 1]);
    
    let btn = $("#uploadbtn");
    let chatField = $("#chatField");
    let textArea = $("#textArea");
    switch (option) {
      case 0:
        btn.removeClass("enabled");
        btn.addClass("disabled");
        break;
      case 1:
        textArea.blur();
        btn.removeClass("disabled");
        btn.addClass("enabled");
        chatField.removeClass("enabled");
        chatField.addClass("disabled");
        break;
      case 2:
        btn.removeClass("enabled");
        btn.addClass("disabled");
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

function ImgUpload() {
  var imgWrap = "";

  $('.upload__inputfile').each(function () {
    $(this).on('change', function (e) {
      imgWrap = $(this).closest('.upload__box').find('.upload__img-wrap');
      var maxLength = $(this).attr('data-max_length');

      let chatField = $("#chatField");
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
            chatField.removeClass("disabled");
            chatField.addClass("enabled");
            chatField.placeholder = 'Your Answer...';
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

firstLoad();
ImgUpload();