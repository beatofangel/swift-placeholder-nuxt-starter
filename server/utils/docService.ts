import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { createHash } from 'crypto'
import querystring from 'querystring'
const {
  cfgSignatureSecret,
  cfgSignatureSecretExpiresIn,
  cfgSignatureAuthorizationHeader,
  cfgSignatureAuthorizationHeaderPrefix,
  cfgSignatureEnable,
  cfgSignatureUseForRequest,
  cfgSignatureSecretAlgorithmRequest,
  converterUrl,
  commandUrl,
  siteUrl
} = useDocConfig()

export const useDocService = () => {
  const fileUtility = useFileUtility()
  const getToken = function (data: any) {
    console.log(cfgSignatureSecret, cfgSignatureSecretExpiresIn)
    return jwt.sign(data, cfgSignatureSecret, { expiresIn: cfgSignatureSecretExpiresIn })
  }
  const readToken = function (token: any) {
    try {
      return jwt.verify(token, cfgSignatureSecret);  // verify signature on jwt token using signature secret
    } catch (err: any) {
      console.log('checkJwtHeader error: name = ' + err.name + ' message = ' + err.message + ' token = ' + token)
    }
    return null;
  }
  const checkJwtHeader = function (headers: Record<string, string | undefined>) {
    var decoded = null;
    var authorization = headers[cfgSignatureAuthorizationHeader];  // get signature authorization header from the request
    if (authorization && authorization.startsWith(cfgSignatureAuthorizationHeaderPrefix)) {  // if authorization header exists and it starts with the authorization header prefix
      var token = authorization.substring(cfgSignatureAuthorizationHeaderPrefix.length);  // the resulting token starts after the authorization header prefix
      try {
        decoded = jwt.verify(token, cfgSignatureSecret);  // verify signature on jwt token using signature secret
      } catch (err: any) {
        console.log('checkJwtHeader error: name = ' + err.name + ' message = ' + err.message + ' token = ' + token)  // print debug information to the console
      }
    }
    return decoded;
  }
  const generateRevisionId = function (expectedKey: string) {
    let _key = expectedKey
    let maxKeyLength = 128;  // the max key length is 128
    if (_key.length > maxKeyLength) {  // if the expected key length is greater than the max key length
      // _key = _key.hashCode().toString();  // the expected key is hashed and a fixed length value is stored in the string format
      _key = createHash('sha1').update(_key).digest('hex')
    }

    var key = _key.replace(new RegExp("[^0-9-.a-zA-Z_=]", "g"), "_");
    console.log('generateRevisionId', key)

    return key.substring(0, Math.min(key.length, maxKeyLength));  // the resulting key is of the max key length or less
  }
  const getConvertedUriSync = async function (documentUri: string, fromExtension: string, toExtension: string, documentRevisionId: string) {
    await getConvertedUri(documentUri, fromExtension, toExtension, documentRevisionId, false);
  }
  const getConvertedUri = async function (documentUri: string, fromExtension: string, toExtension: string, documentRevisionId: string, async: boolean, filePass = null, lang = null) {
    const fExt = fromExtension || fileUtility.getFileExtension(documentUri);  // get the current document extension

    var title = fileUtility.getFilename(documentUri) || uuid()  // get the current document name or uuid

    documentRevisionId = generateRevisionId(documentRevisionId || documentUri);  // generate the document key value

    const params: Record<string, any> = {  // write all the conversion parameters to the params dictionary
      async: async,
      url: documentUri,
      outputtype: toExtension.replace(".", ""),
      filetype: fExt!.replace(".", ""),
      title: title,
      key: documentRevisionId,
      password: filePass,
      region: lang,
    };

    var uri = siteUrl + converterUrl;  // get the absolute converter url
    var headers: Record<string, any> = {};

    if (cfgSignatureEnable && cfgSignatureUseForRequest) {  // if the signature is enabled and it can be used for request
      headers[cfgSignatureAuthorizationHeader] = cfgSignatureAuthorizationHeaderPrefix + fillJwtByUrl(uri, params);  // write signature authorization header
      params.token = getToken(params);  // get token and save it to the parameters
    }

    //parse url to allow request by relative url after https://github.com/node-modules/urllib/pull/321/commits/514de1924bf17a38a6c2db2a22a6bc3494c0a959
    return await $fetch(uri, { method: 'POST', headers: headers, body: params })
    // await urllib.request(new URL(uri),
    //     {
    //         method: "POST",
    //         headers: headers,
    //         data: params
    //     })
  }
  const fillJwtByUrl = function (uri: string, opt_dataObject: any) {
    var query = querystring.parse(uri.split('?')[1])

    var payload = { query: query, payload: opt_dataObject };  // create payload object

    var options = { algorithm: cfgSignatureSecretAlgorithmRequest, expiresIn: cfgSignatureSecretExpiresIn };
    return jwt.sign(payload, cfgSignatureSecret, options);  // sign token with given data using signature secret and options parameters
  }
  const getResponseUri = function (json: string) {
    var fileResult = JSON.parse(json);

    if (fileResult.error)  // if an error occurs
      processConvertServiceResponceError(parseInt(fileResult.error));  // get an error message

    var isEndConvert = fileResult.endConvert  // check if the conversion is completed

    var percent = parseInt(fileResult.percent);  // get the conversion percentage
    var uri = null;

    if (isEndConvert) {  // if the conversion is completed
      if (!fileResult.fileUrl)  // and the file url doesn't exist
        throw { message: "FileUrl is null" };  // the file url is null

      uri = fileResult.fileUrl;  // otherwise, get the file url
      percent = 100;
    } else {  // if the conversion isn't completed
      percent = percent >= 100 ? 99 : percent;  // get the percentage value
    }

    return {
      key: percent,
      value: uri
    };
  }
  const processConvertServiceResponceError = function (errorCode: number) {
    var errorMessage = "";
    var errorMessageTemplate = "Error occurred in the ConvertService: ";

    // add the error message to the error message template depending on the error code
    switch (errorCode) {
      case -20:
        errorMessage = errorMessageTemplate + "Error encrypt signature";
        break;
      case -8:
        errorMessage = errorMessageTemplate + "Error document signature";
        break;
      case -7:
        errorMessage = errorMessageTemplate + "Error document request";
        break;
      case -6:
        errorMessage = errorMessageTemplate + "Error database";
        break;
      case -5:
        errorMessage = errorMessageTemplate + "Incorrect password";
        break;
      case -4:
        errorMessage = errorMessageTemplate + "Error download error";
        break;
      case -3:
        errorMessage = errorMessageTemplate + "Error convertation error";
        break;
      case -2:
        errorMessage = errorMessageTemplate + "Error convertation timeout";
        break;
      case -1:
        errorMessage = errorMessageTemplate + "Error convertation unknown";
        break;
      case 0:  // if the error code is equal to 0, the error message is empty
        break;
      default:
        errorMessage = "ErrorCode = " + errorCode;  // default value for the error message
        break;
    }

    throw { message: errorMessage };
  }
  const commandRequest = async function (method: string, documentRevisionId: any, meta = null) {

    documentRevisionId = generateRevisionId(documentRevisionId);  // generate the document key value
    const params: Record<string, any> = {  // create a parameter object with command method and the document key value in it
      c: method,
      key: documentRevisionId
    };

    if (meta) {
      params.meta = meta;
    }

    var uri = siteUrl + commandUrl;  // get the absolute command url
    var headers: Record<string, any> = {};
    if (cfgSignatureEnable && cfgSignatureUseForRequest) {
      headers[cfgSignatureAuthorizationHeader] = cfgSignatureAuthorizationHeaderPrefix + fillJwtByUrl(uri, params);
      params.token = getToken(params);
    }

    //parse url to allow request by relative url after https://github.com/node-modules/urllib/pull/321/commits/514de1924bf17a38a6c2db2a22a6bc3494c0a959
    return await $fetch(uri, { method: 'POST', headers: headers, body: params })
    // urllib.request(urlModule.parse(uri),
    //     {
    //         method: "POST",
    //         headers: headers,
    //         data: params
    //     },
    //     callback);
  }
  return {
    getToken,
    readToken,
    checkJwtHeader,
    getConvertedUri,
    getResponseUri,
    commandRequest,
    generateRevisionId
  }
}
