import { Components, Templates } from "formiojs";
import Component from "formiojs/components/_classes/component/Component";
import { convertActionsToLiquidJS, convertLiquidJSToActions } from "../../App";

export default class ToggleButton extends Component {
  static schema(...extend) {
    return Component.schema({
      type: "toggleBtn",
      lable: "Toggle Button",
      key: "toggleBtnKey",
      customData: false
    });
  }

  static get builderInfo() {
    return {
      title: "Toggle Button Comp",
      icon: "home",
      group: "basic",
      weight: 0,
      schema: ToggleButton.schema()
    };
  }

  get inputInfo() {
    const info = super.elementInfo();
    info.type = "button";
    info.ref = this.refKey();
    info.changeEvent = "click";
    info.attr.type = this.component.inputType || "button";
    info.attr.class = "toggle-button-custom toggle-button-custom-inactive";
    if (this.component.name) {
      info.attr.name = `data[${this.component.name}]`;
    }
    info.attr.value = this.component.value ? this.component.value : 0;
    info.label = this.t(this.component.label, { _userInput: true });
    info.labelClass = this.labelClass;
    return info;
  }

  render(context) {
    return super.render(
      this.renderTemplate("mytemplate", {
        input: this.inputInfo,
        checked: this.checked,
        tooltip: this.interpolate(this.t(this.component.tooltip) || "", {
          _userInput: true
        }).replace(/(?:\r\n|\r|\n)/g, "<br />")
      })
    );
  }

  attach(element) {
    var inputId = this.refKey();
    let elementRef = { [inputId]: "single" };
    this.loadRefs(element, elementRef);

    /**
     * Example to Attach an Event listener
     */
    // this.addEventListener(this.refs[inputId], "click", () => {
    //   this.setValue(!this.refs[inputId].value);
    //   this.component.customData = !this.component.customData;
    //   this.emit("componentChange", this);
    // });

    this.input = this.refs[inputId];

    if (this.refs[inputId]) {
      // Attaching event listener to the component
      // this.inputInfo.changeEvent can be anything like 'click', 'change'...
      this.addEventListener(this.input, this.inputInfo.changeEvent, () => {
        this.setRootOutputSchemaValue();
        this.setValue(!this.getValue());
      });
      this.addShortcut(this.input);
    }
    return super.attach(element);
  }

  setRootOutputSchemaValue() {
    // Get the parent form using this.root.
    const form = this.root;
    // If JS state from enabled > disabled then convert liquidJS to actions
    // else actions > liquidJS
    if (this.input.checked) {
      if (this.data["ontextchanged_liquidjs"]) {
        const txtChange = form.getComponent("ontextchanged");
        if (txtChange)
          txtChange.setValue([
            convertLiquidJSToActions(this.data["ontextchanged_liquidjs"])
          ]);
      }
      if (this.data["onclick_liquidjs"]) {
        const onClk = form.getComponent("onclick");
        if (onClk)
          onClk.setValue([
            convertLiquidJSToActions(this.data["onclick_liquidjs"])
          ]);
      }
    } else {
      if (this.data["ontextchanged"])
        this.data["ontextchanged_liquidjs"] = convertActionsToLiquidJS(
          this.data["ontextchanged"]
        );

      if (this.data["onclick"])
        this.data["onclick_liquidjs"] = convertActionsToLiquidJS(
          this.data["onclick"]
        );
    }

    const txtChange = form.getComponent("ontextchanged");
    const onClk = form.getComponent("onclick");
    if (txtChange) {
      txtChange.setValue(
        convertLiquidJSToActions(this.data["ontextchanged_liquidjs"])
      );
    }
    if (onClk) {
      onClk.setValue(convertLiquidJSToActions(this.data["onclick_liquidjs"]));
    }
    // Trigger a form change event to update the output JSON schema (real-time schema update).
    form.emit("change", form.schema);
    this.emit("change", {
      state: "submitted",
      component: this.component
    });

    const otherComponent = this.root.components.filter(
      (component) =>
        component.component.key === "ontextchanged" ||
        component.component.key === "onclick"
    );

    // If the other component is found, redraw it.
    // It means re render the formio component
    if (otherComponent.length > 0) {
      otherComponent.forEach((element) => {
        element.redraw();
      });
    }
  }

  // Creating unique key based on component's id and key to uniquly identify formio components
  refKey() {
    return `${this.component.id}-${this.component.key}`;
  }

  get key() {
    return this.component.name ? this.component.name : super.key;
  }

  get checked() {
    if (this.component.name) {
      return this.dataValue === this.component.value;
    }
    return !!this.dataValue;
  }

  getValue() {
    const value = super.getValue();
    if (this.component.name) {
      return value
        ? this.setCheckedState(value)
        : this.setCheckedState(this.dataValue);
    } else {
      return value === "" ? this.dataValue : !!value;
    }
  }

  setValue(value, flags = {}) {
    if (
      this.setCheckedState(value) !== undefined ||
      (!this.input &&
        value !== undefined &&
        (this.visible ||
          this.conditionallyVisible() ||
          !this.component.clearOnHide))
    ) {
      const changed = this.updateValue(value, flags);
      if (this.isHtmlRenderMode() && flags && flags.fromSubmission && changed) {
        this.redraw();
      }
      return changed;
    }
    return false;
  }

  setCheckedState(value) {
    if (!this.input) {
      return;
    }
    if (this.component.name) {
      this.input.value =
        value === this.component.value ? this.component.value : 0;
      this.input.checked = value === this.component.value ? 1 : 0;
    } else if (value === "on") {
      this.input.value = 1;
      this.input.checked = 1;
    } else if (value === "off") {
      this.input.value = 0;
      this.input.checked = 0;
    } else if (value) {
      this.input.value = 1;
      this.input.checked = 1;
    } else {
      this.input.value = 0;
      this.input.checked = 0;
    }

    // Dynamically add/remove classes to update UI of 'JS' toggle button
    if (this.input.checked) {
      this.input.setAttribute("checked", true);
      this.removeClass(this.input, "toggle-button-custom-inactive");
      this.addClass(this.input, "toggle-button-custom-active");
    } else {
      this.input.removeAttribute("checked");
      this.removeClass(this.input, "toggle-button-custom-active");
      this.addClass(this.input, "toggle-button-custom-inactive");
    }
    return value;
  }
}

Components.addComponent("toggleButton", ToggleButton);

// Creating cutstom component using custom template
Templates.defaultTemplates["mytemplate"] = {
  form: (ctx) => {
    return `<div ref='${ctx.input.ref}' attr="${ctx.input.attr}" value=${ctx.input.attr.value} class="${ctx.input.attr.class}">
    ${ctx.input.label}
    </div>`;
  }
};
