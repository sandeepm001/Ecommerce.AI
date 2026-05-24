import React from 'react'
import "./SubscribeNews.css"
const SubscribeNews = () => {
  return (
    <div className = 'news' >
        <h1>Get Exclusive Offers On Your Email</h1>
        <p>subscibe to the portal and stay updated</p>
        <div className="subscribe">
            <input type="text" placeholder='Enter your email' />
            <button>Subscribe</button>
        </div>
    </div>
  )
}

export default SubscribeNews