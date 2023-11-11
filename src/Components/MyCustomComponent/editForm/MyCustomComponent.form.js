const formiojs = require("formiojs");
const FieldEditForm = formiojs.Components.components.field.editForm;
const MyCustomComponentEditEvents = require("./MyCustomComponent.edit.events.js");

function MyCustomComponentForm(...extend) {
  return FieldEditForm(
    [
      {
        key: "events",
        label: "Events",
        weight: 90,
        components: MyCustomComponentEditEvents
      }
    ],
    ...extend
  );
}

module.exports = MyCustomComponentForm;
