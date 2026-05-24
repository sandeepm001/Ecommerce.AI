import { useEffect, useState } from 'react'
import React from 'react'
import Item from '../Item/Item'
import './Popular.css'
const Popular = () => {

  const [popularinmen,setPopularinmen] = useState([]);

  useEffect(()=>{
      fetch('http://localhost:4000/popularinmen')
      .then((response) => response.json())
      .then((data)=>setPopularinmen(data))
    },[])
  return (
    <div className='popular'>
        <h1>Popular In Men</h1>
        <hr />
        <div className="popular-items">
            {popularinmen.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
        </div>
    </div>
  )
}

export default Popular