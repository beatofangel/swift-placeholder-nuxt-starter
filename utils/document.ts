import { pick } from 'lodash-es';
import type { Placeholder, ValidatePlaceholdersResult, PlaceholderStatistic } from '~/index'

export const useDocumentHelper = () => {
  const writeContentControl = (placeholder: Placeholder) => {
    const doc = { tag: placeholder.id, text: placeholder.value }
    window.docQueue.value.push({ doc })
  }
  const readAllContentControls = (placeholders: Placeholder[]) => {
    const dayjs = useDayJS()
    window.docConnector.callCommand('readAllContentControls', null, (ctrls: { name: string, value: any }[]) => {
      // console.log(ctrls)
      ctrls && ctrls.length > 0 && placeholders.forEach(placeholder => {
        const matched = ctrls.find(ctrl => placeholder.id == ctrl.name)
        if (matched) {
          switch (placeholder.type) {
            case 'date':
              if (dayjs(matched.value, placeholder.format).isValid()) {
                placeholder.value = matched.value
              } else {
                placeholder.value = dayjs().format(placeholder.format)
              }
              break;
            default:
              placeholder.value = matched.value
          }
        }
      })
    })
  }
  const unbindContentControl = (placeholder: Placeholder) => {
    var doc = placeholder.contentControls.map((cc: any) => {
      return {
        "Props": {
          InternalId: cc.InternalId,
          Tag: placeholder.name,
          // Id: cc.Id,
          // Lock: 3, // full access
        },
      }
    })
    console.log('UNBINDING CC', placeholder.id, placeholder.name)
    window.docQueue.value.push({ doc });
  }
  const bindContentControl = (placeholder: Placeholder) => {
    var doc = placeholder.contentControls.map((cc: any) => {
      return {
        "Props": {
          InternalId: cc.InternalId,
          Tag: placeholder.id,
          // Id: cc.Id,
          // Lock: 3, // full access
        },
        // TODO 如何保持格式？
        // "Script": `var oParagraph = Api.CreateParagraph();oParagraph.AddText("\$\{${placeholder.name || ''}\}");Api.GetDocument().InsertContent([oParagraph], true, {KeepTextOnly: true});`
      }
    })
    console.log('BINDING CC', placeholder.id, placeholder.name)
    window.docQueue.value.push({ doc });
  }
  // const moveCursorToStart = () => {
  //   window.connector.value.executeMethod("MoveCursorToStart", [true]);
  // }
  const validatePlaceholders = (placeholders: Placeholder[], withRead?: boolean, callback?: ((checkResult: ValidatePlaceholdersResult) => void)) => {
    // de version
    window.docConnector.executeMethod("GetAllContentControls", null, function (ctrls: any[]) {
      // console.log(ctrls);
      const result: ValidatePlaceholdersResult = { warning: false, distinctContentControls: [] }
      // 将文档中的占位符同步到列表中
      for (const placeholderInTab of placeholders) {
        const matchedCtrls = ctrls.filter(ctrl => ctrl.Tag === placeholderInTab.id)
        if (matchedCtrls.length > 0) {
          placeholderInTab.sync = true
          placeholderInTab.count = matchedCtrls.length
          placeholderInTab.contentControls = matchedCtrls
        }
      }
      withRead && readAllContentControls(placeholders)
      // console.log('Sync: cc', placeholders)
      for (const placeholderInTab of placeholders) {
        const matchedCtrls = ctrls.filter(ctrl => ctrl.Tag === placeholderInTab.id)
        if (matchedCtrls.length > 0) {
          // console.log(`Sync: placeholder<${placeholderInTab.name}x${matchedCtrls.length}> found.`)
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
        const dcc = result.distinctContentControls.find(dcc => dcc.Tag === ctrl.Tag)
        if (dcc) {
          dcc.contentControls.push({...pick(ctrl, ['InternalId', 'Tag', 'Id'])})
        } else {
          result.distinctContentControls.push({ Tag: ctrl.Tag, contentControls: [{...pick(ctrl, ['InternalId', 'Tag', 'Id'])}] })
        }
        if (placeholders.findIndex(placeholder => placeholder.id === ctrl.Tag) === -1) {
          console.warn(`Sync: unexpected contentControl{'InternalId: '${ctrl.InternalId}', Tag: '${ctrl.Tag}'} detected.`)
          result.warning = true
          result.invalid || (result.invalid = {})
          result.invalid.contentControls || (result.invalid.contentControls = [])
          // console.log(ctrl)
          result.invalid.contentControls.push({
            ...pick(ctrl, ['InternalId', 'Tag', 'Id'])
            // InternalId: ctrl.InternalId,
            // Tag: ctrl.Tag,
            // Lock: ctrl.Lock
          })
        }
      }
      callback && callback(result)
    });
  }
  return ref({
    validatePlaceholders,
    unbindContentControl,
    bindContentControl,
    writeContentControl,
    // moveCursorToStart
  })
}
