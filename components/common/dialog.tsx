import { defineComponent, ref, VNodeChild } from "vue";
import { VDialog } from "vuetify/components/VDialog";
import {
  VCard,
  VCardText,
  VCardActions,
} from "vuetify/components/VCard";
import { VBtn } from "vuetify/components/VBtn";
import { VIcon } from "vuetify/components/VIcon";
import { VToolbar, VToolbarTitle } from "vuetify/components/VToolbar";
// import { appName } from "@/composables";
import { VHover } from "vuetify/components/VHover";
// @ts-ignore
// import { isBoolean, isString } from "lodash";

// import "./CommonDialog.css";

// const validateAutoBoolean = (val: Boolean | String) => {
//   return (isString(val) && val == "auto") || isBoolean(val);
// };

// export interface CommonDialogProps {
//   width: number | string;
//   minWidth: number | string;
//   modelValue: boolean;
//   attach: string | boolean | Element;
//   title: string;
//   text: string;
//   info: boolean;
//   warning: boolean;
//   error: boolean;
//   persistent: boolean | "auto";
//   closable: boolean | "auto";
//   cancelable: boolean | "auto";
//   cancelButtonText: string;
//   okButtonText: string;
// }

export default defineComponent({
  name: "CommonDialog",
  props: {
    width: {
      type: [Number, String],
      default: "auto",
    },
    minWidth: {
      type: [Number, String],
      default: "300",
    },
    modelValue: {
      type: Boolean,
      default: true,
    },
    attach: {
      type: [String, Boolean, Element],
      default: false, //"#__nuxt", //".v-application",
    },
    title: {
      type: String,
      default: "",
    },
    text: {
      type: [String, Function],
      default: "[phCommonDialogText]",
      required: true,
    },
    info: Boolean,
    warning: Boolean,
    error: Boolean,
    persistent: {
      type: [Boolean, String],
      default: "auto",
      // validator: validateAutoBoolean,
    },
    closable: {
      type: [Boolean, String],
      default: "auto",
      // validator: validateAutoBoolean,
    },
    cancelable: {
      type: [Boolean, String],
      default: "auto",
      // validator: validateAutoBoolean,
    },
    cancelButtonText: {
      type: String,
      default: "取消",
    },
    okButtonText: {
      type: String,
      default: "确定",
    },
  },
  computed: {
    icon(): string {
      return this.dialogInfo
        ? "mdi-information"
        : this.dialogWarning
          ? "mdi-alert"
          : this.dialogError
            ? "mdi-information"
            : "mdi-blank";
    },
    iconColor(): string {
      return this.dialogInfo
        ? "primary"
        : this.dialogWarning
          ? "orange-darken-2"
          : this.dialogError
            ? "red"
            : "default";
    },
    dialogInfo(): boolean {
      if (this.info && (this.error || this.warning)) {
        console.warn("[info]属性设定无效");
      }
      return !this.error && !this.warning && this.info;
    },
    dialogWarning(): boolean {
      if (this.warning && this.error) {
        console.warn("[warning]属性设定无效");
      }
      return !this.error && this.warning;
    },
    dialogError(): boolean {
      return this.error;
    },
    dialogCancelable(): boolean {
      return this.cancelable == "auto"
        ? !this.dialogInfo
        : (this.cancelable as boolean);
    },
    dialogClosable(): boolean {
      return this.closable == "auto"
        ? this.dialogInfo && !this.dialogCancelable
        : (this.closable as boolean);
    },
    dialogPersistent(): boolean {
      return this.persistent == "auto"
        ? !this.dialogInfo || this.dialogCancelable
        : (this.persistent as boolean);
    },
  },
  emits: {
    closed: () => true,
    unmounted: () => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    "update:modelValue": (val: boolean) => true,
    ok: () => true,
    cancel: () => true,
  },
  methods: {
    onOk() {
      this.$emit("ok");
      this.visible = false;
      this.$emit("update:modelValue", this.visible);
    },
    onCancel() {
      this.$emit("cancel");
      this.visible = false;
      this.$emit("update:modelValue", this.visible);
    },
    onDialogClosed() {
      // console.log("onDialogClosed");
      this.$emit("closed");
    },
  },
  setup(props /* , ctx */) {
    const visible = ref(props.modelValue);
    return {
      visible,
    };
  },
  render() {
    return (
      <VDialog
        v-model={this.visible}
        width={this.width}
        minWidth={this.minWidth}
        persistent={this.dialogPersistent}
        // @ts-ignore
        onAfterLeave={this.onDialogClosed}
        attach={this.attach}
      >
        <VCard>
          <VToolbar color="white" density="compact" class={["pl-4", "d-flex"]}>
            <VIcon icon={this.icon} color={this.iconColor} start></VIcon>
            <VToolbarTitle class={["ml-0"]}>{this.title}</VToolbarTitle>
            {this.dialogClosable && (
              <VHover>
                {{
                  default: ({ isHovering, props }) => (
                    <VBtn
                      class={["v-btn--closable"]}
                      {...props}
                      ripple={false}
                      density="compact"
                      icon="mdi-close"
                      color={isHovering ? "red" : ""}
                      // @ts-ignore
                      onClick={this.onCancel}
                    ></VBtn>
                  ),
                }}
              </VHover>
            )}
          </VToolbar>
          <VCardText>
            {{
              default:
                this.text instanceof String || typeof this.text === "string"
                  ? () => this.text as string
                  : (this.text as () => VNodeChild),
            }}
          </VCardText>
          <VCardActions class={["justify-end"]}>
            {this.dialogCancelable && (
              <VBtn
                variant="text"
                // @ts-ignore
                onClick={this.onCancel}
              >
                {this.cancelButtonText}
              </VBtn>
            )}
            <VBtn
              color={this.iconColor}
              variant="elevated"
              // @ts-ignore
              onClick={this.onOk}
            >
              {this.okButtonText}
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    );
  },
});
