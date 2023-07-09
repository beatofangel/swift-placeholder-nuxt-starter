import path from "path"
import { useMisc } from "./misc"

export const useFileUtility = () => {
  const { FileType } = useMisc()
  const documentExts = [".doc", ".docx", ".oform", ".docm", ".dot", ".dotx", ".dotm", ".odt", ".fodt", ".ott", ".rtf", ".txt", ".html", ".htm", ".mht", ".xml", ".pdf", ".djvu", ".fb2", ".epub", ".xps", ".oxps"]
  const spreadsheetExts = [".xls", ".xlsx", ".xlsm", ".xlsb", ".xlt", ".xltx", ".xltm", ".ods", ".fods", ".ots", ".csv"]
  const presentationExts = [".pps", ".ppsx", ".ppsm", ".ppt", ".pptx", ".pptm", ".pot", ".potx", ".potm", ".odp", ".fodp", ".otp"]
  const getFilename = function (url: string, withoutExtension?: boolean) {
    if (!url) return "";

    return path.basename(url, withoutExtension ? path.extname(url) : undefined)

    // const urlParts = url.split("\\");
    // const fullname = urlParts.pop();
    // const fullnameParts = fullname!.split("/");
    // var filename = fullnameParts.pop()!;  // get the file name from the last part of the url
    // filename = filename.split("?")[0];

    // // get file name without extension
    // if (withoutExtension) {
    //     return filename.substring(0, filename.lastIndexOf("."));
    // }

    // return filename;
  }
  const getFileExtension = function (url: string, withoutDot?: boolean) {
    const ext = path.extname(url)

    return ext ? withoutDot ? ext.split('.')[1] : ext : ext

    // if (!url) return null;

    // var filename = getFilename(url);  // get file name from the given url

    // var filenameParts = filename.toLowerCase().split(".");

    // return withoutDot ? filenameParts.pop() : "." + filenameParts.pop();  // get the extension from the file name with or without dot
  }
  const getFileType = function (url: string) {
    var ext = getFileExtension(url);  // get the file extension from the given url

    if (ext) {
      if (documentExts.indexOf(ext) != -1) return FileType.word;  // word type for document extensions
      if (spreadsheetExts.indexOf(ext) != -1) return FileType.cell;  // cell type for spreadsheet extensions
      if (presentationExts.indexOf(ext) != -1) return FileType.slide;  // slide type for presentation extensions
    }

    return FileType.word;  // the default file type is word
  }

  return {
    getFileExtension,
    getFilename,
    getFileType
  }
}
