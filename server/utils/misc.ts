import { PlaceholderType } from "index"

export const useMisc = () => {

  enum EditMode {
    Create = 1, Read = 2, Update = 3, Delete = 4
  }

  // const PlaceholderType: PlaceholderType
  // enum PlaceholderType  {
  //   TEXT = 'text',
  //   NUMBER = 'number',
  //   DATE = 'date'
  // }
  enum FileType {
    word = "word",
    cell = "cell",
    slide = "slide"
  }

  return {
    EditMode,
    // PlaceholderType,
    FileType
  }
}
