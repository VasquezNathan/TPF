import React, { Component } from "react"

async function update(state) {
    var newURI = document.getElementById("newURI").value;

    await state.contract.methods.setBaseURI(newURI).send({from: state.accounts[0] })
    console.log(String(await state.contract.methods.tokenURI(1).call()));
}

function ChangeURI(props) {
    
    if (props.owner == true){
        return(
            <div>
                <input id = "newURI" type="text"></input>
                <a href = "#" onClick={update.bind(this, props.this.state)}>update</a>
            </div>
        );
    }
    else {
        return (<></>);
    }

}

export default ChangeURI;