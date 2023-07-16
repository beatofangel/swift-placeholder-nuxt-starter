import fs from "fs";
import path from "path";
const { storageConfigFolder, siteUrl } = useDocConfig()
const { generateRevisionId } = useDocService()

export enum FileType {
  word = "word",
  cell = "cell",
  slide = "slide"
}
export const useDocManager = () => {
  const fileUtility = useFileUtility();
  const runtimeConfig = useRuntimeConfig()
  const baseUrl = runtimeConfig.app.baseURL

  const existsSync = function (path: string) {
    let res = true;
    try {
      fs.accessSync(path, fs.constants.F_OK); // synchronously test the user's permissions for the directory specified by path; the directory is visible to the calling process
    } catch (e) {
      // the response is set to false, if an error occurs
      res = false;
    }
    return res;
  };

  const createDirectory = function (path: string) {
    if (!existsSync(path)) {
      fs.mkdirSync(path);
    }
  };

  const getCorrectName = function (filename: string) {
    const baseName = fileUtility.getFilename(filename, true); // get file name from the url without extension
    const ext = fileUtility.getFileExtension(filename); // get file extension from the url
    let name = baseName + ext; // get full file name
    let index = 1;

    while (existsSync(storagePath(name))) {
      // if the file with such a name already exists in this directory
      name = baseName + " (" + index + ")" + ext; // add an index after its base name
      index++;
    }

    return name;
  };

  const saveFileData = function (
    filename: string,
    userid: string,
    username: string,
  ) {
    // get full creation date of the document
    const date_create = fs.statSync(storagePath(filename)).mtime;
    const minutes =
      (date_create.getMinutes() < 10 ? "0" : "") +
      date_create.getMinutes().toString();
    const month =
      (date_create.getMonth() < 10 ? "0" : "") +
      (parseInt(date_create.getMonth().toString()) + 1);
    const sec =
      (date_create.getSeconds() < 10 ? "0" : "") +
      date_create.getSeconds().toString();
    const date_format =
      date_create.getFullYear() +
      "-" +
      month +
      "-" +
      date_create.getDate() +
      " " +
      date_create.getHours() +
      ":" +
      minutes +
      ":" +
      sec;

    const file_info = historyPath(filename, true); // get file history information
    createDirectory(file_info!); // create a new history directory if it doesn't exist

    fs.writeFileSync(
      path.join(file_info!, filename + ".txt"),
      date_format + "," + userid + "," + username
    ); // write all the file information to a new txt file
  };

  const getInternalExtension = function (fileType: string) {
    if (fileType == FileType.word)
      // .docx for word type
      return ".docx";

    if (fileType == FileType.cell)
      // .xlsx for cell type
      return ".xlsx";

    if (fileType == FileType.slide)
      // .pptx for slide type
      return ".pptx";

    return ".docx"; // the default value is .docx
  };
  const getCreateUrl = function (
    serverUrl: string,
    docType: string,
    userid: string,
    type: string,
    lang: string
  ) {
    const server = serverUrl;
    var ext = getInternalExtension(docType).replace(".", "");
    const handler =
      "/api/doc/editor?fileExt=" +
      ext +
      "&userid=" +
      userid +
      "&type=" +
      type +
      "&lang=" +
      lang;
    console.log('getCreateUrl', server + handler)
    return server + handler;
  };
  const getCallback = function (
    filename: string
  ) {
    const server: string = siteUrl
    const handler =
      "/api/doc/track?filename=" +
      encodeURIComponent(filename); // get callback handler
    console.log('getCallback', server + handler)
    return server + handler;
  };
  const getDownloadUrl = function (filename: string) {
    const server = siteUrl;
    var handler = "/api/doc/download?filename=" + encodeURIComponent(filename);
    console.log('getDownloadUrl', server + handler)
    return server + handler;
  }
  const storagePath = function (filename: string) {
    // const baseFilename = fileUtility.getFilename(filename); // get the file name with extension
    const directory = storageConfigFolder;
    createDirectory(directory); // create a new directory if it doesn't exist
    // return path.join(directory, baseFilename); // put the given file to this directory
    return path.join(directory, filename); // put the given file to this directory
  };
  const historyPath = function (
    filename: string,
    create?: boolean
  ) {
    let directory = storageConfigFolder;
    if (!existsSync(directory)) {
      return null;
    }
    directory = path.join(directory, filename + "-history");
    if (!create && !existsSync(path.join(directory, "1"))) {
      return null;
    }
    return directory;
  };
  const countVersion = function (directory: string) {
    let i = 0;
    while (existsSync(path.join(directory, "" + (i + 1)))) {
      // run through all the file versions
      i++; // and count them
    }
    return i;
  };
  const versionPath = function (
    filename: string,
    version: number
  ) {
    const hp = historyPath(filename, true); // get the path to the history of a given file or create it if it doesn't exist
    return path.join(hp!, "" + version);
  };
  const diffPath = function (
    filename: string,
    version: number
  ) {
    return path.join(versionPath(filename, version), "diff.zip");
  };
  const changesPath = function (
    filename: string,
    version: number
  ) {
    return path.join(
      versionPath(filename, version),
      "changes.txt"
    );
  };
  const keyPath = function (
    filename: string,
    version: number
  ) {
    return path.join(versionPath(filename, version), "key.txt");
  };
  const forcesavePath = function (
    filename: string,
    create?: boolean
  ) {
    const directory = storageConfigFolder;
    if (!existsSync(directory)) {
      // the directory with host address doesn't exist
      return null;
    }
    const historyDir = path.join(directory, filename + "-history"); // get the path to the history of the given file
    if (!create && !existsSync(historyDir)) {
      // the history directory doesn't exist and we are not supposed to create it
      return null;
    }
    createDirectory(historyDir); // create history directory if it doesn't exist
    const fullpath = path.join(historyDir, filename); // and get the path to the given file
    if (!create && !existsSync(fullpath)) {
      return null;
    }

    // let directory = storageConfigFolder;
    // if (!existsSync(directory)) {
    //   // the directory with host address doesn't exist
    //   return "";
    // }
    // directory = path.join(directory, filename + "-history"); // get the path to the history of the given file
    // if (!create && !existsSync(directory)) {
    //   // the history directory doesn't exist and we are not supposed to create it
    //   return "";
    // }
    // createDirectory(directory); // create history directory if it doesn't exist
    // directory = path.join(directory, filename); // and get the path to the given file
    // if (!create && !existsSync(directory)) {
    //   return "";
    // }
    return fullpath;
  };
  const getKey = function (filename: string) {
    // userAddress = userAddress || curUserHostAddress();
    let key = filename;  // get document key by adding local file url to the current user host address

    let histPath = historyPath(filename);  // get the path to the file history
    if (histPath) {  // if the path to the file history exists
      key += countVersion(histPath);  // add file version number to the document key
    }

    let stPath = storagePath(filename);  // get the storage path to the given file
    const stat = fs.statSync(stPath);  // get file information
    key += stat.mtime.getTime();  // and add creation time to the document key

    return generateRevisionId(key);  // generate the document key value
  }
  return {
    getCreateUrl,
    storagePath,
    historyPath,
    createDirectory,
    countVersion,
    versionPath,
    diffPath,
    changesPath,
    keyPath,
    forcesavePath,
    getCorrectName,
    saveFileData,
    getCallback,
    getKey,
    getDownloadUrl
  };
};
