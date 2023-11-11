import React, { useState, useRef, useEffect } from "react";
import { FormBuilder, Form } from "@formio/react";
import ReactDOM from "react-dom";
import "./style.scss";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Formio } from "formiojs";
import "./Components/toggleButton/tb";
import AceEditor from "react-ace";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import MyCustomComponent from "./Components/MyCustomComponent/MyCustomComponent.js";
const acorn = require("acorn");

Formio.Components.addComponent("mycustomcomponent", MyCustomComponent);

// Formio.use(bulma);
ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict"
);

const App = () => {
  const [form, setForm] = useState({
    display: "form",

    components: []
  });
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFormChange = (updatedSchema) => {
    // Liquidjs builder start

    // TODO: Need to extend more for make every thing dynamic
    // For now showAlert and storeValue is implemented as a scope of the POC
    const cloneComponents = updatedSchema.components;
    cloneComponents.forEach((item) => {
      if (item.actions && item?.actions?.length) {
        let liquidjs = [];
        item.actions.forEach((i) => {
          if (i.type === "showAlert") {
            let onSuccess = "";
            let onFailure = "";

            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "showAlert"
            ) {
              onSuccess = `.then(()=>{showAlert('${i.onSuccess.alertMessage}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "showAlert"
            ) {
              onFailure = `.catch(()=>{showAlert('${i.onFailure.alertMessage}')})`;
            }
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "storeValue"
            ) {
              onSuccess = `.then(()=>{storeValue('${i.onSuccess.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "storeValue"
            ) {
              onFailure = `.catch(()=>{storeValue('${i.onFailure.storeKey}', '${i.onSuccess.storeValue}')})`;
            }

            Object.assign(i, {
              liquidjs: `showAlert('${i.alertMessage}')${onSuccess}${onFailure};`
            });
            liquidjs.push(
              `showAlert('${i.alertMessage}')${onSuccess}${onFailure}`
            );
          }

          if (i.type === "storeValue") {
            let onSuccess = "";
            let onFailure = "";
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "storeValue"
            ) {
              onSuccess = `.then(()=>{storeValue('${i.onSuccess.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "storeValue"
            ) {
              onFailure = `.catch(()=>{storeValue('${i.onFailure.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "showAlert"
            ) {
              onSuccess = `.then(()=>{showAlert('${i.onSuccess.alertMessage}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "showAlert"
            ) {
              onFailure = `.catch(()=>{showAlert('${i.onFailure.alertMessage}')})`;
            }

            Object.assign(i, {
              liquidjs: `storeValue('${i.storeKey}', '${i.storeValue}')${onSuccess}${onFailure};`
            });
            liquidjs.push(
              `storeValue('${i.storeKey}', '${i.storeValue}')${onSuccess}${onFailure}`
            );
          }
        });

        Object.assign(item, {
          liquidjs: liquidjs.join(";")
        });
      }
      if (item.liquidjs) {
        item.actions = [mainFunc(item.liquidjs)];
      }
    });

    // Liquidjs builder end

    if (isMounted.current) {
      setForm({
        display: "form",
        components: cloneComponents
      });
    }
  };

  return (
    <div className="App">
      <div className="form-builder-wrapper">
        <FormBuilder form={form} onChange={handleFormChange} />
      </div>

      <div className="form-preview-wrapper">
        <Card>
          <Card.Header>Rendered Form</Card.Header>
          <Card.Body>
            <Form
              key={JSON.stringify(form)}
              form={form}
              onChange={(event) => {
                // On Change event
                // This can be used to get current values for form fields
                console.log(event.data);
              }}
            />
          </Card.Body>
        </Card>
      </div>

      <div className="form-schema-wrapper">
        <Card className="text-center">
          <Card.Header>Real-time Schema</Card.Header>
          <Card.Body className="text-left">
            <AceEditor
              mode="json"
              theme="github"
              value={JSON.stringify(form, null, 2)}
              name="UNIQUE_ID_OF_DIV"
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2
              }}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");

ReactDOM.render(
  <React.StrictMode>
    <App components="{}" />
  </React.StrictMode>,
  rootElement
);

// ----------------------------Core Functions-----------------------------------
export function convertLiquidJSToActions(liquidJS) {
  return mainFunc(liquidJS);
}

export function convertActionsToLiquidJS(actions) {
  console.log(actions);
  let actionsString = "";
  function getActionToLiquid(action) {
    switch (action.type) {
      case "showAlert":
        return `${action.type}('${action.alertMessage}')`;

      case "storeValue":
        return `${action.type}('${action.storeKey}','${action.storeValue}')`;

      case "javascript":
        return `(${action.javascript})`;

      default:
        return "";
    }
  }

  actions.forEach((item) => {
    actionsString += getActionToLiquid(item);
    if (item.onSuccess) {
      const onSuccess = [];

      item.onSuccess.forEach((i) => {
        onSuccess.push(getActionToLiquid(i));
      });

      if (onSuccess.length) {
        actionsString += `.then(()=>{${onSuccess.join(";")}})`;
      }
    }
    if (item.onFailure) {
      const onFailure = [];

      item.onFailure.forEach((i) => {
        onFailure.push(getActionToLiquid(i));
      });

      if (onFailure.length) {
        actionsString += `.catch(()=>{${onFailure.join(";")}})`;
      }
    }
    actionsString += ";";
  });
  return actionsString;
}
function extractChainedFunctions(inputString) {
  const thenKeyword = ".then(";
  const catchKeyword = ".catch(";

  let mainFunction = "";
  let thenFunction = "";
  let catchFunction = "";

  // Extract the main function
  const thenIndex = inputString.indexOf(thenKeyword);
  const catchIndex = inputString.indexOf(catchKeyword);

  if (thenIndex !== -1 && (thenIndex < catchIndex || catchIndex === -1)) {
    mainFunction = inputString.substring(0, thenIndex);
  } else if (catchIndex !== -1) {
    mainFunction = inputString.substring(0, catchIndex);
  } else {
    mainFunction = inputString; // If no .then() or .catch() found, consider the entire input as the main function
  }

  // Extract the then function
  if (thenIndex !== -1 && (thenIndex < catchIndex || catchIndex === -1)) {
    const endBracketIndex = findMatchingClosingBracket(
      inputString,
      thenIndex + thenKeyword.length
    );
    if (endBracketIndex !== -1) {
      thenFunction = inputString
        .substring(thenIndex + thenKeyword.length, endBracketIndex)
        .trim();

      // Remove the anonymous function block
      const arrowIndex = thenFunction.indexOf("=>");
      if (arrowIndex !== -1) {
        thenFunction = thenFunction.substring(arrowIndex + 2).trim();
        if (thenFunction.startsWith("{")) {
          thenFunction = thenFunction
            .substring(1, thenFunction.length - 1)
            .trim();
        }
      }
    }
  }

  // Extract the catch function
  if (catchIndex !== -1) {
    const endBracketIndex = findMatchingClosingBracket(
      inputString,
      catchIndex + catchKeyword.length
    );
    if (endBracketIndex !== -1) {
      catchFunction = inputString
        .substring(catchIndex + catchKeyword.length, endBracketIndex)
        .trim();

      // Remove the anonymous function block
      const arrowIndex = catchFunction.indexOf("=>");
      if (arrowIndex !== -1) {
        catchFunction = catchFunction.substring(arrowIndex + 2).trim();
        if (catchFunction.startsWith("{")) {
          catchFunction = catchFunction
            .substring(1, catchFunction.length - 1)
            .trim();
        }
      }
    }
  }
  return {
    main: extractFunctions(mainFunction.trim()),
    then: extractFunctions(thenFunction),
    catch: extractFunctions(catchFunction)
  };
}

function findMatchingClosingBracket(str, startIndex) {
  let count = 1;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "(") {
      count++;
    } else if (str[i] === ")") {
      count--;
      if (count === 0) {
        return i;
      }
    }
  }
  return -1; // No matching closing bracket found
}

// To Parse the splitted arguments with its correct data type
function parseArgument(arg) {
  if (/^"(.+)"$/.test(arg) || /^'(.+)'$/.test(arg)) {
    return arg.slice(1, -1); // Remove the quotes for string
  } else if (/^-?\d*\.?\d+$/.test(arg)) {
    if (arg.includes(".")) {
      return parseFloat(arg); // Treat as float
    } else {
      return parseInt(arg, 10); // Treat as integer
    }
  } else if (arg.toLowerCase() === "true") {
    return true; // Treat as boolean true
  } else if (arg.toLowerCase() === "false") {
    return false; // Treat as boolean false
  } else {
    return arg; // Default: treat as a regular string
  }
}

function extractFunctions(str) {
  const regex = /(\w+)\((.*?)\)/g;
  const matches = [];

  let match = regex.exec(str);
  while (match !== null) {
    const functionName = match[1];
    const params = match[2]
      ? match[2].split(",").map((arg) => parseArgument(arg.trim()))
      : [];
    matches.push({ functionName, params });
    match = regex.exec(str);
  }

  return matches;
}
export function mainFunc(liquidjs) {
  return separateMethods(liquidjs.replace(/\r?\n|\r/g, "")).map((x) => {
    return submain(extractChainedFunctions(x));
  });
}

function submain(obj) {
  return {
    ...createCompnentSchemaFromFunctionBlock(obj.main[0]),
    onSuccess: obj.then.map((y) => createCompnentSchemaFromFunctionBlock(y)),
    onFailure: obj.catch.map((y) => createCompnentSchemaFromFunctionBlock(y))
  };
}

function createCompnentSchemaFromFunctionBlock(functionBlock) {
  if (!functionBlock?.functionName) {
    return;
  }

  let output = {
    type: functionBlock.functionName,
    modal: "",
    navigateUrl: "",
    alertMessage: "",
    javascript: "",
    storeKey: "",
    storeValue: ""
  };
  switch (functionBlock.functionName) {
    case "showAlert":
      output.alertMessage = functionBlock.params[0];
      break;
    case "storeValue":
      output.storeKey = functionBlock.params[0]; //As key will be at index 0
      output.storeValue = functionBlock.params[1]; //As value will be at index 0

    default:
      break;
  }
  return output;
}

function separateMethods(inputString) {
  const methods = [];
  let currentMethod = "";

  try {
    const ast = acorn.parse(inputString, {
      locations: false,
      ecmaVersion: "latest"
    });

    console.log("Ast", ast);
    // Loop over body to check how many block of code is their
    ast.body.forEach((element) => {
      methods.push(inputString.slice(element.start, element.end));
    });

    if (currentMethod.trim() !== "") {
      methods.push(currentMethod.trim());
    }
  } catch (error) {
    console.error("Error parsing the input string:", error);
  }

  return methods;
}
