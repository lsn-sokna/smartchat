# smartchat
This is just my study case with Socket.io + NodeJS.

To run this, please register parse account with parse.com and get configuration key.

For index.js, please get your ParseAppKey, ParseJavascriptKey, and APIKey, to replace as below:


var ParseAppKey = 'YOUR_APP_KEY'; //line 17
var ParseAPIKey = 'YOUR_API_KEI'; //line 18
Parse.initialize('YOUR_APP_KEY_HERE', 'YOUR_JAVASCRIPT_KEY'); //line 19


For CloudCode/config/global.json, you also have to configure your parse key in that file too.


Note:
  For Hosting server, I used Heroku to host this sample code. Here's an instruction that you can follow, and it's free.
  https://devcenter.heroku.com/articles/getting-started-with-nodejs
  For database, I used Parse to store all information of users and messages. It's also free, fast, easy-to-use, flexible.
  https://parse.com/
