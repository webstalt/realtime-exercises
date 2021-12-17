const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// this will hold all the most recent messages
let allChat = [];

const INTERVAL = 3000;

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});
async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  const res = await fetch("/poll", options);
  const json = await res.json();
}

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch("/poll");
    json = await res.json();

    if (res.status >= 400) {
      throw new Error('request did not succeed: ' + res.status)
    }
    allChat == json.msg;
    render();
    failedTries = 0;
  } catch (e) {
    // back off could would go here
    console.error("polling error", e);
    failedTries++;
  }
  allChat = json.msg;
  render();
}

function render() {
  // todo
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToMakeNextRequest = 0;
const BACKOFF = 5000;
let failedTries = 0;

async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    timeToMakeNextRequest = Date.now() + INTERVAL + failedTries * BACKOFF;
  }

  requestAnimationFrame(rafTimer);
}

requestAnimationFrame(rafTimer);
