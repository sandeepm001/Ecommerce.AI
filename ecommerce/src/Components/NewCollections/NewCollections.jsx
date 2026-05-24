import React, { forwardRef, useEffect, useState } from 'react'

import Item from '../Item/Item';
import './NewCollections.css';

const NewCollections = forwardRef((props,ref) => {
  const [newCollection , setNewCollection] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:4000/newCollection')
    .then((response) => response.json())
    .then((data)=>setNewCollection(data))
  },[])
  return (
    <div ref={ref} className='new-collection'>
        <h1>New Collections</h1>
        <hr />
        <div className="new-collection-items">
            {newCollection.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
});

export default NewCollections