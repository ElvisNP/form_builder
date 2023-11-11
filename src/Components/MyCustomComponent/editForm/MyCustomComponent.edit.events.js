const { Utils } = require("formiojs");

function getActions() {
  return [
    {
      label: "Action",
      widget: "html5",
      placeholder: "Select an action",
      tableView: true,
      data: {
        values: [
          {
            label: "Show Alert",
            value: "showAlert"
          },
          {
            label: "Store Value",
            value: "storeValue"
          },
          {
            label: "Excecute JS Function",
            value: "javascript"
          },
          {
            label: "Show Modal",
            value: "showModal"
          },
          {
            label: "Close Modal",
            value: "closeModal"
          },
          {
            label: "Navigate To",
            value: "navigateTo"
          }
        ]
      },
      key: "type",
      type: "select",
      input: true,
      clearOnHide: false
    },
    {
      type: "select",
      input: true,
      label: "Select Modal",
      key: "modal",
      dataSrc: "custom",
      valueProperty: "value",
      tableView: false,
      data: {
        custom(context) {
          return Utils.getContextComponents(context);
        }
      },
      customConditional({ row }) {
        return row.type === "showModal";
      },
      clearOnHide: false
    },
    {
      type: "textfield",
      key: "navigateUrl",
      label: "Enter a URL",
      placeholder: "http://www.google.com/",
      input: true,
      customConditional({ row }) {
        return row.type === "navigateTo";
      },
      clearOnHide: false
    },
    {
      type: "textfield",
      key: "alertMessage",
      label: "Message",
      placeholder: "Type a Alert Message !",
      input: true,
      customConditional({ row }) {
        return row.type === "showAlert";
      },
      clearOnHide: false
    },
    {
      weight: 10,
      type: "textarea",
      key: "javascript",
      rows: 5,
      editor: "ace",
      as: "javascript",
      input: true,
      tableView: false,
      placeholder: `Write a JS `,
      customConditional({ row }) {
        return row.type === "javascript";
      },
      clearOnHide: false
    },
    {
      type: "textfield",
      key: "storeKey",
      label: "Key",
      placeholder: "Key",
      input: true,
      customConditional({ row }) {
        return row.type === "storeValue";
      },
      clearOnHide: false
    },
    {
      type: "textfield",
      key: "storeValue",
      label: "value",
      placeholder: "Value",
      input: true,
      customConditional({ row }) {
        return row.type === "storeValue";
      },
      clearOnHide: false
    }
  ];
}
function getModules(eventType) {
  return [
    ...getActions(),
    // CallBacks
    {
      type: "panel",
      input: false,
      collapsible: "true",
      collapsed: true,
      label: "On Success",
      title: "On Success",
      clearOnHide: false,
      components: [
        {
          input: true,
          label: "Actions",
          key: "onSuccess",
          tableView: false,
          templates: {
            header:
              '<div class="row "> \n  <div class="col-6"><strong>{{ value.length }} {{ ctx.t("actions") }}</strong></div>\n</div>',
            row:
              '<div class="row"> \n  <div class="col-6">\n    <div>{{ row.type }}</div>\n  </div>\n  <div class="col-6"> \n    <div class="btn-group pull-right"> \n      <button class="btn  editRow"><i class="fa fa-edit bi bi-edit-lg"></i></button> \n      <button class="btn  text-danger removeRow"><i class="fa fa-trash bi bi-trash-lg"></i></button> \n    </div> \n  </div> \n</div>'
          },
          type: "editgrid",
          addAnother: "Add Action",
          saveRow: "Save Action",
          redrawOn: "data",
          components: [...getActions()],
          clearOnHide: false,
          hideLabel: true
        }
      ]
    },
    {
      type: "panel",
      input: false,
      collapsible: "true",
      collapsed: true,
      label: "On Failure",
      title: "On Failure",
      clearOnHide: false,
      components: [
        {
          input: true,
          label: "Actions",
          key: "onFailure",
          tableView: false,
          templates: {
            header:
              '<div class="row "> \n  <div class="col-6"><strong>{{ value.length }} {{ ctx.t("actions") }}</strong></div>\n</div>',
            row:
              '<div class="row"> \n  <div class="col-6">\n    <div>{{ row.type }}</div>\n  </div>\n  <div class="col-6"> \n    <div class="btn-group pull-right"> \n      <button class="btn  editRow"><i class="fa fa-edit bi bi-edit-lg"></i></button> \n      <button class="btn  text-danger removeRow"><i class="fa fa-trash bi bi-trash-lg"></i></button> \n    </div> \n  </div> \n</div>'
          },
          type: "editgrid",
          addAnother: "Add Action",
          saveRow: "Save Action",
          redrawOn: "data",
          components: [...getActions()],
          clearOnHide: false,
          hideLabel: true
        }
      ]
    }
  ];
}

function getComponent(eventType) {
  return [
    {
      type: "toggleButton",
      label: "JS",
      key: eventType + "JS",
      input: true,
      clearOnHide: false
    },
    {
      weight: 10,
      type: "textarea",
      key: eventType + "_liquidjs",
      rows: 5,
      editor: "ace",
      as: "javascript",
      customClass: "test",
      input: true,
      tableView: false,
      placeholder: `Write JS`,
      clearOnHide: false,
      customConditional({ row }) {
        return row[eventType + "JS"];
      }
    },
    {
      input: true,
      label: "Actions",
      key: eventType,
      tableView: false,
      templates: {
        header:
          '<div class="row "> \n  <div class="col-6"><strong>{{ value.length }} {{ ctx.t("actions") }}</strong></div>\n</div>',
        row:
          '<div class="row"> \n  <div class="col-6">\n    <div>{{ row.type }}</div>\n  </div>\n  <div class="col-6"> \n    <div class="btn-group pull-right"> \n      <button class="btn  editRow"><i class="fa fa-edit bi bi-edit-lg"></i></button> \n      <button class="btn  text-danger removeRow"><i class="fa fa-trash bi bi-trash-lg"></i></button> \n    </div> \n  </div> \n</div>'
      },
      type: "editgrid",
      addAnother: "Add Action",
      saveRow: "Save Action",
      redrawOn: "data",
      components: getModules(eventType),
      clearOnHide: false,
      hideLabel: true,
      customConditional({ row }) {
        return !row[eventType + "JS"];
      }
    }
  ];
}

module.exports = [
  {
    title: "OnTextChanged",
    collapsible: true,
    collapsed: true,
    type: "panel",
    input: true,
    tableView: false,
    components: getComponent("ontextchanged")
  },
  {
    title: "OnClick",
    collapsible: true,
    collapsed: true,
    type: "panel",
    input: true,
    tableView: false,
    components: getComponent("onclick")
  }
];
// module.exports = [CustomDisplay];
