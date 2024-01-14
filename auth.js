/**
 * PKCE（Proof Key for Code Exchange）認証の準備
 *  - ユーザーのプロパティを取得
 *  - OAuth2ライブラリを使用したTwitterのOAuth 2.0サービスを設定
 *  - 認証の基本URLとトークンURLを設定
 *  - クライアントIDとクライアントシークレットを設定
 *  - 認証が完了した際に呼び出されるコールバック関数を指定
 *  - OAuth2スコープを指定（ユーザー情報の読み取り、ツイートの読み取り・書き込み、オフラインアクセス）。
 *  - PKCE認証のための追加パラメータを設定
 *  - トークン取得時のヘッダーを設定
 */
const getService = () => {
  pkceChallengeVerifier();
  const userProps = PropertiesService.getUserProperties();
  // const scriptProps = PropertiesService.getScriptProperties();
  return OAuth2.createService('twitter')
    .setAuthorizationBaseUrl('https://twitter.com/i/oauth2/authorize')
    .setTokenUrl('https://api.twitter.com/2/oauth2/token?code_verifier=' + userProps.getProperty("code_verifier"))
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(userProps)
    .setScope('users.read tweet.read tweet.write offline.access')
    .setParam('response_type', 'code')
    .setParam('code_challenge_method', 'S256')
    .setParam('code_challenge', userProps.getProperty("code_challenge"))
    .setTokenHeaders({
      'Authorization': 'Basic ' + Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded'
    })
}

/**
 * OAuth2サービスによるTwitterからのコールバックリクエスト
 */
const authCallback = (request) => {
  const service = getService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
 * PKCE（Proof Key for Code Exchange）認証用のハッシュ生成
 *  セキュリティ強化用
 *   - code_verifier（ランダムな文字列）
 *   - code_challenge（code_verifierのSHA-256ハッシュ）
 */
const pkceChallengeVerifier = () => {
  const userProps = PropertiesService.getUserProperties();
  if (!userProps.getProperty("code_verifier")) {
    const verifier = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    for (const i = 0; i < 128; i++) {
      verifier += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    const sha256Hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, verifier)

    const challenge = Utilities.base64Encode(sha256Hash)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    userProps.setProperty("code_verifier", verifier)
    userProps.setProperty("code_challenge", challenge)
  }
}

/**
 * リダイレクト先のURLを出力
 * デバッグ用
 */
const logRedirectUri = () => {
  const service = getService();
  console.log(service.getRedirectUri());
}

/**
 * 認証の実行
 */
const authorizeToTwitter = () => {
  const service = getService();
  if (service.hasAccess()) {
    console.log("Already authorized");
  } else {
    const authorizationUrl = service.getAuthorizationUrl();
    console.warn('Open the following URL and re-run the script: %s', authorizationUrl);
  }
}