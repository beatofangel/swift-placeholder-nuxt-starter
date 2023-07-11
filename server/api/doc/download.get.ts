import fs from 'fs'
import mime from 'mime'
import jwt from 'jsonwebtoken'
import path from 'path'
const {
  cfgSignatureSecret,
  cfgSignatureAuthorizationHeader,
  cfgSignatureAuthorizationHeaderPrefix,
  cfgSignatureEnable,
  cfgSignatureUseForRequest,
  storageConfigFolder
} = useDocConfig()

export default defineEventHandler(async (event) => {
  const { res } = event.node
  const docManager = useDocManager();
  const fileUtility = useFileUtility();

  const { filename: queryFilename } = getQuery(event);
  console.log('download origin filename:', queryFilename)
  const headers = getRequestHeaders(event)
  let filename = queryFilename as string // fileUtility.getFilename(queryFilename as string);

  // if (!!userAddress
  //   && cfgSignatureEnable && cfgSignatureUseForRequest) {
  //   const authorization = headers[cfgSignatureAuthorizationHeader]
  //   let token = ""
  //   if (authorization && authorization.startsWith(cfgSignatureAuthorizationHeaderPrefix)) {
  //     token = authorization.substring(cfgSignatureAuthorizationHeaderPrefix.length);
  //   }

  //   try {
  //     const decoded = jwt.verify(token, cfgSignatureSecret);
  //   } catch (err: any) {
  //     console.log('checkJwtHeader error: name = ' + err.name + ' message = ' + err.message + ' token = ' + token)
  //     res.statusCode = 403
  //     return;
  //   }
  // }

  console.log('working dir:', path.resolve(storageConfigFolder))
  let path2 = docManager.forcesavePath(filename, false) ?? docManager.storagePath(filename);  // get the path to the force saved document version
  console.log('download file from:', path2)

  res.setHeader("Content-Length", fs.statSync(path2).size);  // add headers to the response to specify the page parameters
  res.setHeader("Content-Type", mime.getType(path2)!);

  res.setHeader("Content-Disposition", "attachment; filename*=UTF-8\'\'" + encodeURIComponent(filename));

  var filestream = fs.createReadStream(path2);
  filestream.pipe(res);  // send file information to the response by streams
})
