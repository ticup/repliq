"use strict";

let repliq = require("repliq");

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
            ~{
                function groceryListHtml() {
                    ${groceryList}.map((item) => {
                        var li = <li> ${item}.name : item.count </li>;
                        item.onChange(()=> ${li}.innerHTML = ${item}.name + " : " + ${item}.count ;
                        li
                    });
                    /*
                        Also set up handlers on ${groceryList} to update the view if items get added/deleted
                     */
                }
            }
            <ul>
            ~{grocerylistHtml()}
            </ul>
            ${inputName}
            ${inputCount}
            ${submit}
        </html>
    );
}






