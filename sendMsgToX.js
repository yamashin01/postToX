/**
 * Xにメッセージをポスト
 */
const postMessageToX = (message) => {
  const payload = {
    text: message,
  };

  const service = getService();
  if (service.hasAccess()) {
    const url = `https://api.twitter.com/2/tweets`;
    const response = UrlFetchApp.fetch(url, {
      method: "POST",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${service.getAccessToken()}`,
      },
      muteHttpExceptions: true,
      payload: JSON.stringify(payload),
    });
    const result = JSON.parse(response.getContentText());
    console.log(JSON.stringify(result, null, 2));
  } else {
    const authorizationUrl = service.getAuthorizationUrl();
    console.warn(
      `Open the following URL and re-run the script: ${authorizationUrl}`
    );
  }
};

/**
 * シートからXへの投稿メッセージの作成
 */
const autoTweetFromSheet = () => {
  try {
    // 対象のシートを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("X投稿文");

    // 投稿する記事の行番号を取得
    const targetRow = parseInt(property.getProperty("postRow"));

    // 文面を取得
    const msg = sheet.getRange(targetRow, 2).getValue();

    // Xへの投稿処理
    postMessageToX(msg);

    // 投稿文の行番号を１ずらす
    property.setProperty("postRow", targetRow + 1);
  } catch (e) {
    console.error(e.message);
  }
};
