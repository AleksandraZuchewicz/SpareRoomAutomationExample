function getMessage(name) {
  return `
    Hi ${name}
    I've just read your ad and I think you might be interested in the room I will be moving out from soon.
    
    This double room is available in a recently refurbished flat in the best Putney location. The room is setup like a studio and is the largest room. Great location with shops, restaurants, cafés, parks and The Thames on your doorstep.
    
    The flat benefits from a comfortable shared lounge, walk-in shower room with toilet and a separate bathroom with bath and shower.
    
    In the flat there are 2 flatmates, who are really easy-going young professionals, both in their early 30s.
    
    More about room and flat: ref#123456
    `;
}
const config = {
  testSuiteName: "creating automation test script ",
  testCaseName: "help us find new flatmate",
  spareRoomUrl: "https://www.spareroom.co.uk/",
  maxPage: 500,
  login: "yourUsername",
  password: "yourPassword",
  postcode: "SW15",
  minRentValue: "800"
};
const simpleSelectors = {
  autoPopUp: "#show-user-auth-popup",
  loginInput: "#loginemail",
  passwordInput: "#loginpass",
  loginButton: "#sign-in-button",
  locationSearch: "#search_by_location_field",
  searchButton:
    "#spareroom > div:nth-child(2) > aside:nth-child(1) > form > section > fieldset > div.grid-4 > div:nth-child(1) > button",
  minRentInput: "#minRent",
  advSearchButton: "#searchFilters > div > div > button",
  usersList: "#maincontent .listing-result",
  titleOfAd: ".desktop h1",
  emailAdvertiser: ".emailadvertiser",
  messageFieldInput: "#messagefieldinput",
  sendAdButton: ".contact_form_submit .button",
  userNameInput: ".key-features > li:nth-child(1)",
  nextButton: ".navnext a",
  contacted: ".contacted"
};
const complexSelectors = {
  contacted: parameters =>
    getSelector("usersList") +
    ":nth-child(" +
    parseInt(parameters[0] + 1) +
    ") .savedAd"
};
function getSelector(location, parameters) {
  if (!parameters) {
    return simpleSelectors[location];
  } else {
    return complexSelectors[location](parameters);
  }
}
function readUserName() {
  return $(getSelector("userNameInput"))
    .getText()
    .trim();
}

describe(config.testSuiteName, function() {
  it(config.testCaseName, function() {
    function logIn() {
      browser.$(getSelector("autoPopUp")).click();
      browser.$(getSelector("loginInput")).addValue(config.login);
      browser.pause(3000);
      browser.$(getSelector("passwordInput")).addValue(config.password);
      browser.pause(3000);
      let loginButton = $(getSelector("loginButton"));
      loginButton.click();
    }
    function searchForAds() {
      let searchForLocation = $(getSelector("locationSearch"));
      searchForLocation.click();
      searchForLocation.addValue(config.postcode);
      browser.pause(1000);
      let searchForSW15 = $(getSelector("searchButton"));
      searchForSW15.click();
      browser.pause(1000);
      let minRent = $(getSelector("minRentInput"));
      minRent.click();
      minRent.addValue(config.minRentValue);
      browser.pause(1000);
      let advSearchButton = $(getSelector("advSearchButton"));
      advSearchButton.click();
    }
    function sendEmail(userAd) {
      userAd.$(getSelector("titleOfAd")).click();
      const userName = readUserName();
      if ($$(getSelector("contacted")).length) {
        return;
      }
      $(getSelector("emailAdvertiser")).click();
      $(getSelector("messageFieldInput")).click();
      browser.keys(getMessage(userName).split(""));
      $(getSelector("sendAdButton")).click();
    }

    browser.setWindowSize(1920, 1080);
    browser.url(config.spareRoomUrl);
    logIn();
    browser.pause(3000);
    searchForAds();
    browser.pause(1000);
    for (let i = 0; i <= config.maxPage; i++) {
      let currentUrl = browser.getUrl();
      let usersList = $$(getSelector("usersList"));
      for (let j = 0; j < usersList.length; j++) {
        const userAd = usersList[j];
        let elementContacted = $(getSelector("contacted", [j]));
        if (!elementContacted.isExisting()) {
          sendEmail(userAd);
          browser.url(currentUrl);
          usersList = $$(getSelector("usersList"));
        }
      }
      //click next button if exists
      const nextButton = $(getSelector("nextButton"));
      if (nextButton.isExisting()) {
        nextButton.click();
      } else {
        break;
      }
    }
  });
});
