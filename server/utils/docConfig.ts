import config from 'config'
import jwt from 'jsonwebtoken'
const cfgSignatureSecret: jwt.Secret = config.get('server.token.secret')
const cfgSignatureSecretExpiresIn: string = config.get('server.token.expiresIn')
const cfgSignatureEnable: boolean = config.get('server.token.enable');
const cfgSignatureUseForRequest: boolean = config.get('server.token.useforrequest');
const cfgSignatureAuthorizationHeader: string = config.get('server.token.authorizationHeader');
const cfgSignatureAuthorizationHeaderPrefix: string = config.get('server.token.authorizationHeaderPrefix');
const cfgSignatureSecretAlgorithmRequest: jwt.Algorithm = config.get('server.token.algorithmRequest');
const storageConfigFolder: string = config.get("server.storageFolder");
const converterUrl = config.get('server.converterUrl')
const siteUrl: string = config.get('server.siteUrl')
const commandUrl: string = config.get('server.commandUrl')

export const useDocConfig = () => {
  return {
    cfgSignatureSecret,
    cfgSignatureSecretExpiresIn,
    cfgSignatureEnable,
    cfgSignatureUseForRequest,
    cfgSignatureAuthorizationHeader,
    cfgSignatureAuthorizationHeaderPrefix,
    cfgSignatureSecretAlgorithmRequest,
    storageConfigFolder,
    converterUrl,
    commandUrl,
    siteUrl
  }
}
