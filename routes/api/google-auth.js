const { google } = require("googleapis");

const CLIENT_ID =
  "695946025516-gb72rluf8u2iih6mnib31eu02q27ldn8.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";
const SCOPES = ["https://www.googleapis.com/auth/userinfo.email"];

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

exports.getGoogleAuthUrl = () => {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
};

exports.getGoogleUser = async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
};
