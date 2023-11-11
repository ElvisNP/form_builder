const formiojs = require("formiojs");
const TextFieldComponent = formiojs.Components.components.textfield;

const MyCustomComponentForm = require("./editForm/MyCustomComponent.form.js");

// Hide the original TextFieldComponent from the form builder
TextFieldComponent.builderInfo = null;

class MyCustomComponent extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema(...extend, {
      type: "mycustomcomponent",
      label: "Custom Component New",
      key: "myCustomCompText"
    });
  }

  // Define the builder info for MyCustomComponent
  static get builderInfo() {
    return {
      title: "Custom Component",
      group: "basic",
      icon: "fas fa-i-cursor",
      weight: 70,
      documentation: "http://help.form.io/userguide/#textfield",
      schema: MyCustomComponent.schema()
    };
  }

  constructor(component, options, data) {
    super(component, options, data);
    this.checks = [];
  }

  /**
   * Called immediately after the component has been instantiated to initialize
   * the component.
   */
  addFocusBlurEvents() {}
  init() {
    super.init();
  }

  attach(element) {
    super.attach(element);
    var inputId = `${this.component.id}-${this.component.key}`;
    let elementRef = { [inputId]: "single" };
    this.loadRefs(element, elementRef);
    this.removeAllEvents();

    if (!this.refs.input) return;

    if (this.component?.ontextchanged?.length) {
      this.addEventListener(element, "keydown", () =>
        this.getAction(this.component.ontextchanged)
      );
    }
    if (this.component?.onclick?.length) {
      this.addEventListener(element, "click", () => {
        this.getAction(this.component.onclick);
      });
    }
  }

  //   type: "showAlert"
  // modal: ""
  // navigateUrl: ""
  // alertMessage: ""
  // javascript: ""
  // storeKey: ""
  // storeValue: ""
  // onSuccess: Array(0)

  getAction(data) {
    // This is the place where Event Listener will be triggered

    // Answers to the questions
    // 1. How we can catch those events: OnChange/OnClick event call alert function
    // 2. In Preview Which field is being changed

    data.forEach((item) => {
      switch (item.type) {
        case "showAlert":
          return alert(item.alertMessage);

        case "storeValue":
          // TODO:
          // Need to add custom logic here as per requirement
          localStorage.setItem(item.storeKey, item.storeValue);
          break;

        default:
          break;
      }
    });
  }

  detach() {
    return super.detach();
  }

  destroy() {
    return super.destroy();
  }

  getValue() {
    return super.getValue();
  }

  createInput(container) {
    super.createInput(container);
  }

  setValue(value, flags = {}) {
    return super.setValue(value, flags);
  }

  // Define your other methods like render(), attach(), getValue(), setValue() here...
  render(content) {
    return super.render();
  }
}

MyCustomComponent.editForm = (...args) => {
  const editForm = TextFieldComponent.editForm(...args);

  // Remove the existing tabs from editForm.components
  editForm.components = editForm.components.filter(
    (component) => component.type !== "tabs"
  );

  // Add the new tabs from MyCustomComponentForm to editForm.components
  // as of today 5/30/23 the editform extends the class which brings all of the default tabs as an array
  const customForm = MyCustomComponentForm();
  editForm.components.push(...customForm.components); //add .components to convert array to object

  // Remove the existing tabs from editForm.components
  let tabs = editForm.components.find((component) => component.type === "tabs")
    .components;

  const unwantedTabs = [
    "data",
    "validation",
    "api",
    // "logic",
    "layout",
    "addons"
  ];
  for (let i = tabs.length - 1; i >= 0; i--) {
    if (unwantedTabs.includes(tabs[i].key)) {
      tabs.splice(i, 1);
    }
  }

  return editForm;
};

module.exports = MyCustomComponent;
