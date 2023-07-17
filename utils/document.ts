import type { Placeholder, ValidatePlaceholdersResult, PlaceholderStatistic } from '~/index'

export const useDocumentHelper = () => {
  const writeContentControl = (placeholder: Placeholder) => {
    window.connector.value.executeMethod("GetAllContentControls", null, function (data: any) {
      //console.log(ctrls);
      for (var ctrl of data) {
        //console.log(ctrl.InternalId);
        if (ctrl.Tag === placeholder.id) {
          const doc = [{
            "Props": {
              "InternalId": ctrl.InternalId
            },
            "Script": `var oParagraph = Api.CreateParagraph();oParagraph.AddText("${placeholder.value || ''}");Api.GetDocument().InsertContent([oParagraph], true, {KeepTextOnly: true});`
          }];
          window.docQueue.value.push({ doc });
        }
      }
    });
  }
  const moveCursorToStart = () => {
    window.connector.value.executeMethod("MoveCursorToStart", [true]);
  }
  const validatePlaceholders = (placeholders: Placeholder[], withWrite?: boolean, callback?: ((checkResult: ValidatePlaceholdersResult) => void)) => {
    window.connector.value.executeMethod("GetAllContentControls", null, function (ctrls: any[]) {
      console.log(ctrls);
      const result: ValidatePlaceholdersResult = { warning: false }
      // sync: existance
      for (const placeholderInTab of placeholders) {
        const matchedCtrls = ctrls.filter(ctrl => ctrl.Tag === placeholderInTab.id)
        if (matchedCtrls.length > 0) {
          console.log(`Sync: placeholder<${placeholderInTab.name}x${matchedCtrls.length}> found.`)
          placeholderInTab.sync = true
          placeholderInTab.count = matchedCtrls.length
          withWrite && writeContentControl(placeholderInTab)
          result.valid || (result.valid = {})
          result.valid.placeholders || (result.valid.placeholders = [])
          result.valid.placeholders.push(placeholderInTab)
        } else {
          console.warn(`Sync: placeholder<${placeholderInTab.name}> not found.`)
          result.warning = true
          result.invalid || (result.invalid = {})
          result.invalid.placeholders || (result.invalid.placeholders = [])
          result.invalid.placeholders.push(placeholderInTab)
        }
      }
      for (const ctrl of ctrls) {
        if (placeholders.findIndex(placeholder => placeholder.id === ctrl.Tag) === -1) {
          console.warn(`Sync: unexpected contentControl{'InternalId: '${ctrl.InternalId}', Tag: '${ctrl.Tag}'} detected.`)
          result.warning = true
          result.invalid || (result.invalid = {})
          result.invalid.contentControls || (result.invalid.contentControls = [])
          result.invalid.contentControls.push({
            InternalId: ctrl.InternalId,
            Tag: ctrl.Tag
          })
        }
      }
      callback && callback(result)
    });
  }
  return ref({
    validatePlaceholders,
    writeContentControl,
    moveCursorToStart
  })
}
