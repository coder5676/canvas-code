import React, { cloneElement, useEffect, useState } from "react";
import "./App.css";
import { Rnd } from "react-rnd";
import Button from "./tempaltecont.js/button";
import { useRef } from "react";
import Toolbox from "./components/toolbox";
import "./components/comp.css";
import cloneDeep from "lodash/cloneDeep"
import { add, isString, transform } from "lodash";
import Settings from "./components/Settings";

class Treenode {

  constructor(id, type, props = {}, actions = {}) {
    this.id = id;
    this.type = type;
    this.props = props;
    this.actions = actions;
    this.children = [];

  }

}



//-----------------------------------------------------------------------------------------



const RenderComponent = ({ json, selectedcomp, updatecomp }) => {

  

  if (!json || typeof json !== "object") return null;

  const { id, type, props = {}, children = [] } = json;
  const renderChildren = () => {
    if (!children) return null;
    if (typeof props.children==="string") return props.children;
    if (Array.isArray(children)){
      return children.map((child, index) =>
        typeof child === "string"
          ? child
          : (
            <RenderComponent
              key={child.id || index}
              json={child}
              selectedcomp={selectedcomp}
              updatecomp={updatecomp}
            />
          )
      );
    }
    return null;
  };

  const width = props?.style?.width||200;
  const height =props?.style?.height||100;
  const x = props?.x|| 0;
  const y = props?.y || 0;
 
  if (selectedcomp !== "root" && id === selectedcomp && type === "h1") {
 
    return (
      <Rnd
       bounds={"parent"}
        size={{ width, height }}
        position={{ x, y }}
        style={{
          ...props.style,
          zIndex: "40",
          position:"absolute",
          cursor:"pointer",
          backgroundColor:"transparent",
          borderRight:"2px solid black",
          borderColor:"black",
          borderStyle:"dotted"
          
        }}
        onDragStop={(e, d) => {
        
          updatecomp(id, {
            x: d.x,
            y: d.y,
            style: {
              ...props.style, 
              transform: `translate(${d.x}px, ${d.y}px)`
            },
          });
        }}
        
        onResizeStop={(e, dir, ref, delta, pos) => {
          
          updatecomp(id, {
          
            x: pos.x,
            y: pos.y,
            style: {
              ...props.style,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            },
          });
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            height:"fit-content",
            width: "fit-content",
            outline: "none", // Prevent outline on focus
            overflowWrap: "break-word",
            position:"absolute",
           border:"1px solid dodgerblue",
           padding:"10px",
           marginTop:`${parseInt(props.style.fontSize)-parseInt(props.style.fontSize)/3}px`,
          }}
          onBlur={(e) => {
            const element = e.currentTarget;
      const newWidth = element.scrollWidth;
      const newHeight = element.scrollHeight;
     

      updatecomp(id, {
        x,
        y,
        style: {
          ...props.style,
          width: newWidth,
          height: newHeight,
        
        },
        children: element.innerText, 
      });
          }

        }
        >
          {props.children}
        </div>
      </Rnd>
    );
     
  }

  

 
  if ( selectedcomp!="root" && id === selectedcomp && type!="h1") {
   
    return (
      <Rnd
      bounds="parent"
        size={{ width, height }}
        position={{ x, y }}
        style={{ ...props.style,zIndex:"40",border:"2px solid dodgerblue" ,position:"absolute"}}

        onDragStop={(e, d) => {
          updatecomp(id, {
            x: d.x,
            y: d.y,
            style: {
              ...props.style,
              transform:`translate(${d.x}px, ${d.y}px)`
                }
          });
        }}
        onResizeStop={(e, dir, ref, delta, pos) => {
          updatecomp(id, {
            x: pos.x,
            y: pos.y,
            style: {
              ...props.style,
              width: ref.offsetWidth,
              height: ref.offsetHeight
            }
          });
        }}
        onClick={(e)=>{
          e.stopPropagation();
        }

        }
       
      >

{ renderChildren()}
      </Rnd>
    );
  }

  
  
  return React.createElement(type, props, renderChildren());
};

//-------------------------------------------------------------------------------------------------------

function Canvaspart() {
  var componentCount=0;
  const [x, setx] = useState("none");
  //id of the selected element.
  const [selectedcomp, setselectedcomp] = useState("root");
const selectednode="";
  const [tree, setTree] = useState(() => {
    const root = new Treenode("root", "div", {style:{ width:'100%',
      backgroundColor: '#ffffff',
      height:"100vh",
      backgroundColor:"#fffffe",
      position:"absolute",
      scrollbarWidth: "none"}});
    return root;
  });




  const addnode = (rootnode, parentid, newnode) => {
    if (rootnode.id === parentid) {
      rootnode.children=[...(rootnode.children|| []),newnode]
      return true;
    }
    for (let child of rootnode.children) {
      if (addnode(child, parentid, newnode)) {
        return true;

      }
    }
    return false;

  }
  const findnodebyid = (id,nodetr) => {
    if (nodetr.id === id) {
      return nodetr
    }
    if (nodetr.children && nodetr.children.length > 0) {
      for (let child of nodetr.children) {
        const result = findnodebyid(id, child)
        if (result) {
          return result;
        }
      }
    }
    return null;

  }
  function addelement(passedid,type,props={}, onClick = [], parid) {
    setTree(prevTree => {
      const clonedTree = cloneDeep(prevTree);
      let id="";
      if(passedid===""){
       id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;}
      else{
        id=passedid
      }
      setselectedcomp(id);
  
      const handleClick = (e) => {
        e.stopPropagation();
        if (Array.isArray(onClick)) {
          onClick.forEach(actions => {
            const { funcname, param = [] } = actions;
            if (builtinfunctionmap[funcname]) {
              const { func } = builtinfunctionmap[funcname];
              const finalParams = param.map(p => p === "$id" ? id : p);
              func(...finalParams);
            }
          });
        }
      };
      const dragover=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          showid(id)
        }
        
       

      }

      const newNode = new Treenode(id, type, {
        ...props,
        onClick: handleClick,
        onDragOver:dragover
        
        
       
      });
  
      addnode(clonedTree, parid, newNode); // this modifies the clonedTree
      componentCount=componentCount+1;
      return clonedTree; // this is the updated tree passed back to React
    });
  }

  //************************************************************************************************* */


  function sayhello(d) {
    console.log(d);
  }


  function showid(id) {
    setselectedcomp(id);
  }
  
 
  //***************************************************************************************   */
  /*const rndcomp=(id)=>{

    const node=findnodebyid(id,tree);
    return(
    <Rnd
    size={{
      height:parseInt(node?.props?.style?.height)??100,
      width:parseInt(node?.props?.style?.width)??100
     }}
      position={{  
        x: node?.props?.x??10,
        y: node?.props?.y??10            
     
    }}    
    style={{
      backgroundColor:node?.props?.style?.backgroundColor??"aliceblue",
      border:node?.props?.style?.border??"1px solid darkblue",

    }}
   
    onDrag={(e,d)=>{
      updatecomp(
        node.id,
        {
          x:d.x,
          y:d.y,
          style:{
          transform:`translate(${d.x}px,${d.y}px)`,
                }
        }

      )
    }
    }

    onResize={(e,direction,ref,delta,position)=>{
      updatecomp(
        node.id,
        {
          x:position.x,
          y:position.y,
          style:{
            width:ref.style.width,
            height:ref.style.height
          }
        }
      )

    }}
  >
    <div><p>drag me</p></div>

  </Rnd>)

  }
*/

  const builtinfunctionmap = {
    "showid": {
      func: showid,
      params: [""]

    },
    "sayhello": {
      func: sayhello,
      params: ["hello"]
    },
  }
  const addsection=(height)=>{
   
    const windowheight=window.innerHeight;
    
    const posi=(height/100)-1;
    const newsectionposition=windowheight*posi;
    
console.log(newsectionposition)
    addelement("","div", {style:{
      backgroundColor:'#ecf6ff',
      marginTop:"0px",
      marginBottom:"0px",
      position:"absolute",
      width: '100%',
      height: '100vh',
      borderRadius:"0px",
      transform:`translate(0px,${newsectionposition}px)`
    },
    x:"0",
    y:`${newsectionposition}`

  
  }, [{ funcname: "showid", param: ["$id"] }], "root");
  }




  const topbutarray = [
    { id: "tm7", text: "File", icon: "File", func: "any" },
    { id: "tm8", text: "Learn", icon: "Help", func: "any" },
    { id: "tm1", text: "Undo", icon: <i className="fi fi-rr-undo-alt"></i>, func: "any" },
    { id: "tm2", text: "Redo", icon: <i className="fi fi-rr-redo-alt"></i>, func: "any" },
    { id: "tm3", text: "Preview", icon: <i className="fi-rr-screen"></i>, func: "any" },
    { id: "tm6", text: "Download", icon: <i className="fi-rr-folder-download"></i>, func: "any" },
    { id: "tm9", text: "Layouts", icon: "Layout", func: "any" },
    { id: "tm10", text: "Themes", icon: "Themes", func: "any" },
    { id: "tm12", text: "Background", icon: "Background", func: "any" },
    { id: "tm4", text: "Collaborate", icon: <i class="fi fi-rr-piggy-bank"> Collaborate</i>, func: "any" },
    { id: "tm5", text: "Share", icon: <i className="fi fi-rr-share"> Share</i>, func: "any" },
    { id: "tm14", text: "Build using AI", icon: <i className="fi fi-rr-leaf"> AI Sitemap</i>, func: "any" }
  ];


  
  const removenode = (targetid, rootnode) => {
    rootnode.children = rootnode.children.filter(child => child.id !== targetid);
    for (let child of rootnode.children) {
      removenode(targetid, child)
    }
  }

  const updateComponent = (id, newData, rootNode) => {
    if (rootNode.id === id) {
      Object.assign(rootNode, newData); // safely update
      return true;
    }

    for (let child of rootNode.children) {
      if (updateComponent(id, newData, child)) {
        return true;
      }
    }

    return false;
  }



  const updatecomp = (id, newdata) => {
    const clonedtree = cloneDeep(tree);
    const node = findnodebyid(id, clonedtree);
  
    if (node) {
      node.props = {
        ...node.props,
        ...newdata,
        style: {
          ...node.props?.style,
          ...newdata.style,
        }
      };
    }
  
    setTree(clonedtree);
  };
  
  

 
console.log(tree)
  const canref = useRef(null);
  const [sizes,setsizes]=useState({width:100,height:100,backgroundColor:"black",x:10,y:10})
var offset = componentCount*30;
  return (
    <>
      <div className="canmaincontainer">
        <div className="settop">
          <Toolbox buttarray={topbutarray} />
          <div className="hu">
            <h1> | </h1>
            <p>Screen size:</p>
            <select>
              <option>
                1:1
              </option>
              <option>
                3:1

              </option>
            </select>
          </div>
        </div>
        <div className="maincandiv">

          <div className="inputbox">
            <div className="inputdata">
              <Settings selectedcomp={findnodebyid(selectedcomp,tree)} updatecomp={updatecomp}/>
              <button 
              draggable
              onDragEnd={() => {
                addelement("","div", {style:{
                  backgroundColor:'#ecf6ff',
                  marginTop:"0px",
                  marginBottom:"0px",
                  position:"absolute",
                  width: '100%',
                  height: '100vh',
                  borderRadius:"0px",
                  transform:`translate(0px,0px)`
                },
              
              }, [{ funcname: "showid", param: ["$id"] }], "root");
              }}>

                Add a div
              </button>
              <button
              draggable
               onDragEnd={() => {
                addelement("","div", {style:{
                  backgroundColor: '#ffffdh',
                  height:"100vh",
                  width: '100%',
                  borderRadius:"0px",
                  position:"absolute",
                 transform:"translate(0px,1530px)"
                }
                ,x:"0",
                y:"1530",
                
                
              }, [{ funcname: "showid", param: ["$id"] }],"root");
              }}>
                Add a div2
              </button>
            

              <button onClick={() => {
  addelement("", "h1", {
    // To allow the user to edit the content
    style:{ 
      fontSize: "20px",
      border:"0px",
      color:"#000000",
      position:"absolute",
      backgroundColor:"transparent",
      fontWeight:"900",
     transform:"translate(0px,0px)",
     textAlign:"center"
    },
    x:"0",
    y:"0",
    children:"hello world"
  }, [{ funcname: "showid", param: ["$id"] }], selectedcomp);
}}>
  Add Heading (h1)
</button>
<button
  onClick={() => {
    const rootdata=findnodebyid("root",tree);
    const currentHeight = parseInt(rootdata?.props?.style?.height || 100);
    const newRootHeight = currentHeight + 100; // Increase height by 100vh
  console.log(rootdata,currentHeight,newRootHeight)
    // Update the root component height
    updatecomp("root", {
      style: {
        ...rootdata?.props?.style,
        height: `${newRootHeight}vh`,
      },
    });
  
    // Add the new section at the updated height
 addsection(newRootHeight)
  }}
>
  Add new section
</button>

              <button onClick={() => {
  addelement("", "button", {
    style: {
      paddingInline: "30px",
      borderRadius: "40px",
      backgroundColor: "#00000",
      color: "black",
      border: "0px",
      position: "absolute",
      transform: "translate(100px, 100px)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      fontWeight:"400",
      fontSize:"20px"
    },
    x: "100",
    y: "100",
    children:"hello"
  }, [{ funcname: "showid", param: ["$id"] }], selectedcomp);
}}>
  Add a button
</button>

  


             
            </div></div>

          <div className="canvas" ref={canref}>
          <RenderComponent json={tree} selectedcomp={selectedcomp} updatecomp={updatecomp}/>

          </div>
        </div>
      </div>
    </>
  );
}

export default Canvaspart;
