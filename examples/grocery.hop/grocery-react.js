"use strict";

let repliq = require("repliq");
let react  = require("react");

let goceryList = repliq({
    /*
     repliq code
     */
});


service index() {

    var inputName = <input placeholder="grocery name..." />
    var inputCount = <input placeholder="amount..." />
    var submit = <button onClick=~{ ${groceryList}.get(inputName.value).add(inputCount.value) } > Enter </button>

    return (
        <html>
        ~{ react(${groceryList}, render(list) => {
            <ul>
                list.map((item) =>
                    <li> ${item}.name : item.count </li> )
            </ul>
            })
        }
        </html>
    );
}