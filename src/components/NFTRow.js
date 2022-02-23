import React, { Component } from "react";

function NFTRow(props) {
    const img = String(props.atts && props.atts.image).replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    return (
        <div style={{display: "inline-block"}}>
            <p>#{props.atts && props.atts.id}</p> 
            <img src = {img}  width="100"></img>
        </div>
    );
}

export default NFTRow;