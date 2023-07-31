import fs from "fs";
import { emitWarning } from "process";
import path from "path";
import { JwtPayload } from "jsonwebtoken";
const { cfgSignatureEnable, cfgSignatureUseForRequest } = useDocConfig()
const resWithoutError = {
  error: 0
}
const resWithError = {
  error: 1
}

interface TrackBody /*  extends Record<string, any> */ {
  // filename: string;
  filetype: string;
  forceSaveType: number;
  // userAddress: string;
  changesUrl: string;
  changesHistory: string;
  history: any;
  key: string;
  status: number;
  users: string[];
  actions: { type: number; userid: string }[];
  url: string;
  token?: string;
}

export default defineEventHandler(async (event) => {
  const { filename: queryFilename } = getQuery(event);
  const body = (await readBody(event)) as TrackBody;
  const docManager = useDocManager();
  const fileUtility = useFileUtility();
  const docService = useDocService();

  let version = 0;

  // track file changes
  const processTrack = async function () {
    // callback file saving process
    const callbackProcessSave = async function (
      downloadUri: string,
      newFilename: string
    ) {
      try {
        const { status, _data: data } = await $fetch.raw(downloadUri, { method: 'GET' })
        // const { status, data } = await urllib.request(downloadUri, {
        //   method: "GET",
        // });

        if (status != 200)
          throw new Error(
            "Document editing service returned status: " + status
          );

        const storagePath = docManager.storagePath(newFilename);

        let historyPath = docManager.historyPath(newFilename); // get the path to the history data
        if (!historyPath) {
          // if the history path doesn't exist
          historyPath = docManager.historyPath(newFilename, true); // create it
          docManager.createDirectory(historyPath!); // and create a directory for the history data
        }

        const count_version = docManager.countVersion(historyPath!); // get the next file version number
        version = count_version + 1;
        const versionPath = docManager.versionPath(
          newFilename,
          version
        ); // get the path to the specified file version
        docManager.createDirectory(versionPath); // create a directory to the specified file version

        const downloadZip = body.changesUrl;
        if (downloadZip) {
          const path_changes = docManager.diffPath(
            newFilename,
            version
          ); // get the path to the file with document versions differences
          const { status, _data: data } = await $fetch.raw(downloadZip, { method: 'GET' })
          // const { status, data } = await urllib.request(downloadZip, {
          //   method: "GET",
          // });
          if (status == 200) {
            fs.writeFileSync(path_changes, data as any); // write the document version differences to the archive
          } else {
            emitWarning("Document editing service returned status: " + status);
          }
        }

        const changeshistory =
          body.changesHistory || JSON.stringify(body.history);
        if (changeshistory) {
          const path_changes_json = docManager.changesPath(
            newFilename,
            version
          ); // get the path to the file with document changes
          fs.writeFileSync(path_changes_json, changeshistory); // and write this data to the path in json format
        }

        const path_key = docManager.keyPath(newFilename, version); // get the path to the key.txt file
        fs.writeFileSync(path_key, body.key); // write the key value to the key.txt file

        const path_prev = path.join(
          versionPath,
          "prev" + fileUtility.getFileExtension(filename)
        ); // get the path to the previous file version
        fs.renameSync(docManager.storagePath(filename), path_prev); // and write it to the current path

        fs.writeFileSync(storagePath, new DataView(await (data as Blob).arrayBuffer()));

        const forcesavePath = docManager.forcesavePath(
          newFilename,
          false
        ); // get the path to the forcesaved file
        if (forcesavePath) {
          // if this path is empty
          fs.unlinkSync(forcesavePath!); // remove it
        }
      } catch (ex) {
        console.log(ex);
        // response.write("{\"error\":1}");
        // response.end();
        return resWithError;
      }

      // response.write("{\"error\":0}");
      // response.end();
      return resWithoutError;
    };

    // file saving process
    const processSave = async function () {
      if (!body.url) {
        // response.write("{\"error\":1}");
        // response.end();
        return resWithError;
      }

      const curExt = fileUtility.getFileExtension(filename); // get current file extension
      const downloadExt = "." + body.filetype; // get the extension of the downloaded file

      let newFilename = filename;

      // convert downloaded file to the file with the current extension if these extensions aren't equal
      // exclude filename without ext
      if (curExt !== '' && downloadExt !== curExt) {
        const key = docService.generateRevisionId(body.url);
        newFilename = docManager.getCorrectName(
          fileUtility.getFilename(filename, true) + downloadExt
        ); // get the correct file name if it already exists
        try {
          return await docService
            .getConvertedUri(body.url, downloadExt, curExt!, key, true)
            .then(async (data) => {
              const res = docService.getResponseUri(data as string);
              return await callbackProcessSave(res.value, filename);
            })
            .catch(async (err) => {
              return await callbackProcessSave(body.url, newFilename);
            });
        } catch (ex) {
          console.log(ex);
        }
      }
      await callbackProcessSave(body.url, newFilename);
    };

    // callback file force saving process
    const callbackProcessForceSave = async function (
      downloadUri: string,
      newFilename = false
    ) {
      try {
        const { status, _data: data } = await $fetch.raw(downloadUri, { method: 'GET' })
        // const { status, data } = await urllib.request(downloadUri, {
        //   method: "GET",
        // });

        if (status != 200)
          throw new Error(
            "Document editing service returned status: " + status
          );

        const downloadExt = "." + body.filetype;

        const isSubmitForm = body.forceSaveType === 3; // SubmitForm

        let forcesavePath;

        if (isSubmitForm) {
          // new file
          if (newFilename) {
            filename = docManager.getCorrectName(
              fileUtility.getFilename(filename, true) + "-form" + downloadExt
            );
          } else {
            const ext = fileUtility.getFileExtension(filename);
            filename = docManager.getCorrectName(
              fileUtility.getFilename(filename, true) + "-form" + ext
            );
          }
          forcesavePath = docManager.storagePath(filename);
        } else {
          if (newFilename) {
            filename = docManager.getCorrectName(
              fileUtility.getFilename(filename, true) + downloadExt
            );
          }
          // create forcesave path if it doesn't exist
          forcesavePath = docManager.forcesavePath(
            filename,
            false
          );
          if (!forcesavePath) {
            forcesavePath = docManager.forcesavePath(
              filename,
              true
            );
          }
        }

        console.log('callbackProcessForceSave:', forcesavePath)
        fs.writeFileSync(forcesavePath!, data as any);

        if (isSubmitForm) {
          const uid = body.actions[0].userid;
          docManager.saveFileData(filename, uid, "Filling Form");
        }
      } catch (ex) {
        return resWithError;
        // response.write("{\"error\":1}");
        // response.end();
        // return;
      }

      return resWithoutError;
      // response.write("{\"error\":0}");
      // response.end();
    };

    // file force saving process
    const processForceSave = async function () {
      if (!body.url) {
        return resWithError;
        // response.write("{\"error\":1}");
        // response.end();
        // return;
      }

      const curExt = fileUtility.getFileExtension(filename);
      const downloadExt = "." + body.filetype;

      // convert downloaded file to the file with the current extension if these extensions aren't equal
      if (downloadExt != curExt) {
        const key = docService.generateRevisionId(body.url);
        try {
          return await docService
            .getConvertedUri(body.url, downloadExt, curExt!, key, true)
            .then(async (data) => {
              const res = docService.getResponseUri(data as string);
              return await callbackProcessForceSave(res.value, false);
            })
            .catch(async (err) => {
              return await callbackProcessForceSave(body.url, true);
            });
        } catch (ex) {
          console.log(ex);
        }
      }
      return await callbackProcessForceSave(body.url, false);
    };

    if (body.status == 1) {
      // editing
      if (body.actions && body.actions[0].type == 0) {
        // finished edit
        const user = body.actions[0].userid;
        if (body.users.indexOf(user) == -1) {
          const key = body.key;
          try {
            docService.commandRequest("forcesave", key); // call the forcesave command
          } catch (ex) {
            console.log(ex);
          }
        }
      }
    } else if (body.status == 2 || body.status == 3) {
      // MustSave, Corrupted
      return await processSave(); // save file
    } else if (body.status == 6 || body.status == 7) {
      // MustForceSave, CorruptedForceSave
      return await processForceSave(); // force save file
    }

    return resWithoutError
    // event.node.res.write(JSON.stringify(resWithoutError))

    // return {
    //   error: 0,
    // };
    // response.write("{\"error\":0}");
    // response.end();
  };

  // read request body
  // var readbody = async function (request, response, filename, userAddress) {
  //   var content = "";
  //   request.on('data', async function (data) {  // get data from the request
  //     content += data;
  //   });
  //   request.on('end', async function () {
  //     var body = JSON.parse(content);
  //     await processTrack(filename, userAddress);  // and track file changes
  //   });
  // };

  let filename = queryFilename as string //fileUtility.getFilename(queryFilename as string);

  // 判断是否启用jwt
  if (cfgSignatureEnable && cfgSignatureUseForRequest) {
    let payload;
    // 判断是否传入token
    if (body?.token) {
      // if request body has its own token
      payload = docService.readToken(body.token); // read and verify it
    } else {
      // 从请求头获取token
      const checkJwtHeaderRes = docService.checkJwtHeader(
        getRequestHeaders(event)
      ); // otherwise, check jwt token headers
      if (checkJwtHeaderRes) {
        // if they exist
        // TODO string unresolved
        // payload = (checkJwtHeaderRes as JwtPayload).payload // TODO checkJwtHeaderRes no need to use payload prop
        payload = checkJwtHeaderRes;
        // get user address and file name from the query
        if ((checkJwtHeaderRes as JwtPayload).query) {
          const query = (checkJwtHeaderRes as JwtPayload).query;
          if (query.filename) {
            filename = fileUtility.getFilename(query.filename);
          }
        }
      }
    }
    if (!payload) {
      // event.node.res.write(JSON.stringify(resWithError))
      // event.node.res.end()
      // return;
      return resWithError;
    }
    // event.node.res.write(JSON.stringify(await processTrack()))
    // event.node.res.end()
    return await processTrack()
  } else {
    // TODO still neet to determin that?
    // if (body.hasOwnProperty("status")) {  // if the request body has status parameter
    // event.node.res.write(JSON.stringify(await processTrack())) // track file changes
    // event.node.res.end()
    return await processTrack() // track file changes
    // } else {
    //   await readbody(req, res, filename, userAddress);  // otherwise, read request body first
    // }
  }
});
